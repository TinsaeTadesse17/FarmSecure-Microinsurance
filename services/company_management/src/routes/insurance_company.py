# src/routes/insurance_company_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.crud.insurance_company_crud import InsuranceCompanyService
from src.schemas import insurance_company_schema as schemas
from src.database.db import get_db
from src.core.config import settings
import httpx

router = APIRouter()

@router.post("/register", response_model=schemas.InsuranceCompanyResponse)
def create_company(company: schemas.InsuranceCompanyCreate, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    return service.create_company(company)

@router.get("/{company_id}", response_model=schemas.InsuranceCompanyResponse)
def read_company(company_id: int, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    db_company = service.get_company(company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.get("/", response_model=list[schemas.InsuranceCompanyResponse])
def read_companies(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    return service.get_companies(skip=skip, limit=limit)

@router.put("/{company_id}/approve", response_model=schemas.InsuranceCompanyResponse)
def update_company(company_id: int, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    db_company = service.update_company(company_id)

    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    # Make sure the user account is created successfully
    url = f"{settings.USER_SERVICE_URL}/api/user/"
    payload = {
        "company_id": company_id,
        "role": "ic"
    }

    try:
        response = httpx.post(url, json=payload)
        response.raise_for_status()  # raise error if not 200
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to contact user service: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"User service error: {response.text}")

    # Return full company response
    return db_company

@router.post("/{company_id}/credentials", response_model=schemas.CrediencialResponse)
def generate_crediential(company_id: int, role: str):
    url = f"{settings.USER_SERVICE_URL}/api/user/"
    try:
        payload = {
            "company_id": company_id,
            "role": role
        }

        response = httpx.post(url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"User service error: {response.text}"
            )

        try:
            return response.json()
        except ValueError:
            raise HTTPException(status_code=502, detail="Invalid JSON response from user service")

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to contact user service: {str(e)}")


    
