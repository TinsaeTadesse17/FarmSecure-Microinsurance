import pytest

from fastapi.testclient import TestClient

# client fixture is provided by conftest.py
@pytest.mark.usefixtures("setup_test_db")
class TestProductAPI:
    def test_create_product(self, client: TestClient):
        product_data = {
            "company_id": 1,
            "name": "Test Crop Insurance",
            "type": "crop",
            "elc": 1000.0,
            "commission_rate": 0.1
        }
        resp = client.post("/api/products", json=product_data)
        assert resp.status_code == 200, f"Got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data["name"] == product_data["name"]
        assert data["type"] == product_data["type"]
        assert data["elc"] == product_data["elc"]
        assert data["commission_rate"] == product_data["commission_rate"]
        assert data["company_id"] == product_data["company_id"]
        # defaults
        assert data["trigger_point"] == 15.0
        assert data["exit_point"] == 5.0
        assert "id" in data

    def test_get_product_not_found(self, client: TestClient):
        resp = client.get("/api/products/99999")
        assert resp.status_code == 404, f"Got {resp.status_code}: {resp.text}"

    def test_update_product(self, client: TestClient):
        initial = {
            "company_id": 2,
            "name": "Test Livestock Insurance",
            "type": "livestock",
            "elc": 2000.0,
            "commission_rate": 0.2,
            "trigger_point": 20.0
        }
        create = client.post("/api/products", json=initial)
        assert create.status_code == 200, create.text
        pid = create.json()["id"]

        update = {
            "name": "Updated Livestock Insurance",
            "commission_rate": 0.25,
            "elc": 2500.0
        }
        resp = client.put(f"/api/products/{pid}", json=update)
        assert resp.status_code == 200, resp.text
        out = resp.json()
        assert out["id"] == pid
        assert out["name"] == update["name"]
        assert out["commission_rate"] == update["commission_rate"]
        assert out["elc"] == update["elc"]
        # unchanged fields
        assert out["type"] == initial["type"]
        assert out["trigger_point"] == initial["trigger_point"]
        assert out["company_id"] == initial["company_id"]

    def test_update_product_not_found(self, client: TestClient):
        resp = client.put("/api/products/99999", json={"name": "X", "company_id": 1})
        assert resp.status_code == 404, resp.text

    def test_calculate_premium(self, client: TestClient):
        p = {
            "company_id": 3,
            "name": "Test Premium Product",
            "type": "crop",
            "elc": 1500.0,
            "commission_rate": 0.05,
            "trigger_point": 18.0,
            "exit_point": 6.0
        }
        create = client.post("/api/products", json=p)
        assert create.status_code == 200, create.text
        pid = create.json()["id"]

        resp = client.post(f"/api/products/{pid}/calculate-premium")
        assert resp.status_code == 200, resp.text
        premium = resp.json()["premium"]
        expected = p["elc"] * ((p["trigger_point"] + p["exit_point"]) / 100) + (p["commission_rate"] * p["elc"])
        assert abs(premium - expected) < 1e-2, f"{premium} != {expected}"

    def test_calculate_premium_not_found(self, client: TestClient):
        resp = client.post("/api/products/99999/calculate-premium")
        assert resp.status_code == 404, resp.text
