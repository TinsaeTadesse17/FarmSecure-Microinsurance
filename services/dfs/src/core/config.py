from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    ENROLEMENT_DATABASE_URL: str
    CUSTOMER_DATABASE_URL: str
    POLICY_SERVICE_URL: str
    API_V1_STR: str = "/api"
    model_config = ConfigDict(from_attributes=True)

settings = Settings()
