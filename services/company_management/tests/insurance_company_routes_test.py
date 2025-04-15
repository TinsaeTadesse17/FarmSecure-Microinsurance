# tests/test_insurance_company_routes.py
import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure the src/ directory is in the path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app
from src.database.db import Base, get_db

# Use an SQLite database for testing.
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"  # Persistent on-disk test database
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency.
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
# Create tables in the test database.
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_create_company():
    payload = {
        "name": "Test Company",
        "licenseNo": "LIC123",
        "licensedBy": "Test Authority",
        "operationDate": "2023-04-01",
        "capital": 1000000.0,
        "country": "Testland",
        "city": "Testville",
        "phoneNo": "1234567890",
        "postalCode": "12345",
        "email": "test@example.com",
        "status": "pending"
    }
    response = client.post("/companies/register", json=payload)
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert data["name"] == "Test Company"
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_get_company():
    # First, create a company so we have one to retrieve.
    payload = {
        "name": "Test Company 2",
        "licenseNo": "LIC124",
        "licensedBy": "Test Authority",
        "operationDate": "2023-04-02",
        "capital": 2000000.0,
        "country": "Testland",
        "city": "Testville",
        "phoneNo": "1234567891",
        "postalCode": "12345",
        "email": "test2@example.com",
        "status": "pending"
    }
    post_response = client.post("/companies/register", json=payload)
    company = post_response.json()
    company_id = company["id"]

    # Retrieve the company.
    get_response = client.get(f"companies/{company_id}")
    assert get_response.status_code == 200, f"Response: {get_response.text}"
    data = get_response.json()
    assert data["id"] == company_id
    assert data["name"] == "Test Company 2"

def test_get_companies():
    # Retrieve list of companies.
    response = client.get("/companies")
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert isinstance(data, list)

def test_update_company():
    # Create a company with status "pending".
    payload = {
        "name": "Test Company 3",
        "licenseNo": "LIC125",
        "licensedBy": "Test Authority",
        "operationDate": "2023-04-03",
        "capital": 3000000.0,
        "country": "Testland",
        "city": "Testville",
        "phoneNo": "1234567892",
        "postalCode": "12345",
        "email": "test3@example.com",
        "status": "pending"
    }
    post_response = client.post("/companies/register", json=payload)
    company = post_response.json()
    company_id = company["id"]

    # Call the update (approve) endpoint.
    put_response = client.put(f"/companies/{company_id}/approve")
    assert put_response.status_code == 200, f"Response: {put_response.text}"
    data = put_response.json()
    # The update endpoint only changes status to "approved".
    assert data["status"] == "approved"

def test_generate_credentials(monkeypatch):
    # Prepare a dummy response for the external HTTP request.
    class DummyResponse:
        def __init__(self, status_code, json_data):
            self.status_code = status_code
            self._json_data = json_data
            self.text = str(json_data)
        def json(self):
            return self._json_data

    def dummy_post(url, json):
        if url == "http://localhost:8000/users":
            return DummyResponse(200, {"user_id": 1, "username": "testuser", "role": json["role"]})
        return DummyResponse(400, {"detail": "Error"})
    
    monkeypatch.setattr("httpx.post", dummy_post)
    
    # Call the credentials endpoint.
    response = client.post("/1/credentials?role=admin")
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert data["user_id"] == 1
    assert data["username"] == "testuser"
    assert data["role"] == "admin"
