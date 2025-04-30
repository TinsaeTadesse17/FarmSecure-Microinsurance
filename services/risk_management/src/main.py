from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from src.routes import ndvi_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(title="Risk Management Service")

# Include product router
app.include_router(ndvi_router, prefix="/api", tags=["NDVI 10 Day Upload"])


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )
