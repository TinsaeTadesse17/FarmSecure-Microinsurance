# src/routes/enrolement_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database.crud.enrolement_crud import EnrolementService
from src.database.crud.customer_crud import CustomerService
from src.schemas.enrolement_schema import EnrolementRequest, EnrolementResponse
from src.database.db import get_db
from src.schemas.customer_schema import CustomerRequest
router = APIRouter()

@router.post("/", response_model=EnrolementResponse, status_code=201)
def create_enrolement(
    enrolement: EnrolementRequest,
    db: Session = Depends(get_db),
):
    service = EnrolementService(db)
    customer_service = CustomerService(db)
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
    
    enroll_json = service.create_enrolement(enrolement, customer_id)
    enroll_id = enroll_json["enrolement_id"]
    createdAt = enroll_json["createdAt"]
    enroll = EnrolementResponse(

        enrolement_id=enroll_id,
        customer_id=customer_id,
        createdAt=createdAt,
        user_id=enrolement.user_id,
        status="pending",
        ic_company_id=enrolement.ic_company_id,
        branch_id=enrolement.branch_id,
        premium=enrolement.premium,
        sum_insured=enrolement.sum_insured,
        date_from=enrolement.date_from,
        date_to=enrolement.date_to,
        receipt_no=enrolement.receipt_no,
        product_id=enrolement.product_id,
        cps_zone=enrolement.cps_zone
    )
    return enroll

@router.get("/{enrolement_id}", response_model=EnrolementResponse)
def read_enrolement(
    enrolement_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    db_enr = service.get_enrolement(enrolement_id)
    result = EnrolementResponse(
        enrolement_id=db_enr.enrolment_id,
        createdAt=db_enr.createdAt,
        customer_id=db_enr.customer_id,
        user_id=db_enr.user_id,
        status=db_enr.status,
        ic_company_id=db_enr.ic_company_id,
        branch_id=db_enr.branch_id,
        premium=db_enr.premium,
        sum_insured=db_enr.sum_insured,
        date_from=db_enr.date_from,
        date_to=db_enr.date_to,
        receipt_no=db_enr.receipt_no,
        product_id=db_enr.product_id,
        cps_zone=db_enr.cps_zone
    )
    if not db_enr:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return result

@router.get("/", response_model=list[EnrolementResponse])
def list_enrolements(

    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    enrollments =  service.get_enrolements()
    result = []
    for db_enr in enrollments:
        enrol = EnrolementResponse(
            enrolement_id=db_enr.enrolment_id,
            createdAt=db_enr.createdAt,
            customer_id=db_enr.customer_id,
            user_id=db_enr.user_id,
            status=db_enr.status,
            ic_company_id=db_enr.ic_company_id,
            branch_id=db_enr.branch_id,
            premium=db_enr.premium,
            sum_insured=db_enr.sum_insured,
            date_from=db_enr.date_from,
            date_to=db_enr.date_to,
            receipt_no=db_enr.receipt_no,
            product_id=db_enr.product_id,
            cps_zone=db_enr.cps_zone
        )
        result.append(enrol)
    return result

@router.put("/{enrolement_id}/approve")
def approve_enrolement(
    enrolement_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    try:
        return service.approve_enrolement(enrolement_id)
    except HTTPException as e:
        raise e

@router.put("/{enrolement_id}/reject")
def reject_enrolement(
    enrolement_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    try:
        return service.reject_enrolement(enrolement_id)
    except HTTPException as e:
        raise e
