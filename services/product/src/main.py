from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from src.database.db import engine, Base
from src.database.models.product import ProductConfig
from src.database.models.excel_ingest import (
    CPSZone, Product, Period,
    GrowingSeason, NDVICrop, TriggerExitPoint
)
from src.routes import product_router
from src.routes import excel_router

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Configuration Service")

# Include product router
app.include_router(product_router, prefix="/api")
app.include_router(excel_router, prefix="/api", tags=["Excel-Ingest"])

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )
