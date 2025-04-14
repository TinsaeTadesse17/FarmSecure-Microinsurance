from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL (Get these from environment variables or .env file)
DB_USER = os.getenv("DB_USER", "insurance_user")
DB_PASS = os.getenv("DB_PASS", "insurance_pass")
DB_HOST = os.getenv("DB_HOST", "register_insurance_db")  # Docker service name
DB_PORT = os.getenv("DB_PORT", 5432)
DB_NAME = os.getenv("DB_NAME", "insurance_db")

# SQLAlchemy connection URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the engine (the "core" of SQLAlchemy) to connect to the DB
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a session local class to interact with the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models (to declare table mappings)
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
