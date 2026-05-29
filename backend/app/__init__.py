"""
SmartCloset backend package.

This file marks the `app` folder as a Python package, which allows imports like
`from app.main import app` or `from .database import SessionLocal`.

It does not need to run any code. The actual backend logic lives in the other
files in this folder:

- `main.py`: API routes and FastAPI app setup.
- `database.py`: database engine/session setup.
- `models.py`: SQLAlchemy table definitions.
- `schemas.py`: Pydantic API request/response shapes.
- `auth.py`: Supabase authentication helpers.
- `ai_metadata.py`: Gemini clothing image analysis.
"""
