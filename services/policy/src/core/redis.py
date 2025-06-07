import redis.asyncio as redis
from src.core.config import settings

redis_client = redis.Redis(host=settings.REDIS_HOST, port=6379, decode_responses=True)
