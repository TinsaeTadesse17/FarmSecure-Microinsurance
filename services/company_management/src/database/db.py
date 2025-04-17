import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

COMPANY_DB_USER = os.getenv("COMPANY_DB_USER","")
COMPANY_DB_PASS = os.getenv("COMPANY_DB_PASS","")
COMPANY_DB_HOST = os.getenv("COMPANY_DB_HOST","")
COMPANY_DB_PORT = os.getenv("COMPANY_DB_PORT","")
COMPANY_DB_NAME = os.getenv("COMPANY_DB_NAME","")

DATABASE_URL = f"postgresql://{COMPANY_DB_USER}:{COMPANY_DB_PASS}@{COMPANY_DB_HOST}:{COMPANY_DB_PORT}/{COMPANY_DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
