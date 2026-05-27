# SmartCloset AI Backend

FastAPI backend for SmartCloset AI. It stores users, clothing items, outfits, and outfit item links in PostgreSQL using SQLAlchemy.

## Tech Stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn
- Pydantic

## Backend Structure

```text
backend/
+-- README.md
+-- requirements.txt
+-- app/
    +-- __init__.py
    +-- database.py
    +-- main.py
    +-- models.py
    +-- requirements.txt
    +-- schemas.py
```

## What Each File Does

- `app/main.py`: FastAPI app setup, CORS config, database table creation, and API routes.
- `app/database.py`: PostgreSQL database connection, SQLAlchemy engine, session setup, and base model.
- `app/models.py`: SQLAlchemy database table models for users, clothing, outfits, and outfit items.
- `app/schemas.py`: Pydantic request and response schemas used by the API.
- `requirements.txt`: Python dependencies needed to run the backend.

## Prerequisites

Install these before running the backend:

- Python 3.10 or newer
- PostgreSQL
- pip

The backend currently expects this database URL:

```text
postgresql://postgres:password@localhost:5432/smartclosetdb
```

That means your local PostgreSQL setup should have:

- username: `postgres`
- password: `password`
- database name: `smartclosetdb`
- port: `5432`

## Setup

From the project root:

```bash
cd smartcloset-ai/backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE smartclosetdb;
```

The tables are created automatically when the FastAPI app starts because `Base.metadata.create_all(bind=engine)` runs in `app/main.py`.

## Run the Backend

From `smartcloset-ai/backend`, run:

```bash
uvicorn app.main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Seed Demo User

The clothing and outfit routes currently use demo user ID `1`. Before adding clothes or outfits, create the demo user:

```bash
curl -X POST http://127.0.0.1:8000/seed-user
```

Expected response:

```json
{
  "message": "Demo user created",
  "user_id": 1
}
```

If the user already exists, the API returns:

```json
{
  "message": "User already exists"
}
```

## API Routes

### General

- `GET /`: Welcome message.
- `GET /health`: Health check.
- `POST /seed-user`: Creates the demo user with ID `1`.

### Clothes

- `POST /clothes`: Create a clothing item.
- `GET /clothes`: Get all clothing items.
- `PUT /clothes/{clothing_id}`: Update a clothing item.
- `DELETE /clothes/{clothing_id}`: Delete a clothing item.

### Outfits

- `POST /outfits`: Create an outfit.
- `GET /outfits/{outfit_id}`: Get one outfit.
- `PUT /outfits/{outfit_id}`: Update an outfit.
- `DELETE /outfits/{outfit_id}`: Delete an outfit.

## Example Requests

Create a clothing item:

```bash
curl -X POST http://127.0.0.1:8000/clothes \
  -H "Content-Type: application/json" \
  -d "{\"image_url\":\"https://example.com/shirt.jpg\",\"category\":\"shirt\",\"color\":\"white\",\"season\":\"summer\",\"occasion\":\"casual\",\"notes\":\"basic white tee\",\"is_favorite\":false}"
```

Create an outfit:

```bash
curl -X POST http://127.0.0.1:8000/outfits \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Casual Day\",\"source\":\"manual\",\"occasion\":\"casual\",\"notes\":\"simple outfit\",\"items\":[{\"clothing_id\":1,\"slot\":\"top\"}]}"
```

## Notes

- CORS is currently open with `allow_origins=["*"]`, which is convenient for local development.
- For production, replace the hardcoded database URL in `app/database.py` with an environment variable.
- The app does not currently include authentication. Routes use the demo user ID `1`.
