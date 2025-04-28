# src/routes/enrolement_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database.crud.enrolement_crud import EnrolementService
from src.database.crud.customer_crud import CustomerService
from src.schemas.enrolement_schema import EnrolementRequest, EnrolementResponse
from src.database.db import get_enrolement_db
from src.database.db import get_customer_db
from src.schemas.customer_schema import CustomerRequest
router = APIRouter()

@router.post("/", response_model=EnrolementResponse, status_code=201)
def create_enrolement(
    enrolement: EnrolementRequest,
    enroll_db: Session = Depends(get_enrolement_db),
    customer_db: Session = Depends(get_customer_db)
):
    service = EnrolementService(enroll_db)
    customer_service = CustomerService(customer_db)
    try:
        customer = CustomerRequest(
            f_name=enrolement.f_name,
            m_name=enrolement.m_name,
            l_name=enrolement.l_name,
            account_no=enrolement.account_no,
            account_type=enrolement.account_type,
        )
        customer_id = customer_service.create_customer(customer)
    except HTTPException as e:
        if e.status_code == 400:
            raise HTTPException(status_code=400, detail="Customer already enrolled")
        else:
            raise HTTPException(status_code=500, detail="Internal server error")
    return service.create_enrolement(enrolement, customer_id)

@router.get("/{enrolement_id}", response_model=EnrolementResponse)
def read_enrolement(
    enrolement_id: int,
    enroll_db: Session = Depends(get_enrolement_db)
):
    service = EnrolementService(enroll_db)
    db_enr = service.get_enrolement(enrolement_id)
    if not db_enr:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return db_enr

@router.get("/", response_model=list[EnrolementResponse])
def list_enrolements(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    enroll_db: Session = Depends(get_enrolement_db)
):
    service = EnrolementService(enroll_db)
    return service.get_enrolements(skip=skip, limit=limit)

@router.put("/{enrolement_id}/approve", response_model=EnrolementResponse)
def approve_enrolement(
    enrolement_id: int,
    enroll_db: Session = Depends(get_enrolement_db)
):
    service = EnrolementService(enroll_db)
    try:
        return service.approve_enrolement(enrolement_id)
    except HTTPException as e:
        raise e

@router.put("/{enrolement_id}/reject", response_model=EnrolementResponse)
def reject_enrolement(
    enrolement_id: int,
    enroll_db: Session = Depends(get_enrolement_db)
):
    service = EnrolementService(enroll_db)
    try:
        return service.reject_enrolement(enrolement_id)
    except HTTPException as e:
        raise e
