# File: src/routes/excel_ingest.py

import logging
from typing import List
from fastapi import (
    APIRouter, UploadFile, File, Query,
    HTTPException, BackgroundTasks, Depends, status
)
import pandas as pd
from sqlalchemy.orm import Session

from src.database.db import get_db, SessionLocal
from src.database.crud.excel_ingest import (
    upsert_cps_zone, upsert_product, upsert_period,
    upsert_growing_season, upsert_trigger, upsert_ndvi
)
from src.schemas.excel_ingest import (
    CPSZoneIn, ProductIn, PeriodIn, GrowingSeasonIn,
    TriggerExitPointIn, NDVICropIn, IngestSummary
)
from src.database.models.excel_ingest import CPSZone

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/excel", tags=["Excel Ingest"])

@router.post(
    "/upload_excel",
    response_model=IngestSummary,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload Excel and seed DB, NDVI in background"
)
def upload_excel(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Excel (.xlsx) file"),
    growing_season_id: int = Query(..., gt=0, description="FK season_id"),
    force: bool = Query(False, description="If no zone NDVI, evenly average"),
    db: Session = Depends(get_db),
) -> IngestSummary:
    # 1) Load workbook
    if not file.filename.lower().endswith((".xls", ".xlsx")):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only Excel files accepted")
    try:
        xls = pd.ExcelFile(file.file)
    except Exception as e:
        logger.exception("Failed to parse Excel")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Excel file") from e

    # 2) CPS_ZONE_DATA
    try:
        df_z = xls.parse("CPS_ZONE_DATA")
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Missing sheet: CPS_ZONE_DATA"
        )
    for r in df_z.itertuples(index=False):
        upsert_cps_zone(db, CPSZoneIn(zone_id=int(r.ID), zone_name=r.NAME))
    db.commit()

    # 3) PRODUCT (from sheets)
    product_set = set()
    for sheet in ("TRIGGER_EXIT_ELC", "GROWING_SEASON_DATA"):
        if sheet in xls.sheet_names:
            df = xls.parse(sheet)
            if "PRODUCT" in df.columns:
                product_set.update(df["PRODUCT"].astype(str).unique())
    for p in product_set:
        prod_obj, _ = upsert_product(db, ProductIn(product_type=p))
    db.commit()

    # 4) PERIOD_DATA
    try:
        df_p = xls.parse("PERIOD_DATA")
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Missing sheet: PERIOD_DATA"
        )
    for r in df_p.itertuples(index=False):
        upsert_period(db, PeriodIn(
            period_id=int(r.ID),
            period_name=r.PERIOD_NAME,
            date_from=r.DATE_FROM,
            date_to=r.DATE_TO,
        ))
    db.commit()

    # 5) GROWING_SEASON_DATA
    try:
        df_gs = xls.parse("GROWING_SEASON_DATA")
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Missing sheet: GROWING_SEASON_DATA"
        )
    for r in df_gs.itertuples(index=False):
        prod_obj, _ = upsert_product(db, ProductIn(product_type=r.PRODUCT))
        upsert_growing_season(db, GrowingSeasonIn(
            season_id=int(r.ID),
            season_type=r.SEASON_TYPE,
            length=int(r.LENGTH),
            date_from=r.DATE_FROM,
            date_to=r.DATE_TO,
            zone_id=int(r.CPS_ZONE_ID),
            product_id=prod_obj.product_id,
        ))
    db.commit()

    # 6) TRIGGER_EXIT_ELC
    try:
        df_te = xls.parse("TRIGGER_EXIT_ELC")
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Missing sheet: TRIGGER_EXIT_ELC"
        )
    created, updated = 0, 0
    for r in df_te.itertuples(index=False):
        prod_obj, _ = upsert_product(db, ProductIn(product_type=r.PRODUCT))
        _, was_created = upsert_trigger(db, TriggerExitPointIn(
            zone_id=int(r.CPS_ZONE_ID),
            product_id=prod_obj.product_id,
            fiscal_year=int(r.FISCAL_YEAR),
            period_id=int(r.PERIOD_ID),
            growing_season_id=growing_season_id,
            trigger_point=int(r.TRIGGER_POINT),
            exit_point=int(r.EXIT_POINT),
            trigger_percentile=int(r.TRIGGER_PERCENTILE),
            exit_percentile=int(r.EXIT_PERCENTILE),
            elc=float(r.ELC),
        ))
        if was_created:
            created += 1
        else:
            updated += 1
    db.commit()

    # 7) NDVI_DATA (background)
    try:
        df_nd = xls.parse("NDVI_DATA")
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Missing sheet: NDVI_DATA"
        )
    records: List[dict] = df_nd.to_dict(orient="records")
    has_zone = "CPS_ZONE_ID" in df_nd.columns
    if not has_zone and not force:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "NDVI_DATA has no CPS_ZONE_ID; use force=true to average globally"
        )

    background_tasks.add_task(
        _process_ndvi, records, has_zone, force, growing_season_id
    )

    return IngestSummary(
        zones_upserted=len(df_z),
        products_upserted=len(product_set),
        periods_upserted=len(df_p),
        seasons_upserted=len(df_gs),
        triggers_created=created,
        triggers_updated=updated,
    )


def _process_ndvi(
    records: List[dict],
    has_zone: bool,
    force: bool,
    season_id: int
) -> None:
    logger.info("Starting NDVI background task (has_zone=%s, force=%s)", has_zone, force)
    db = SessionLocal()
    try:
        cols = [c for c in records[0].keys() if c.upper().startswith("NDVI_VAL")]
        if not cols:
            logger.error("No NDVI_VAL columns found.")
            return

        if has_zone:
            for rec in records:
                zid = int(rec["CPS_ZONE_ID"])
                for idx, col in enumerate(cols, start=19):
                    upsert_ndvi(db, NDVICropIn(
                        zone_id=zid,
                        fiscal_year=2020,
                        growing_season_id=season_id,
                        period_id=idx,
                        index_value=float(rec[col])
                    ))
        else:
            all_vals = {col: [float(r[col]) for r in records] for col in cols}
            avg = {col: sum(vals)/len(vals) for col, vals in all_vals.items()}
            zones = [z.zone_id for z in db.query(CPSZone).all()]
            for zid in zones:
                for idx, col in enumerate(cols, start=19):
                    upsert_ndvi(db, NDVICropIn(
                        zone_id=zid,
                        fiscal_year=2020,
                        growing_season_id=season_id,
                        period_id=idx,
                        index_value=avg[col]
                    ))

        db.commit()
        logger.info("NDVI background task completed successfully.")
    except Exception:
        logger.exception("Error in NDVI background task.")
        db.rollback()
    finally:
        db.close()
