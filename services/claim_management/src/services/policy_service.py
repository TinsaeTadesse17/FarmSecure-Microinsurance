import httpx
from fastapi import HTTPException
import logging
from src.core.config import settings

logger = logging.getLogger(__name__)

# Timeout configuration for HTTP calls
timeout = httpx.Timeout(connect=5.0, read=30.0, write=5.0, pool=None)

POLICY_SERVICE_URL = settings.POLICY_SERVICE_URL

async def fetch_policy_details() -> list[dict]:
    """
    Fetches all policy details from the external policy service.
    Raises HTTPException on errors.
    """
    url = f"{POLICY_SERVICE_URL}/api/policies/details"
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.exception("Error fetching policy details: %s", e)
            raise HTTPException(status_code=503, detail="Policy service is unavailable.")
