from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DFS_API_URL: str
    PRODUCT_SERVICE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
