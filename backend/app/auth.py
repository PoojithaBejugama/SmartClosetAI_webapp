"""
Authentication helpers for the backend.

The frontend logs users in with Supabase Auth. After login, the frontend sends a
Supabase access token to this backend in the HTTP `Authorization` header.

This file is responsible for:

1. Reading that token from the request.
2. Asking Supabase if the token is valid.
3. Finding or creating the matching local `User` row in our database.
4. Returning that local user to API routes.

The backend never receives raw passwords. Password handling is done by Supabase.
"""

import os
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from supabase import create_client

try:
    from . import models
    from .database import SessionLocal
except ImportError:
    import models
    from database import SessionLocal


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_db():
    """
    Create a database session for auth-related dependency injection.

    FastAPI dependency functions can `yield` a value. Code before `yield` runs
    before the request handler, and code after `yield` runs after the request is
    finished. Here that means:

    - Open a database session.
    - Let the route/auth code use it.
    - Always close it at the end so connections are not leaked.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_supabase_admin_client():
    """
    Build a Supabase client using the backend-only service role key.

    The service role key is powerful, so it must never be sent to the browser.
    We use it only on the server to verify access tokens and read Supabase Auth
    user information.

    If the environment variables are missing, the API raises a 500 error because
    auth cannot work without Supabase configuration.
    """

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Supabase Auth is not configured")

    # Auth: This uses the backend-only service role key to verify user tokens with Supabase.
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that returns the signed-in local database user.

    Routes use this function with `Depends(get_current_user)`. FastAPI then runs
    this function before the route body. If auth fails, this function raises an
    HTTP error and the route never runs.

    The flow is:

    1. Read the `Authorization: Bearer <token>` header.
    2. Send the token to Supabase to verify it.
    3. Look for a local user whose `supabase_user_id` matches Supabase's id.
    4. If the local user does not exist yet, create it.
    5. Return the local `models.User` object so routes can filter data by owner.
    """

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")

    token = authorization.replace("Bearer ", "", 1).strip()
    supabase = get_supabase_admin_client()

    try:
        response = supabase.auth.get_user(token)
        supabase_user = response.user
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid auth token") from exc

    if not supabase_user:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    user_metadata = supabase_user.user_metadata or {}
    name = user_metadata.get("name") or user_metadata.get("full_name") or supabase_user.email or "SmartCloset User"

    # Auth: This links Supabase Auth's UUID user id to our local integer users.id.
    local_user = (
        db.query(models.User)
        .filter(models.User.supabase_user_id == supabase_user.id)
        .first()
    )

    if local_user:
        return local_user

    # Auth: If this email already exists from older demo/manual data, attach the Supabase id to that row.
    existing_email_user = (
        db.query(models.User)
        .filter(models.User.email == (supabase_user.email or ""))
        .first()
    )
    if existing_email_user and existing_email_user.supabase_user_id is None:
        existing_email_user.supabase_user_id = supabase_user.id
        existing_email_user.name = existing_email_user.name or name
        db.commit()
        db.refresh(existing_email_user)
        return existing_email_user

    local_user = models.User(
        supabase_user_id=supabase_user.id,
        email=supabase_user.email or f"{supabase_user.id}@supabase.local",
        name=name,
    )
    db.add(local_user)
    db.commit()
    db.refresh(local_user)
    return local_user
