# This file contains the backend-only Supabase Auth helpers.
# It verifies the Supabase access token that the frontend sends in the
# Authorization header, then maps that Supabase user to a local database user.
# It never sees raw passwords; Supabase Auth handles password security.

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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_supabase_admin_client():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Supabase Auth is not configured")

    # Auth: This uses the backend-only service role key to verify user tokens with Supabase.
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
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
