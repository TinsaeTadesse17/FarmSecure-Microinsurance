from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.routes.enrolement import router as dfs_router
from src.database.db import Base
from src.database.db import engine


Base.metadata.create_all(bind=engine)

app = FastAPI(title="DFS API")


app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.include_router(
    dfs_router,
    prefix=f"{settings.API_V1_STR}/enrollment",
    tags=["Enrollment"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
