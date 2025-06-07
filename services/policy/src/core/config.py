from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    REDIS_HOST: str
    DATABASE_URL: str
    DFS_SERVICE_URL: str
    PRODUCT_SERVICE_URL: str
    API_V1_STR: str = "/api"
    model_config = ConfigDict(from_attributes=True)

settings = Settings()


