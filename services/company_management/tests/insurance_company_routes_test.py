import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import httpx

# Ensure the src/ directory is in the path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app
from src.database.db import Base, get_db

# Use an SQLite database for testing.
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"  # persistent on-disk test database
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
Base.metadata.drop_all(bind=engine)  # clear existing tables to start fresh for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)


# ------------------------- CREATE COMPANY TESTS -------------------------

def test_create_company_success():
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

def test_create_company_duplicate_email():
    # Create a company first.
    payload = {
        "name": "Company Duplicate Email",
        "licenseNo": "LIC124",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-02",
        "capital": 2000000.0,
        "country": "CountryX",
        "city": "CityX",
        "phoneNo": "1234567891",
        "postalCode": "54321",
        "email": "dup@example.com",
        "status": "pending"
    }
    response1 = client.post("/companies/register", json=payload)
    assert response1.status_code == 200

    # Try to create a second company with the same email.
    payload2 = payload.copy()
    payload2["licenseNo"] = "LIC125"  # change other unique fields if needed
    payload2["phoneNo"] = "1234567899"  # different phone
    response2 = client.post("/companies/register", json=payload2)
    assert response2.status_code == 400, f"Response: {response2.text}"
    assert "Email already registered" in response2.text

def test_create_company_duplicate_phone():
    # Create a company first.
    payload = {
        "name": "Company Duplicate Phone",
        "licenseNo": "LIC126",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-03",
        "capital": 2500000.0,
        "country": "CountryY",
        "city": "CityY",
        "phoneNo": "1112223333",
        "postalCode": "67890",
        "email": "unique1@example.com",
        "status": "pending"
    }
    response1 = client.post("/companies/register", json=payload)
    assert response1.status_code == 200

    # Try to create a second company with the same phone.
    payload2 = payload.copy()
    payload2["licenseNo"] = "LIC127"
    payload2["email"] = "unique2@example.com"
    response2 = client.post("/companies/register", json=payload2)
    assert response2.status_code == 400, f"Response: {response2.text}"
    assert "Phone number already registered" in response2.text

def test_create_company_empty_required_field():
    # Try to create a company with an empty name.
    payload = {
        "name": "   ",
        "licenseNo": "LIC128",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-04",
        "capital": 1500000.0,
        "country": "CountryZ",
        "city": "CityZ",
        "phoneNo": "2223334444",
        "postalCode": "11223",
        "email": "empty@example.com",
        "status": "pending"
    }
    response = client.post("/companies/register", json=payload)
    assert response.status_code == 400, f"Response: {response.text}"
    assert "Company name cannot be empty" in response.text


# ------------------------- GET COMPANY TESTS -------------------------

def test_get_company_success():
    # Create a company.
    payload = {
        "name": "Test Company Get",
        "licenseNo": "LIC129",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-05",
        "capital": 1800000.0,
        "country": "CountryA",
        "city": "CityA",
        "phoneNo": "3334445555",
        "postalCode": "33445",
        "email": "get@example.com",
        "status": "pending"
    }
    post_response = client.post("/companies/register", json=payload)
    company = post_response.json()
    company_id = company["id"]

    # Retrieve the company.
    get_response = client.get(f"/companies/{company_id}")
    assert get_response.status_code == 200, f"Response: {get_response.text}"
    data = get_response.json()
    assert data["id"] == company_id
    assert data["name"] == "Test Company Get"

def test_get_company_not_found():
    # Get a company with an ID that does not exist.
    response = client.get("/companies/99999")
    assert response.status_code == 404, f"Response: {response.text}"
    assert "Company not found" in response.text


# ------------------------- GET COMPANIES TEST -------------------------

def test_get_companies_empty():
    # First, clear the DB tables and recreate them so no company exists.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    response = client.get("/companies")
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert data == []

def test_get_companies_non_empty():
    # Create a company for later listing.
    payload = {
        "name": "Test Company List",
        "licenseNo": "LIC130",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-06",
        "capital": 2200000.0,
        "country": "CountryB",
        "city": "CityB",
        "phoneNo": "4445556666",
        "postalCode": "55667",
        "email": "list@example.com",
        "status": "pending"
    }
    _ = client.post("/companies/register", json=payload)
    response = client.get("/companies")
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


# ------------------------- UPDATE COMPANY (APPROVE) TESTS -------------------------

def test_update_company_success():
    # Create a company with status "pending".
    payload = {
        "name": "Test Company Update",
        "licenseNo": "LIC131",
        "licensedBy": "Auth Authority",
        "operationDate": "2023-04-07",
        "capital": 3000000.0,
        "country": "CountryC",
        "city": "CityC",
        "phoneNo": "5556667777",
        "postalCode": "77889",
        "email": "update@example.com",
        "status": "pending"
    }
    post_response = client.post("/companies/register", json=payload)
    company = post_response.json()
    company_id = company["id"]

    # Call the approve endpoint.
    put_response = client.put(f"/companies/{company_id}/approve")
    assert put_response.status_code == 200, f"Response: {put_response.text}"
    data = put_response.json()
    # The update endpoint changes status to "approved".
    assert data["status"] == "approved"

def test_update_company_not_found():
    # Attempt to update a non-existent company.
    response = client.put("/companies/99999/approve")
    assert response.status_code == 404, f"Response: {response.text}"
    assert "Company not found" in response.text


# ------------------------- GENERATE CREDENTIALS TESTS -------------------------

def dummy_success_post(url, json):
    class DummyResponse:
        def __init__(self):
            self.status_code = 200
            self._json_data = {"user_id": 1, "username": "testuser", "role": json["role"]}
            self.text = str(self._json_data)
        def json(self):
            return self._json_data
    return DummyResponse()

def dummy_error_post(url, json):
    class DummyResponse:
        def __init__(self):
            self.status_code = 400
            self._json_data = {"detail": "Error occurred"}
            self.text = str(self._json_data)
        def json(self):
            return self._json_data
    return DummyResponse()

def dummy_invalid_json_post(url, json):
    class DummyResponse:
        def __init__(self):
            self.status_code = 200
            self.text = "Not a JSON response"
        def json(self):
            raise ValueError("No JSON")
    return DummyResponse()

def dummy_exception_post(url, json):
    raise httpx.RequestError("Connection failed")

def test_generate_credentials_success(monkeypatch):
    monkeypatch.setattr(httpx, "post", dummy_success_post)
    response = client.post("/companies/1/credentials?role=admin")
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert data["user_id"] == 1
    assert data["username"] == "testuser"
    assert data["role"] == "admin"

def test_generate_credentials_http_error(monkeypatch):
    monkeypatch.setattr(httpx, "post", dummy_error_post)
    response = client.post("/companies/1/credentials?role=user")
    assert response.status_code == 400, f"Response: {response.text}"
    assert "User service error" in response.text

def test_generate_credentials_invalid_json(monkeypatch):
    monkeypatch.setattr(httpx, "post", dummy_invalid_json_post)
    response = client.post("/companies/1/credentials?role=admin")
    assert response.status_code == 502, f"Response: {response.text}"
    assert "Invalid JSON response" in response.text

def test_generate_credentials_request_error(monkeypatch):
    monkeypatch.setattr(httpx, "post", dummy_exception_post)
    response = client.post("/companies/1/credentials?role=admin")
    assert response.status_code == 503, f"Response: {response.text}"
    assert "Failed to contact user service" in response.text
