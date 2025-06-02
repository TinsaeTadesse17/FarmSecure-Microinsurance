import httpx
from fastapi import HTTPException
import logging
from src.core.config import settings

logger = logging.getLogger(__name__)
# Shared HTTP timeout for config service calls
timeout = httpx.Timeout(
    connect=5.0,
    read=30.0,
    write=5.0,
    pool=None
)

CONFIG_SERVICE_URL = settings.CONFIG_SERVICE_URL

async def fetch_cps_config(cps_zone: int, period: int) -> dict:
    """
    Fetch configuration (trigger/exit) for a given CPS zone and period.
    Raises HTTPException on failure.
    """
    url = f"{CONFIG_SERVICE_URL}{settings.API_V1_STR}/cps-zone/{cps_zone}/{period}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Config not available.")
            return resp.json()
        except httpx.HTTPError as e:
            logger.exception("Error fetching CPS config: %s", e)
            raise HTTPException(status_code=503, detail="Config service is unavailable.")

async def fetch_ndvi(grid_id: int, period: int) -> float:
    """
    Fetch NDVI value for a given grid and period.
    Raises HTTPException on failure or invalid data.
    """
    url = f"{CONFIG_SERVICE_URL}{settings.API_V1_STR}/ndvi/{grid_id}/{period}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            val = data.get('ndvi')
            if not isinstance(val, (int, float)):
                logger.error("Invalid NDVI response: %s", data)
                raise HTTPException(status_code=500, detail="Invalid NDVI format.")
            return float(val)
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error fetching NDVI: %s", e)
            raise HTTPException(status_code=e.response.status_code, detail="NDVI not available.")
        except httpx.HTTPError as e:
            logger.exception("Error fetching NDVI: %s", e)
            raise HTTPException(status_code=503, detail="NDVI service is unavailable.")

async def fetch_growing_season(grid_id: int) -> list[int]:
    """
    Fetch growing season periods for a given grid.
    Raises HTTPException on failure.
    """
    url = f"{CONFIG_SERVICE_URL}{settings.API_V1_STR}/cps-zone/growing_season/{grid_id}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, list):
                logger.error("Invalid growing season response: %s", data)
                raise HTTPException(status_code=500, detail="Invalid growing season format.")
            return data
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error fetching growing season: %s", e)
            raise HTTPException(status_code=e.response.status_code, detail="Growing season not available.")
        except httpx.HTTPError as e:
            logger.exception("Error fetching growing season: %s", e)
            raise HTTPException(status_code=503, detail="Growing season service is unavailable.")
