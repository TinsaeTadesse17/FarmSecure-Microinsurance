import os # Added import for os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # DATABASE_URL will be loaded from environment variables.
    # For the config service, this should be the CONFIG_DB_URL from your .env
    DATABASE_URL: str 
    JWT_SECRET_KEY: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Pydantic V2 way to specify .env file
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

settings = Settings()

# If you want to ensure that a specific environment variable is used for DATABASE_URL
# for this service, you can do something like this, but Pydantic's env loading
# should handle it if the .env file has DATABASE_URL=... or if the env var is set.
# If your .env has CONFIG_DB_URL and you want that to be THE DATABASE_URL for this app:
# settings.DATABASE_URL = os.getenv("CONFIG_DB_URL", "postgresql://user:pass@localhost:5432/config_db_default")
# However, it's cleaner if the .env variable is directly named DATABASE_URL for pydantic to pick up,
# or ensure the correct env var is passed in deployment.

# For this setup, we will assume that the .env file will provide a DATABASE_URL variable,
# or it will be set in the environment where the service runs.
# If you specifically named it CONFIG_DB_URL in .env and want pydantic to map it to settings.DATABASE_URL,
# you would need to use Field(alias='CONFIG_DB_URL') for the DATABASE_URL field.
# For simplicity, let's assume the .env will contain:
# DATABASE_URL=postgresql://user:pass1234@config_db:5432/config_db
