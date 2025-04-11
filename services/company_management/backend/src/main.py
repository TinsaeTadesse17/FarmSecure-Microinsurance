# main route for this microservice
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.src.database.db import SessionLocal, Base, engine
from backend.src.database.models import user  # make sure __init__.py exists in models

app = FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_company(db: Session = Depends(get_db)):
    return db.query(user.User).all()
