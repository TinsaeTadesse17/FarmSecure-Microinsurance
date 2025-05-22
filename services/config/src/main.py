from fastapi import FastAPI
from src.routes import cps_zone, ndvi # We will create these route files next
from src.database.db import Base, engine

# Creates tables if they don't exist (for development)
# This replaces the need for Alembic for simple cases.
# For production, a more robust migration strategy might be needed if schema changes frequently.
Base.metadata.create_all(bind=engine) 

app = FastAPI(
    title="Configuration Microservice",
    description="Manages CPS Zone and NDVI configurations.",
    version="0.1.0"
)

app.include_router(cps_zone.router, prefix="/api/v1/cps-zone", tags=["CPS Zone"])
app.include_router(ndvi.router, prefix="/api/v1/ndvi", tags=["NDVI"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Configuration Microservice"}

# In a real application, you might want to run migrations with Alembic
# instead of create_all, especially in production.
