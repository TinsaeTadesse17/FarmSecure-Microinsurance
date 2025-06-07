# policy/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.db import Base, engine
from src.routes.policy import router as policy_router
from src.core.config import settings
from contextlib import asynccontextmanager

app = FastAPI(title="Policy Administration API")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: add cleanup code here if needed

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    policy_router,
    prefix=f"{settings.API_V1_STR}",
    tags=["policies"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, workers=4)
