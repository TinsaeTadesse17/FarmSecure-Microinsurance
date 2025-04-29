from fastapi import FastAPI
from src.database.db import engine
from src.database.models.claim_management import Base
from src.routes.claim_management import router as claim_router
from fastapi.middleware.cors import CORSMiddleware  


app = FastAPI(title="Claim Management Service")

@app.on_event("startup")
async def create_tables():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claim_router, prefix="/api/claim")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

