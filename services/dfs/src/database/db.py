from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

# Primary database
enrolement_engine = create_engine(settings.ENROLEMENT_DATABASE_URL)
enrolement_sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=enrolement_engine)

# Secondary database
customer_engine = create_engine(settings.CUSTOMER_DATABASE_URL)
customer_sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=customer_engine)

# Base class for models (shared if models are in the same metadata)
Base = declarative_base()

# Dependency for primary database
def get_enrolement_db():
    db = enrolement_sessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for secondary database
def get_customer_db():
    db = customer_sessionLocal()
    try:
        yield db
    finally:
        db.close()
