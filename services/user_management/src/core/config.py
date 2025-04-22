import pydantic_settings

class Settings(pydantic_settings.BaseSettings):
    """Application settings."""

    NOTIFICATION_SERVICE_URL: str

settings = Settings()