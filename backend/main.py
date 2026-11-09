import os
import sys
import logging
from typing import Optional

from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import Depends, FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database as db
from agent import classify_complaint
from auth import require_admin
from router import get_executive_for_department, log_notification, resolve_department

app = FastAPI(title="Campus Problem Solver API")

# Comma-separated list, e.g. "https://campus-problem-solver.vercel.app,http://localhost:5173"
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,  # we use bearer tokens, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MIN_DESCRIPTION, MAX_DESCRIPTION = 10, 2000

# Identify images by their magic bytes rather than trusting the filename / client header.
IMAGE_SIGNATURES = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"GIF87a", "image/gif"),
    (b"GIF89a", "image/gif"),
]


def sniff_image_type(data: bytes) -> Optional[str]:
    for sig, mime in IMAGE_SIGNATURES:
        if data.startswith(sig):
            return mime
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


class UpdateStatusRequest(BaseModel):
    status: str
    resolution: Optional[str] = None


# ---------- Routes ----------

# HEAD too, so Render's health check and uptime monitors get a 200.
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "Campus Problem Solver API is running."}


# Plain `def` (not async) so FastAPI runs it in a worker thread — the Gemini
# call is blocking and would otherwise stall every other request.
@app.post("/problems")
def submit_problem(
    description: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    description = description.strip()
    if len(description) < MIN_DESCRIPTION:
        raise HTTPException(status_code=400, detail="Description is too short.")
    if len(description) > MAX_DESCRIPTION:
        raise HTTPException(status_code=400, detail=f"Description is too long (max {MAX_DESCRIPTION} characters).")

    image_payload = None
    if image and image.filename:
        data = image.file.read(MAX_IMAGE_BYTES + 1)
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Photo is too large (max 5 MB).")
        mime = sniff_image_type(data)
        if not mime:
            raise HTTPException(status_code=400, detail="Photo must be a JPG, PNG, WEBP or GIF image.")
        image_payload = (data, mime)

    classification = classify_complaint(description)
    department = resolve_department(classification)
    executive = get_executive_for_department(department)

    problem = db.insert_problem(
        description,
        category=classification["category"],
        confidence=classification["confidence"],
        department=department,
        image=image_payload,
    )
    log_notification(problem, executive)

    return {
        "tracking_id": problem["id"],
        "category": problem["category"],
        "confidence": problem["confidence"],
        "department": department,
        "reasoning": classification["reasoning"],
        "fallback": classification["fallback"],
        "executive": executive,
        "image_url": problem["image_path"],
    }


@app.get("/problems", dependencies=[Depends(require_admin)])
def get_problems(status: Optional[str] = None, department: Optional[str] = None):
    return db.get_all_problems(
        status=None if status in (None, "", "All") else status,
        department=None if department in (None, "", "All") else department,
    )


@app.get("/problems/{tracking_id}")
def get_problem(tracking_id: str):
    problem = db.get_problem_by_id(tracking_id.strip().upper())
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found.")
    return problem


@app.patch("/problems/{tracking_id}", dependencies=[Depends(require_admin)])
def update_problem_status(tracking_id: str, body: UpdateStatusRequest):
    tracking_id = tracking_id.strip().upper()
    if not db.get_problem_by_id(tracking_id):
        raise HTTPException(status_code=404, detail="Problem not found.")
    if body.status not in db.VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {db.VALID_STATUSES}")

    resolution = (body.resolution or "").strip() or None
    db.update_status(tracking_id, body.status, resolution)
    return {"message": "Updated successfully."}


@app.delete("/problems/{tracking_id}", dependencies=[Depends(require_admin)])
def delete_problem(tracking_id: str):
    tracking_id = tracking_id.strip().upper()
    if not db.get_problem_by_id(tracking_id):
        raise HTTPException(status_code=404, detail="Problem not found.")
    db.delete_problem(tracking_id)
    return {"message": "Deleted successfully."}


@app.get("/stats", dependencies=[Depends(require_admin)])
def get_dashboard_stats():
    return db.get_stats()


@app.get("/images/{image_id}")
def get_image(image_id: str):
    image = db.get_image(image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found.")
    return Response(
        content=bytes(image["data"]),
        media_type=image["content_type"],
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        },
    )
