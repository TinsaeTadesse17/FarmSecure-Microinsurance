import os
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use in‑memory SQLite for tests
env_db = "sqlite:///:memory:"
os.environ["DATABASE_URL"] = env_db
os.environ["USER_SERVICE_URL"] = "http://user_service:8000"
os.environ["POLICY_SERVICE_URL"] = "http://policy_service:8000"

# Single Engine shared by all sessions
engine = create_engine(
    env_db,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Import Base & get_db AFTER setting env
from src.database.db import Base, get_db
from src.main import app

# Create a TestingSessionLocal bound to our engine
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Override get_db dependency to use the testing session

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create / drop tables once per session
@pytest.fixture(scope="session", autouse=True)

def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Provide a TestClient
@pytest.fixture(scope="session")

def client():
    return TestClient(app)