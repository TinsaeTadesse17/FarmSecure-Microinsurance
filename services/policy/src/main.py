from fastapi import FastAPI
from src.routes.policy import router as policy_router

app = FastAPI(title="Policy Service")

app.include_router(policy_router)

@app.get("/")
def root():
    return {"msg": "Policy service running"}
