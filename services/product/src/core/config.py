from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CLAIM_SERVICE_URL: str
    API_V1_STR: str = "/api/v1"

settings = Settings()