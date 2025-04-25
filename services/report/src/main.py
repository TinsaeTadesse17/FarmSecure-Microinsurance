from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.routes.report import router as report_router

app = FastAPI(title="Report Generation API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.include_router(
    report_router,
    prefix=f"{settings.API_V1_STR}/reports",
    tags=["reports"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
