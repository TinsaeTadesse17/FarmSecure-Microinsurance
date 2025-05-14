from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.db import get_db
from src.database.models.user import User
from src.schemas import user as user_schema, auth as auth_schema
from src.database.core.security import hash_password, verify_password
from src.database.core.auth import (
    login_user,
    get_current_user,
    get_current_active_user,
    require_role
)
import secrets
import string
from src.database.core.config import settings
from src.services.email_service import send_email_notification
from src.services.company_service import get_company
from typing import List

router = APIRouter(prefix="/api/user", tags=["user"])
def generate_username():
    return "user_" + secrets.token_hex(4)

def generate_password(length=10):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

@router.post("/login", response_model=auth_schema.TokenResponse)
def login(credentials: auth_schema.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = login_user(db, user.username, credentials.password)
    return {"access_token": token}

@router.post("/", response_model=dict)
def create_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
):
    if not user.company_id:
        raise HTTPException(status_code=400, detail="company_id is required for non-admin users.")
    
    # Check if the company exists
    company = get_company(user.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    generated_username = generate_username()
    generated_password = generate_password()
    hashed_pw = hash_password(generated_password)

    db_user = User(
        username=generated_username,
        password=hashed_pw,
        role=user.role,
        company_id=user.company_id,
        status="pending",
        must_change_password=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send email notification
    email_result = send_email_notification(
        to=company['email'],
        subject="Welcome to Agriteck MicroIncorance Platform",
        type="account_approval",
        username=generated_username,
        password=generated_password
    )

    return {
        "username": generated_username,
        "password": generated_password,
        "company_id": db_user.company_id
    }

@router.get("/me", response_model=user_schema.UserOut)
def get_user_info(current_user: User = Depends(get_current_active_user)):
    print(f"Returning current user: ID {current_user.user_id}, username: {current_user.username}")
    return current_user

@router.get("/ics", response_model=List[user_schema.UserOut])
def get_ic_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    ic_users = db.query(User).filter(User.role == "ic").all()
    if not ic_users:
        raise HTTPException(status_code=404, detail="No users with IC role found")
    return ic_users


@router.put("/update/{user_id}", response_model=user_schema.UserOut)
def update_user_account(
    user_id: int,
    updates: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🛠 Safe role unpacking
    current_user_role = current_user.role[0] if isinstance(current_user.role, list) else current_user.role
    target_user_role = user.role[0] if isinstance(user.role, list) else user.role

    print(f"Editing user: {user_id} | Current User: {current_user.user_id} ({current_user_role}) → {target_user_role}")

    # 🔒 Self-update
    if current_user.user_id == user.user_id:
        if updates.username:
            user.username = updates.username
        if updates.password:
            user.password = hash_password(updates.password)
            user.must_change_password = False
        if updates.status:
            raise HTTPException(status_code=403, detail="You can't change your own status.")

    # 🔐 Admin updates IC status
    elif current_user_role == "admin" and target_user_role == "ic":
        if updates.status:
            user.status = updates.status
        else:
            raise HTTPException(status_code=403, detail="Only status can be updated by admin on ICs.")

    # 🔐 IC updates Agent status
    elif current_user_role == "ic" and target_user_role == "agent":
        if updates.status:
            user.status = updates.status
        else:
            raise HTTPException(status_code=403, detail="Only status can be updated by IC on Agents.")

    else:
        raise HTTPException(status_code=403, detail="You are not allowed to update this account.")

    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        print(f"Commit error: {e}")
        raise HTTPException(status_code=500, detail="Database commit failed.")

    return user


user_router = router
