import pytest
import httpx
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.database.db import Base, get_db
from src.database.crud import policy_crud
from src.database.models.policy import Policy, PolicyDetail

# --- Database Test Setup ---------------------------------------------------
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create and drop all tables once per test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    """TestClient with overridden DB dependency."""
    client = TestClient(app)
    return client

@pytest.fixture
def mock_enrollment(monkeypatch):
    """Helper to mock external enrollment service responses."""
    def _mock(data=None, status_code=200, error=None):
        class MockResponse:
            def __init__(self, json_data, status_code, error):
                self._json = json_data or {}
                self.status_code = status_code
                self._error = error

            def raise_for_status(self):
                if self._error:
                    raise self._error
                if not (200 <= self.status_code < 300):
                    raise httpx.HTTPStatusError('Error', request=None, response=None)

            def json(self):
                return self._json

        def _mock_get(url, timeout):
            return MockResponse(data, status_code, error)

        monkeypatch.setattr(policy_crud.httpx, 'get', _mock_get)

    return _mock
