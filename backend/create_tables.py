"""
Small helper script for creating database tables manually.

Normally the FastAPI app creates tables on startup in `app/main.py`. This script
is useful when you want to create the tables without starting the API server.
It imports all models, then asks SQLAlchemy to create any missing tables.
"""

from app.database import Base, engine
from app import models  # noqa: F401


def main():
    """
    Create all tables that are defined by SQLAlchemy models.

    `Base.metadata` is SQLAlchemy's registry of every model class that inherits
    from `Base`. Calling `create_all` compares those model definitions with the
    database and creates tables that do not exist yet.

    It does not delete existing tables, and it is not a full migration system.
    """

    Base.metadata.create_all(bind=engine)
    print("Database tables created or already exist.")


if __name__ == "__main__":
    main()
