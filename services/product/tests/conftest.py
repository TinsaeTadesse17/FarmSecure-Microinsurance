import os
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# 1) Point your app at an in‑memory DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
os.environ["DATABASE_URL"] = SQLALCHEMY_TEST_DATABASE_URL

# 2) Create one Engine that all sessions will share
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 3) Import your Base and get_db AFTER setting DATABASE_URL
from src.database.db import Base, get_db
from src.main import app

# 4) Bind a testing sessionmaker
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# 5) Override the dependency so FastAPI uses our TestingSessionLocal
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# 6) Create (and later drop) all tables once per test session
@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# 7) Provide a TestClient for your tests
@pytest.fixture(scope="session")
def client():
    return TestClient(app)
