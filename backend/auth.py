"""
Admin authentication via Clerk.

The frontend sends the signed-in user's Clerk session token as
`Authorization: Bearer <token>`. We verify the token's signature against
Clerk's JWKS, then look the user up to check `public_metadata.role == "admin"`
(the same rule the frontend uses to show the Dashboard).

Set CLERK_SECRET_KEY in the backend environment to turn this on. Without it,
admin routes stay open (handy for local dev) and a warning is logged.
"""

import os
import json
import time
import logging
import urllib.request

import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException

log = logging.getLogger("auth")

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "").strip()
CLERK_API = "https://api.clerk.com/v1"
ROLE_CACHE_SECONDS = 60

# Clerk's API sits behind Cloudflare, which rejects Python's default
# "Python-urllib/x.y" user agent (error 1010), so always send our own.
CLERK_HEADERS = {
    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
    "User-Agent": "campus-problem-solver-api/1.0",
}

_jwks = (
    PyJWKClient(f"{CLERK_API}/jwks", headers=CLERK_HEADERS, cache_keys=True)
    if CLERK_SECRET_KEY
    else None
)
_role_cache: dict[str, tuple[float, bool]] = {}

if not CLERK_SECRET_KEY:
    log.warning("CLERK_SECRET_KEY is not set — admin endpoints are NOT protected.")


def _is_admin(user_id: str) -> bool:
    cached = _role_cache.get(user_id)
    if cached and time.time() - cached[0] < ROLE_CACHE_SECONDS:
        return cached[1]

    req = urllib.request.Request(f"{CLERK_API}/users/{user_id}", headers=CLERK_HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        user = json.load(resp)

    is_admin = (user.get("public_metadata") or {}).get("role") == "admin"
    _role_cache[user_id] = (time.time(), is_admin)
    return is_admin


def require_admin(authorization: str | None = Header(default=None)):
    """FastAPI dependency: allow the request only for Clerk users with the admin role."""
    if not CLERK_SECRET_KEY:
        return None

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in as an admin to do this.")
    token = authorization.split(" ", 1)[1].strip()

    try:
        key = _jwks.get_signing_key_from_jwt(token).key
    except jwt.PyJWKClientConnectionError:
        # Couldn't reach Clerk (network / bad secret key) — not the user's fault.
        log.exception("Could not fetch Clerk signing keys")
        raise HTTPException(status_code=503, detail="Could not verify admin access right now.")
    except jwt.PyJWTError as e:
        # e.g. token signed by a different Clerk app than CLERK_SECRET_KEY belongs to
        log.warning("Rejected admin token (signing key): %s", e)
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")

    try:
        claims = jwt.decode(token, key, algorithms=["RS256"], leeway=10)
    except jwt.PyJWTError as e:
        log.warning("Rejected admin token: %s", e)
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")

    user_id = claims.get("sub")
    try:
        allowed = bool(user_id) and _is_admin(user_id)
    except Exception:
        log.exception("Could not look up Clerk user %s", user_id)
        raise HTTPException(status_code=503, detail="Could not verify admin access right now.")

    if not allowed:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user_id
