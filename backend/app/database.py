"""
Database connection setup for the SmartCloset backend.

This file is imported by almost every backend module because it creates the
shared SQLAlchemy objects used to talk to PostgreSQL. Think of it as the
backend's database "wiring":

- `DATABASE_URL` tells SQLAlchemy where PostgreSQL is running.
- `engine` is the long-lived object that manages database connections.
- `SessionLocal` creates short-lived database sessions for individual requests.
- `Base` is the parent class that all SQLAlchemy table models inherit from.

This file does not define tables by itself. Tables are defined in `models.py`.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Loads variables from a local `.env` file into `os.environ`.
# This lets local development use secrets/config without hardcoding them in code.
load_dotenv()

# This reads DATABASE_URL from the environment. If it is missing, the app falls
# back to a local PostgreSQL database so beginners can run the backend locally.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/smartclosetdb",
)

# Some hosting providers use the older `postgres://` prefix. SQLAlchemy expects
# `postgresql://`, so this keeps deployed database URLs compatible.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# The engine owns the connection pool. `pool_pre_ping=True` checks connections
# before using them, which helps avoid stale database connections in production.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# A Session is the object used to query, add, update, and delete database rows.
# `autocommit=False` means we explicitly call `db.commit()` when changes should
# be saved. `autoflush=False` avoids SQLAlchemy pushing changes before we ask.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Every model class inherits from Base. Later, `Base.metadata.create_all(...)`
# can inspect all model classes and create the matching database tables.
Base = declarative_base()
