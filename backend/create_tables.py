from app.database import Base, engine
from app import models  # noqa: F401


def main():
    Base.metadata.create_all(bind=engine)
    print("Database tables created or already exist.")


if __name__ == "__main__":
    main()
