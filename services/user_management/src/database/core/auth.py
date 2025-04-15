from sqlalchemy.orm import Session
from src.database.models.user import User
from src.database.core.security import verify_password, create_access_token

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password):
        return None
    return user

def login_user(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        return None
    roles = [user.role]
    token = create_access_token({
        "sub": str(user.user_id),
        "username": user.username,
        "role": roles,
        
    })
    return token
