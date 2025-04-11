from fastapi import FastAPI
from src.routes.insurance_company import router as insurance_comapany_router
from fastapi.middleware.cors import CORSMiddleware  


app = FastAPI(title="Insurance API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(insurance_comapany_router, prefix="/incurance_comapnies", tags=["insurance_comapnies"])
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
