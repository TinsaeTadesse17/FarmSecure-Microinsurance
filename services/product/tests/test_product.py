import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database.db import Base, get_db

# Create a new SQLite database for testing purposes.
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the test database
Base.metadata.create_all(bind=engine)

# Dependency override for testing
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Optionally you can add setup/teardown code here (e.g., cleaning up DB tables)
    yield

def test_create_product():
    product_data = {
        "company_id": 1,
        "name": "Test Crop Insurance",
        "type": "crop",
        "elc": 1000.0,
        "commission_rate": 0.1
    }
    response = client.post("/api/products", json=product_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == "Test Crop Insurance"
    assert data["trigger_point"] == 15.0  # default value
    assert data["exit_point"] == 5.0      # default value

def test_get_product_not_found():
    response = client.get("/api/products/999")
    assert response.status_code == 404

def test_update_product():
    # First create a product
    product_data = {
        "company_id": 1,
        "name": "Test Livestock Insurance",
        "type": "livestock",
        "elc": 2000.0,
        "commission_rate": 0.2
    }
    create_response = client.post("/api/products", json=product_data)
    product = create_response.json()
    product_id = product["id"]

    update_data = {"name": "Updated Livestock Insurance", "commission_rate": 0.25}
    response = client.put(f"/api/products/{product_id}", json=update_data)
    assert response.status_code == 200, response.text
    updated_product = response.json()
    assert updated_product["name"] == "Updated Livestock Insurance"
    assert updated_product["commission_rate"] == 0.25

def test_calculate_premium():
    # Create a product first
    product_data = {
        "company_id": 1,
        "name": "Test Premium Product",
        "type": "crop",
        "elc": 1500.0,
        "commission_rate": 0.05,
        # trigger_point and exit_point left as default values
    }
    create_response = client.post("/api/products", json=product_data)
    product = create_response.json()
    product_id = product["id"]

    response = client.post(f"/api/products/{product_id}/calculate-premium")
    assert response.status_code == 200, response.text
    premium_data = response.json()
    # Calculate expected premium based on: ELC * ((15 + 5) / 100) + (commission_rate * ELC)
    expected_premium = 1500.0 * (20 / 100) + (0.05 * 1500.0)
    assert abs(premium_data["premium"] - expected_premium) < 0.01
