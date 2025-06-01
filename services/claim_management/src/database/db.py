import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# DATABASE_URL = os.getenv("DATABASE_URL")
# Database URL (Get these from environment variables or .env file)
DB_USER = os.getenv("POSTGRES_USER", "claim_user")
DB_PASS = os.getenv("POSTGRES_PASS", "claim_password")
DB_HOST = os.getenv("POSTGRES_HOST", "claim_db") 
DB_PORT = os.getenv("POSTGRES_PORT", 5432)
DB_NAME = os.getenv("POSTGRES_DB", "claim_db")

# SQLAlchemy connection URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if not DATABASE_URL:
    raise Exception("DATABASE_URL environment variable not set")

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

