import pytest
import httpx
from datetime import datetime
from fastapi.testclient import TestClient
from fastapi import HTTPException

from src.schemas.enrolement_schema import EnrolementResponse
from src.schemas.customer_schema import CustomerRequest

# ISO format for date strings
ISO = "%Y-%m-%dT%H:%M:%SZ"

@pytest.mark.usefixtures("setup_test_db")
class TestEnrolementAPI:
    def make_payload(self):
        now = datetime.utcnow()
        later = now.replace(year=now.year + 1)
        return {
            "f_name": "Alice",
            "m_name": "B",
            "l_name": "Carroll",
            "account_no": "ACC-001",
            "account_type": "checking",
            "user_id": 10,
            "sum_insured": 5000.0,
            "ic_company_id": 2,
            "branch_id": 3,
            "premium": 100.0,
            "date_from": now.strftime(ISO),
            "date_to": later.strftime(ISO),
            "receipt_no": "RCP123",
            "product_id": 7,
            "cps_zone": 1,
        }

    def test_list_enrolements_empty(self, client: TestClient):
        resp = client.get("/enrollments/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_enrolement_success(self, client: TestClient, monkeypatch):
        class DummyCust:
            def create_customer(self, req: CustomerRequest) -> int:
                assert isinstance(req, CustomerRequest)
                return 5

        class DummyEnr:
            def create_enrolement(self, req, cid):
                assert cid == 5
                return {"enrolement_id": 99, "createdAt": "2025-04-01T12:00:00Z"}

        monkeypatch.setattr(
            "src.routes.enrolement.CustomerService", lambda db: DummyCust()
        )
        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService", lambda db: DummyEnr()
        )

        payload = self.make_payload()
        response = client.post("/enrollments/", json=payload)
        assert response.status_code == 201, response.text

        data = response.json()
        model = EnrolementResponse(**data)
        assert model.enrolement_id == 99
        assert model.customer_id == 5
        assert model.status == "pending"

    def test_create_enrolement_customer_already(self, client: TestClient, monkeypatch):
        class DummyCust:
            def create_customer(self, req):
                raise HTTPException(status_code=400)

        monkeypatch.setattr(
            "src.routes.enrolement.CustomerService", lambda db: DummyCust()
        )
        resp = client.post("/enrollments/", json=self.make_payload())
        assert resp.status_code == 400
        assert "Customer already enrolled" in resp.text

    def test_read_enrolement_success(self, client: TestClient, monkeypatch):
        class DBObj:
            enrolment_id = 55
            createdAt = "2025-04-02T09:00:00Z"
            customer_id = 8
            user_id = 10
            status = "pending"
            ic_company_id = 2
            branch_id = 3
            premium = 150.0
            sum_insured = 7500.0
            date_from = "2025-05-01T00:00:00Z"
            date_to = "2026-05-01T00:00:00Z"
            receipt_no = "R55"
            product_id = 9
            cps_zone = 2

        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.get_enrolement",
            lambda self, eid: DBObj()
        )
        resp = client.get("/enrollments/55")
        assert resp.status_code == 200
        assert EnrolementResponse(**resp.json()).enrolement_id == 55

    def test_read_enrolement_not_found(self, client: TestClient, monkeypatch):
        def raise_404(self, eid):
            raise HTTPException(status_code=404, detail="Enrollment not found")

        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.get_enrolement", raise_404
        )
        resp = client.get("/enrollments/123")
        assert resp.status_code == 404

    def test_list_enrolements_non_empty(self, client: TestClient, monkeypatch):
        class DBObj:
            enrolment_id = 1
            createdAt = "2025-04-02T09:00:00Z"
            customer_id = 8
            user_id = 10
            status = "pending"
            ic_company_id = 2
            branch_id = 3
            premium = 150.0
            sum_insured = 7500.0
            date_from = "2025-05-01T00:00:00Z"
            date_to = "2026-05-01T00:00:00Z"
            receipt_no = "R1"
            product_id = 9
            cps_zone = 2

        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.get_enrolements",
            lambda self: [DBObj()]
        )
        resp = client.get("/enrollments/")
        assert resp.status_code == 200
        assert resp.json()[0]["enrolement_id"] == 1

    def test_approve_enrolement_success(self, client: TestClient, monkeypatch):
        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.approve_enrolement",
            lambda self, eid: True
        )
        class Dummy:
            status_code = 200
            def raise_for_status(self): pass
        monkeypatch.setattr("httpx.post", lambda url, json: Dummy())

        resp = client.put("/enrollments/7/approve")
        assert resp.status_code == 200

    def test_approve_enrolement_policy_fail(self, client: TestClient, monkeypatch):
        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.approve_enrolement",
            lambda self, eid: True
        )
        monkeypatch.setattr(
            "httpx.post",
            lambda url, json: (_ for _ in ()).throw(httpx.RequestError("fail"))
        )
        resp = client.put("/enrollments/8/approve")
        assert resp.status_code == 500
        assert "Policy service request failed" in resp.text

    def test_reject_enrolement_success(self, client: TestClient, monkeypatch):
        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.reject_enrolement",
            lambda self, eid: {"status": "rejected"}
        )
        resp = client.put("/enrollments/9/reject")
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"

    def test_reject_enrolement_not_found(self, client: TestClient, monkeypatch):
        def raise_404(self, eid):
            raise HTTPException(status_code=404, detail="Not found")
        monkeypatch.setattr(
            "src.routes.enrolement.EnrolementService.reject_enrolement",
            raise_404
        )
        resp = client.put("/enrollments/999/reject")
        assert resp.status_code == 404