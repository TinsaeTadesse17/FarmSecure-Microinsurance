from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.routes.enrolement import router as dfs_router
from src.database.db import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DFS API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the enrollment router under '/enrollments'
app.include_router(
    dfs_router,
    prefix=f"{settings.API_V1_STR}/enrollments",
    tags=["Enrollment"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)