import httpx
import logging
import json
from fastapi import HTTPException
from redis.asyncio import Redis
from src.core.config import settings
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type, before_sleep_log

logger = logging.getLogger(__name__)

# Global timeout and connection limits
timeout = httpx.Timeout(connect=5.0, read=100.0, write=5.0, pool=5.0)
limits = httpx.Limits(max_connections=10, max_keepalive_connections=5)
shared_client = httpx.AsyncClient(timeout=timeout, limits=limits)

# Redis client (single shared instance)
redis_client = Redis(host="redis", port=6379, decode_responses=True)  # Adjust host/port as needed

POLICY_SERVICE_URL = settings.POLICY_SERVICE_URL

@retry(
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(httpx.RequestError),
    before_sleep=before_sleep_log(logger, logging.WARNING)
)
async def fetch_policy_details() -> list[dict]:
    """
    Fetches all policy details from the external policy service.
    First tries Redis cache, then falls back to external API on miss.
    """
    cache_key = "policy_details_cache"

    try:
        # Check cache first
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("[POLICY] Returning cached policy data.")
            return json.loads(cached)

        # If not cached, fetch from service
        url = f"{POLICY_SERVICE_URL}/api/policies/details"
        logger.info(f"[POLICY] Requesting policy details from: {url}")
        response = await shared_client.get(url)
        response.raise_for_status()
        logger.info(f"[POLICY] Successfully fetched policies. Status code: {response.status_code}")
        data = response.json()

        # Cache the result (e.g., 5 minutes = 300 seconds)
        await redis_client.set(cache_key, json.dumps(data), ex=300)
        return data

    except httpx.HTTPStatusError as e:
        logger.error(f"[POLICY] HTTP error {e.response.status_code}: {e.response.text}")
        raise HTTPException(status_code=503, detail="Policy service returned an error.")
    except httpx.RequestError as e:
        logger.exception("[POLICY] Network error when contacting policy service.")
        raise HTTPException(status_code=503, detail="Policy service is unavailable.")
