from fastapi import FastAPI
from fastapi.responses import JSONResponse
from src.database.db import engine, Base
from src.routes import user
import logging

logginng.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="User Management Serivce")

Base.metadata.create_all(bind=engine)

app.include_router(users.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )