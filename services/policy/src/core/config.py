from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    DFS_SERVICE_URL: str
    PRODUCT_SERVICE_URL: str
    
    model_config = ConfigDict(from_attributes=True)

settings = Settings()
