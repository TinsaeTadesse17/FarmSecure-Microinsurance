# File: tests/test_excel_ingest.py

import pytest
import pandas as pd
from io import BytesIO
from fastapi.testclient import TestClient

from src.schemas.excel_ingest import IngestSummary
from src.database.db import get_db
from src.database.models.excel_ingest import (
    CPSZone, Product, Period,
    GrowingSeason, TriggerExitPoint, NDVICrop
)

#— Helper to build in-memory Excel with all required sheets —
def create_test_excel_bytes() -> bytes:
    with BytesIO() as buf:
        with pd.ExcelWriter(buf, engine="openpyxl") as writer:
            # CPS_ZONE_DATA
            pd.DataFrame({
                "ID": [1],
                "NAME": ["ZoneA"],
                "CODE": [100],
            }).to_excel(writer, sheet_name="CPS_ZONE_DATA", index=False)

            # PERIOD_DATA (IDs 19 & 20)
            pd.DataFrame({
                "ID": [19, 20],
                "PERIOD_NAME": ["Period_19", "Period_20"],
                "DATE_FROM": ["2020-01-01", "2020-01-20"],
                "DATE_TO":   ["2020-06-30", "2020-06-30"],
            }).to_excel(writer, sheet_name="PERIOD_DATA", index=False)

            # GROWING_SEASON_DATA
            pd.DataFrame({
                "ID": [1],
                "SEASON_TYPE": ["rainy"],
                "LENGTH": [90],
                "DATE_FROM": ["2020-01-01"],
                "DATE_TO": ["2020-03-31"],
                "CPS_ZONE_ID": [1],
                "PRODUCT": ["crop"],
            }).to_excel(writer, sheet_name="GROWING_SEASON_DATA", index=False)

            # TRIGGER_EXIT_ELC
            pd.DataFrame({
                "ID": [1],
                "PRODUCT": ["crop"],
                "PERIOD_ID": [19],
                "FISCAL_YEAR": [2020],
                "CPS_ZONE_ID": [1],
                "TRIGGER_POINT": [10],
                "EXIT_POINT": [5],
                "ELC": [0.7],
                "TRIGGER_PERCENTILE": [80],
                "EXIT_PERCENTILE": [20],
            }).to_excel(writer, sheet_name="TRIGGER_EXIT_ELC", index=False)

            # NDVI_DATA with zone IDs
            pd.DataFrame({
                "GRID_NO": [1, 2],
                "CPS_ZONE_ID": [1, 1],
                "NDVI_VAL": [0.1, 0.3],
                "NDVI_VAL.1": [0.2, 0.4],
            }).to_excel(writer, sheet_name="NDVI_DATA", index=False)

        buf.seek(0)
        return buf.read()

def test_upload_excel_creates_expected_rows(client: TestClient):
    # 1) Build the test Excel
    excel_bytes = create_test_excel_bytes()
    files = {
        "file": (
            "test.xlsx",
            excel_bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    }

    # 2) Call the endpoint
    response = client.post(
        "/api/excel/upload_excel?growing_season_id=1",
        files=files
    )
    assert response.status_code == 202, response.text

    summary = IngestSummary(**response.json())

    # 3) Check summary fields
    assert summary.zones_upserted == 1
    assert summary.products_upserted == 1
    assert summary.periods_upserted == 2
    assert summary.seasons_upserted == 1
    assert summary.triggers_created == 1
    assert summary.triggers_updated == 0
    assert summary.ndvi_task == "scheduled"

    # 4) Verify data in the in-memory DB
    # Obtain a session from get_db()
    db_gen = get_db()
    db = next(db_gen)
    try:
        # CPSZone
        assert db.query(CPSZone).count() == 1

        # Product (only 'crop')
        assert db.query(Product).count() == 1

        # Periods (19 & 20)
        assert db.query(Period).count() == 2

        # GrowingSeason (ID=1)
        assert db.query(GrowingSeason).count() == 1

        # TriggerExitPoint (the one row)
        assert db.query(TriggerExitPoint).count() == 1

        # NDVICrop should have 2 periods × 1 zone = 2 rows
        ndvis = db.query(NDVICrop).all()
        assert len(ndvis) == 2
        # verify that both period_ids 19 and 20 appear
        pids = sorted({r.period_id for r in ndvis})
        assert pids == [19, 20]
    finally:
        db.close()
        db_gen.close()
