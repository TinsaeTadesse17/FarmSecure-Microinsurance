from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    REPORT_DATABASE_URL: str
    POLICY_SERVICE_URL: str
    CLAIM_SERVICE_URL: str
    COMMISSION_SERVICE_URL: str
    API_V1_STR: str = "/api/v1"
    model_config = ConfigDict(from_attributes=True)

settings = Settings()
