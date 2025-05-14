from fastapi import File, UploadFile, Query, HTTPException
from fastapi import APIRouter
import pandas as pd
import re
import httpx
from src.core.config import settings

# Base URL for the claim service
CLAIM_SERVICE_BASE_URL = settings.CLAIM_SERVICE_URL

timeout = httpx.Timeout(
    connect=5.0,   # max time to connect
    read=30.0,     # max time to read a response
    write=5.0,     # max time to write the request
    pool=None      # use default pool timeout
)

router = APIRouter()

@router.post("/upload_ndvi")
async def upload_ndvi(
    file: UploadFile = File(...),
    period: str = Query(..., description="Period identifier"),
    ndvi_type: str = Query(..., regex="^(crop|livestock)$", description="Type: 'crop' or 'livestock'"),
):
    # check if it is exactly an excel file
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(400, "File must be an Excel file (.xlsx or .xls)")
    
    # 1. Read the uploaded Excel file
    try:
        df = pd.read_excel(file.file, header=0, names=["CPS_ZONE", "NDVI"])
    except Exception as e:
        raise HTTPException(400, f"Invalid Excel file: {e}")

    # 2. Validate dimensions: 200 rows, 2 columns
    if df.shape != (200, 2):
        raise HTTPException(400, "Excel must have exactly 200 rows and 2 columns (CPS_ZONE, NDVI)")

    # 3. Parse CPS_ZONE and NDVI into a dict
    cps_data: dict[str, float] = {}
    zones_found = set()
    for idx, (raw_zone, raw_ndvi) in df.iterrows():
        # Extract numeric zone ID from strings like 'CPS_ZONE_1' or plain integers
        match = re.search(r"(\d+)", str(raw_zone))
        if not match:
            raise HTTPException(400, f"Invalid CPS_ZONE value on row {idx+1}: {raw_zone}")
        zone = int(match.group(1))
        if not (1 <= zone <= 200):
            raise HTTPException(400, f"CPS zone out of range (1-200) on row {idx+1}: {zone}")

        # Validate NDVI is float
        try:
            ndvi = float(raw_ndvi)
        except Exception:
            raise HTTPException(400, f"Invalid NDVI value on row {idx+1}, zone {zone}: {raw_ndvi}")

        cps_data[str(zone)] = ndvi
        zones_found.add(zone)

    # 4. Ensure all 200 zones are present
    expected = set(range(1, 201))
    missing = expected - zones_found
    if missing:
        raise HTTPException(400, f"Missing CPS zones: {sorted(missing)}")

    # 5. Forward to claim service
    payload = {"ndvi_data": cps_data, "period": period}
    url = f"{CLAIM_SERVICE_BASE_URL}/claims/{ndvi_type}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, json=payload)
    if resp.status_code not in {200, 201, 204}:
        raise HTTPException(resp.status_code, f"Claim service error: {resp.text}")

    return resp.json()