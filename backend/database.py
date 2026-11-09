"""
Storage layer.

Uses SQLite by default (zero setup, great for local dev). If a DATABASE_URL
pointing at Postgres is set, it uses that instead — which is what you want on
hosts like Render's free tier, where the local disk is wiped on every restart.

Uploaded photos are stored in the database too (not on disk), so they survive
restarts along with the complaints they belong to.
"""

import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
USE_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))
DB_PATH = os.getenv("SQLITE_PATH", os.path.join(BASE_DIR, "campus_problems.db"))

if USE_POSTGRES:
    import psycopg
    from psycopg.rows import dict_row

CATEGORY_DEPARTMENT_MAP = {
    "Bathroom & Hygiene": "Maintenance Department",
    "Anti-Ragging & Safety": "Dean of Students Office",
    "Mess & Food Quality": "Hostel & Mess Committee",
    "Academic Issues": "Academic Office",
    "Infrastructure/Maintenance": "Maintenance Department",
    "Other": "General Administration",
}

FALLBACK_DEPARTMENT = "General Administration"
VALID_STATUSES = ["Submitted", "In Progress", "Resolved"]


def now_iso() -> str:
    """UTC timestamp in ISO-8601 so the frontend can show it in local time."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------- Connection helpers ----------

@contextmanager
def _connect():
    if USE_POSTGRES:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _run(sql: str, params: tuple = (), fetch: str | None = None):
    """Run one statement. SQL is written with `?` placeholders for both engines."""
    if USE_POSTGRES:
        sql = sql.replace("?", "%s")
    with _connect() as conn:
        cur = conn.execute(sql, params)
        if fetch == "one":
            row = cur.fetchone()
            return dict(row) if row else None
        if fetch == "all":
            return [dict(r) for r in cur.fetchall()]
        return cur.rowcount


def init_db():
    blob = "BYTEA" if USE_POSTGRES else "BLOB"
    _run("""
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            image_path TEXT,
            category TEXT,
            confidence REAL,
            department TEXT,
            status TEXT DEFAULT 'Submitted',
            resolution TEXT,
            submitted_at TEXT,
            updated_at TEXT
        )
    """)
    _run(f"""
        CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            problem_id TEXT,
            content_type TEXT NOT NULL,
            data {blob} NOT NULL,
            created_at TEXT
        )
    """)


# ---------- Problems ----------

def insert_problem(
    description: str,
    category: str,
    confidence: float,
    department: str,
    image: tuple[bytes, str] | None = None,
) -> dict:
    """Insert a classified problem (and its optional photo). Returns the new row."""
    tracking_id = uuid.uuid4().hex[:8].upper()  # short, readable ID
    now = now_iso()

    image_path = None
    if image:
        data, content_type = image
        image_id = uuid.uuid4().hex
        _run(
            "INSERT INTO images (id, problem_id, content_type, data, created_at) VALUES (?, ?, ?, ?, ?)",
            (image_id, tracking_id, content_type, data, now),
        )
        image_path = f"/images/{image_id}"

    _run("""
        INSERT INTO problems
            (id, description, image_path, category, confidence, department, status, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?, ?)
    """, (tracking_id, description, image_path, category, confidence, department, now, now))

    return get_problem_by_id(tracking_id)


def get_problem_by_id(tracking_id: str):
    return _run("SELECT * FROM problems WHERE id = ?", (tracking_id,), fetch="one")


def get_all_problems(status: str | None = None, department: str | None = None):
    """Fetch problems, newest first, optionally filtered."""
    sql = "SELECT * FROM problems"
    clauses, params = [], []
    if status:
        clauses.append("status = ?")
        params.append(status)
    if department:
        clauses.append("department = ?")
        params.append(department)
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY submitted_at DESC"
    return _run(sql, tuple(params), fetch="all")


def update_status(tracking_id: str, status: str, resolution: str | None = None):
    _run("""
        UPDATE problems SET status = ?, resolution = ?, updated_at = ? WHERE id = ?
    """, (status, resolution, now_iso(), tracking_id))


def delete_problem(tracking_id: str):
    _run("DELETE FROM images WHERE problem_id = ?", (tracking_id,))
    _run("DELETE FROM problems WHERE id = ?", (tracking_id,))


def get_stats():
    row = _run("""
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END), 0) AS submitted,
            COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) AS in_progress,
            COALESCE(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0) AS resolved
        FROM problems
    """, fetch="one")
    return {k: int(v) for k, v in row.items()}


# ---------- Images ----------

def get_image(image_id: str):
    return _run("SELECT content_type, data FROM images WHERE id = ?", (image_id,), fetch="one")


# Initialize DB when this module is imported
init_db()
