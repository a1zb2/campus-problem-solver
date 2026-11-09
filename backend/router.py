import os
import logging

from database import CATEGORY_DEPARTMENT_MAP, FALLBACK_DEPARTMENT, now_iso

log = logging.getLogger("router")

DEPARTMENT_EXECUTIVES = {
    "Maintenance Department": {
        "name": "Mr. Rajesh Kumar",
        "email": "maintenance@campus.edu",
        "phone": "+91-9800000001",
    },
    "Dean of Students Office": {
        "name": "Dr. Sunita Sharma",
        "email": "dean.students@campus.edu",
        "phone": "+91-9800000002",
    },
    "Hostel & Mess Committee": {
        "name": "Mr. Anil Verma",
        "email": "mess.committee@campus.edu",
        "phone": "+91-9800000003",
    },
    "Academic Office": {
        "name": "Dr. Priya Nair",
        "email": "academics@campus.edu",
        "phone": "+91-9800000004",
    },
    "General Administration": {
        "name": "Ms. Kavita Singh",
        "email": "admin@campus.edu",
        "phone": "+91-9800000005",
    },
}

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notifications.log")


def get_executive_for_department(department: str) -> dict:
    return DEPARTMENT_EXECUTIVES.get(department, DEPARTMENT_EXECUTIVES[FALLBACK_DEPARTMENT])


def resolve_department(classification: dict) -> str:
    """Low-confidence results go to General Administration for a human to triage."""
    if classification.get("fallback"):
        return FALLBACK_DEPARTMENT
    return CATEGORY_DEPARTMENT_MAP.get(classification.get("category"), FALLBACK_DEPARTMENT)


def log_notification(problem: dict, executive: dict):
    """Log a routing notification (simulates emailing the department)."""
    entry = f"""
==========================================
[{now_iso()}] NEW PROBLEM ROUTED
==========================================
Tracking ID  : {problem.get('id')}
Category     : {problem.get('category')}
Confidence   : {problem.get('confidence') or 0:.0%}
Department   : {problem.get('department')}
Assigned To  : {executive['name']} ({executive['email']})
Description  : {problem.get('description')}
==========================================
"""
    log.info(entry)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(entry)
    except OSError:
        log.warning("Could not write to %s", LOG_FILE)
