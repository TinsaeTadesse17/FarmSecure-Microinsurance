from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.models.user import User
from src.schemas.user import UserCreate, UserOut, RoleUpdate
from src.database..auth import hash_password
from database import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)
    db_user = User(username=user.username, password=hashed_pw,
                   company_id=user.company_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{id}", response_model=UserOut)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{id}/roles")
def update_roles(id: int, update: RoleUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.roles = update.roles
    db.commit()
    return {"message": "Roles updated"}
