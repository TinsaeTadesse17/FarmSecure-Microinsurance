from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.database.db import engine, Base, get_db
from src.routes.user import user_router
from src.database.seeder import seed_admin_user 
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="User Management Serivce")

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)

@app.on_event("startup")
def startup_event():
    db: Session = next(get_db())
    seed_admin_user(db)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


