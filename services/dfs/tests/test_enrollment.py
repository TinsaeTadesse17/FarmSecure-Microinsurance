

# tests/test_enrolement.py
import pytest
from fastapi import status
from sqlalchemy.orm import Session
from src.database.models.enrolement import EnrolementStatus
from src.schemas.enrolement_schema import EnrolementResponse

def test_create_enrolement(client, db: Session):
    # Test valid enrollment creation
    enrolement_data = {
        "f_name": "John",
        "m_name": "Middle",
        "l_name": "Doe",
        "account_no": "123456",
        "account_type": "savings",
        "user_id": 1,
        "ic_company_id": 1,
        "branch_id": 1,
        "premium": 1000.00,
        "sum_insured": 50000.00,
        "date_from": "2024-01-01",
        "date_to": "2024-12-31",
        "receipt_no": "RCPT-001",
        "product_id": 1,
        "cps_zone": "Zone1"
    }
    
    response = client.post("/api/enrolement/", json=enrolement_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    assert data["customer_id"] is not None
    assert data["status"] == "pending"
    assert data["receipt_no"] == enrolement_data["receipt_no"]

def test_get_enrolement(client, db: Session):
    # First create a test enrollment
    enrolement_data = {...}  # Same as above
    create_response = client.post("/api/enrolement/", json=enrolement_data)
    enrolement_id = create_response.json()["enrolement_id"]

    # Test getting the enrollment
    response = client.get(f"/api/enrolement/{enrolement_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["enrolement_id"] == enrolement_id
    assert data["status"] == "pending"

def test_list_enrolements(client, db: Session):
    # Create multiple enrollments
    for i in range(3):
        client.post("/api/enrolement/", json={
            "f_name": f"User{i}",
            "m_name": "Middle",
            "l_name": "Doe",
            "account_no": f"ACC00{i}",
            "account_type": "savings",
            # ... other fields
        })

    # Test listing all enrollments
    response = client.get("/api/enrolement/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert len(data) >= 3
    assert all(isinstance(item, dict) for item in data)

@pytest.mark.parametrize("action,expected_status", [
    ("approve", EnrolementStatus.approved),
    ("reject", EnrolementStatus.rejected)
])
def test_status_changes(client, db: Session, action, expected_status):
    # Create test enrollment
    create_response = client.post("/api/enrolement/", json={...})
    enrolement_id = create_response.json()["enrolement_id"]

    # Test status change
    response = client.put(f"/api/enrolement/{enrolement_id}/{action}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["status"] == expected_status

def test_duplicate_account_number(client, db: Session):
    # First create enrollment with unique account
    enrolement_data = {...}
    client.post("/api/enrolement/", json=enrolement_data)

    # Try to create duplicate
    response = client.post("/api/enrolement/", json=enrolement_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already enrolled" in response.json()["detail"]

def test_invalid_enrolement(client):
    # Test invalid enrollment ID
    response = client.get("/api/enrolement/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_missing_required_fields(client):
    response = client.post("/api/enrolement/", json={"f_name": "John"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY