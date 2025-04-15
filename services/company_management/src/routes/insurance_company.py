from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.crud.insurance_company_crud import InsuranceCompanyService
from src.schemas import insurance_company_schema as schemas
from src.database.db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.InsuranceCompanyResponse)
def create_company(company: schemas.InsuranceCompanyCreate, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    return service.create_company(company)

@router.get("/{company_id}", response_model=schemas.InsuranceCompanyResponse)
def read_company(company_id: int, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    db_company = service.get_company(company_id)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.src.database import crud, db
from backend.src.schemas import insurance_company_schema as schemas

router = APIRouter()

# Dependency to get the database session
def get_db():
    db = db.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.InsuranceCompanyResponse)
def create_company(company: schemas.InsuranceCompanyCreate, db: Session = Depends(get_db)):
    return crud.create_company(db=db, company=company)


@router.get("/{company_id}", response_model=schemas.InsuranceCompanyResponse)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = crud.get_company(db=db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.get("/", response_model=list[schemas.InsuranceCompanyResponse])
def read_companies(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    return service.get_companies(skip=skip, limit=limit)

@router.put("/{company_id}", response_model=schemas.InsuranceCompanyResponse)
def update_company(company_id: int, company: schemas.InsuranceCompanyUpdate, db: Session = Depends(get_db)):
    service = InsuranceCompanyService(db)
    db_company = service.update_company(company_id, company)


@router.get("/", response_model=list[schemas.InsuranceCompanyResponse])
def read_companies(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_companies(db=db, skip=skip, limit=limit)


@router.put("/{company_id}", response_model=schemas.InsuranceCompanyResponse)
def update_company(company_id: int, company: schemas.InsuranceCompanyUpdate, db: Session = Depends(get_db)):
    db_company = crud.update_company(db=db, company_id=company_id, company_update=company)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company
