import os
import re
import json
import logging
from functools import lru_cache

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
log = logging.getLogger("agent")

# Both defaults are stable (non-preview) models. They're overridable via env vars
# so a future model retirement is a config change, not a code change, and if the
# primary fails (outage, rate limit, retired) we automatically retry on the fallback.
PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
LOW_CONFIDENCE = 0.5

CATEGORIES = [
    "Bathroom & Hygiene",
    "Anti-Ragging & Safety",
    "Mess & Food Quality",
    "Academic Issues",
    "Infrastructure/Maintenance",
    "Other",
]

SYSTEM_PROMPT = """You are a campus complaint classification agent.
Your job is to classify student complaints into exactly one of these categories:

1. Bathroom & Hygiene - issues with toilets, water, cleanliness in washrooms
2. Anti-Ragging & Safety - ragging, bullying, harassment, security concerns
3. Mess & Food Quality - food quality, mess timings, hygiene in dining hall
4. Academic Issues - exam, attendance, faculty, timetable, results
5. Infrastructure/Maintenance - electricity, fans, lights, furniture, building repairs
6. Other - anything that doesn't fit the above

You MUST respond with ONLY a valid JSON object, no extra text, no markdown, no backticks.
Format:
{{
  "category": "<one of the 6 categories exactly>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<one short sentence explaining why>"
}}"""

HUMAN_PROMPT = "Classify this student complaint: {complaint}"

PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", HUMAN_PROMPT),
])


@lru_cache(maxsize=4)
def _chain(model: str):
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
        timeout=30,
        max_retries=1,
    )
    return PROMPT | llm | StrOutputParser()


def _parse(raw: str) -> dict:
    """Pull the JSON object out of the model output, even if it added fences or chatter."""
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object in model output: {raw[:200]!r}")
    result = json.loads(match.group(0))

    category = result.get("category")
    if category not in CATEGORIES:
        category = "Other"
    try:
        confidence = max(0.0, min(1.0, float(result.get("confidence", 0.0))))
    except (TypeError, ValueError):
        confidence = 0.0

    return {
        "category": category,
        "confidence": confidence,
        "reasoning": str(result.get("reasoning") or "").strip() or "No reasoning provided.",
        "fallback": confidence < LOW_CONFIDENCE,
    }


def classify_complaint(complaint: str) -> dict:
    """
    Classify a student complaint using Gemini.
    Returns dict with category, confidence, reasoning and fallback flag.
    Never raises — on any failure it returns a low-confidence "Other" result
    so the complaint is still saved and sent for manual review.
    """
    if not os.getenv("GOOGLE_API_KEY"):
        log.error("GOOGLE_API_KEY is not set — skipping AI classification.")
        return _fallback("AI classifier is not configured; sent for manual review.")

    for model in dict.fromkeys([PRIMARY_MODEL, FALLBACK_MODEL]):  # de-dupe, keep order
        try:
            raw = _chain(model).invoke({"complaint": complaint})
            return _parse(raw)
        except Exception:
            log.exception("Classification with %s failed", model)

    return _fallback("AI classifier is temporarily unavailable; sent for manual review.")


def _fallback(reason: str) -> dict:
    return {"category": "Other", "confidence": 0.0, "reasoning": reason, "fallback": True}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_complaints = [
        "Bathroom on 3rd floor has no water since yesterday",
        "Senior students are forcing us to do their laundry and threatening us",
        "Food in mess has been stale and there are insects in the dal",
        "My attendance is showing wrong in the portal, I will lose my exam form",
        "The fan in room 204 is not working and it's very hot",
        "I lost my ID card near the library",
    ]

    for complaint in test_complaints:
        print(f"\nComplaint: {complaint}")
        result = classify_complaint(complaint)
        print(f"  Category   : {result['category']}")
        print(f"  Confidence : {result['confidence']:.0%}")
        print(f"  Reasoning  : {result['reasoning']}")
        print(f"  Fallback?  : {result['fallback']}")
