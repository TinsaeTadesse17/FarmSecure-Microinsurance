from sqlalchemy.orm import Session
from src.database.models.insurance_company import InsuranceCompany
from src.schemas.insurance_company_schema import InsuranceCompanyCreate, InsuranceCompanyUpdate


def create_company(db: Session, company: InsuranceCompanyCreate):
    db_company = InsuranceCompany(
        name=company.name,
        licenseNo=company.licenseNo,
        licensedBy=company.licensedBy,
        operationDate=company.operationDate,
        capital=company.capital,
        country=company.country,
        city=company.city,
        phoneNo=company.phoneNo,
        postalCode=company.postalCode,
        email=company.email,
        status=company.status,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def get_company(db: Session, company_id: int):
    return db.query(InsuranceCompany).filter(InsuranceCompany.id == company_id).first()


def get_companies(db: Session, skip: int = 0, limit: int = 10):
    return db.query(InsuranceCompany).offset(skip).limit(limit).all()


def update_company(db: Session, company_id: int, company_update: InsuranceCompanyUpdate):
    db_company = db.query(InsuranceCompany).filter(InsuranceCompany.id == company_id).first()
    if db_company:
        for key, value in company_update.dict(exclude_unset=True).items():
            setattr(db_company, key, value)
        db.commit()
        db.refresh(db_company)
    return db_company
