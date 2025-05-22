import io
import pandas as pd
import shutil
import datetime
import os
import uuid # Added for job IDs
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional # Added Optional

from src.database import models, db
from src.schemas import ndvi as ndvi_schemas
from src.schemas import file as file_schemas

class JobStatus(file_schemas.BaseModel): # Using BaseModel from file_schemas for consistency
    job_id: str
    status: str # e.g., "pending", "processing", "completed", "failed"
    message: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    original_filename: Optional[str] = None
    saved_filename: Optional[str] = None
    file_path: Optional[str] = None # Final path after successful processing
    error_details: Optional[str] = None

    class Config:
        from_attributes = True

router = APIRouter()

UPLOAD_DIR = "uploaded_files_config"
NDVI_FILES_DIR = os.path.join(UPLOAD_DIR, "ndvi")
TEMP_NDVI_FILES_DIR = os.path.join(UPLOAD_DIR, "temp_ndvi") # Temporary storage for NDVI files
os.makedirs(NDVI_FILES_DIR, exist_ok=True)
os.makedirs(TEMP_NDVI_FILES_DIR, exist_ok=True) # Create temp directory

# In-memory store for job statuses
job_statuses: Dict[str, JobStatus] = {}

def validate_ndvi_data(df: pd.DataFrame):
    if not all(col in df.columns for col in ['grid', 'ndvi']):
        raise HTTPException(status_code=400, detail="CSV/Excel must contain 'grid' and 'ndvi' columns.")
    if not pd.api.types.is_numeric_dtype(df['grid']):
        raise HTTPException(status_code=400, detail="'grid' column must be numeric and integer.")
    # Ensure grid is integer like, even if read as float by pandas from CSV
    try:
        df['grid'] = df['grid'].astype(int)
    except ValueError:
        raise HTTPException(status_code=400, detail="'grid' column must contain integer values.")
    if not (df['grid'] >= 0).all(): # Assuming grid ID is non-negative
        raise HTTPException(status_code=400, detail="'grid' values must be non-negative.")
    if not pd.api.types.is_numeric_dtype(df['ndvi']):
        raise HTTPException(status_code=400, detail="'ndvi' column must be numeric.")
    # Add more specific NDVI range validation if applicable (e.g., -1 to 1)

async def background_process_ndvi_file(
    db_session: Session, 
    file_content: bytes, 
    original_filename: str, 
    temp_file_path: str, # Path to the temporary file
    job_id: str
):
    job_statuses[job_id].status = "processing"
    job_statuses[job_id].updated_at = datetime.datetime.utcnow()
    saved_filename = ""
    final_file_path = ""

    try:
        if original_filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        elif original_filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            raise ValueError(f"Unsupported file type: {original_filename}")

        validate_ndvi_data(df) # Full validation on complete data

        # Create timestamped filename for final storage
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        base, ext = os.path.splitext(original_filename)
        saved_filename = f"grid_ndvi_{base.replace(' ', '_')}_{timestamp}{ext}"
        final_file_path = os.path.join(NDVI_FILES_DIR, saved_filename)

        # Move file from temp to final location after validation
        shutil.move(temp_file_path, final_file_path)

        for _, row in df.iterrows():
            grid_val = int(row['grid'])
            ndvi_val = float(row['ndvi'])

            # Use filter_by for the query
            db_ndvi_instance = db_session.query(models.NDVI).filter_by(grid=grid_val).first()
            
            if db_ndvi_instance:
                db_ndvi_instance.ndvi = ndvi_val # Attempt direct assignment
                # 'updated_at' is automatically handled by the model's onupdate
            else:
                # Create new NDVI record
                new_ndvi_instance = models.NDVI(grid=grid_val, ndvi=ndvi_val)
                db_session.add(new_ndvi_instance)
        
        db_file_meta = models.UploadedFile(
            filename=original_filename, 
            saved_filename=saved_filename,
            file_type="ndvi",
            upload_type="ndvi_grid", # more specific type
            file_path=final_file_path,
            # uploaded_at is default in model
        )
        db_session.add(db_file_meta)
        db_session.commit()

        job_statuses[job_id].status = "completed"
        job_statuses[job_id].message = f"Successfully processed and saved NDVI data from {original_filename} as {saved_filename}"
        job_statuses[job_id].saved_filename = saved_filename
        job_statuses[job_id].file_path = final_file_path
        print(job_statuses[job_id].message)

    except Exception as e:
        db_session.rollback()
        error_message = f"Error processing NDVI file {original_filename} in background: {str(e)}"
        job_statuses[job_id].status = "failed"
        job_statuses[job_id].error_details = error_message
        job_statuses[job_id].message = "Processing failed."
        print(error_message)
        # Remove temp file if it still exists and final file was not created
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        # If final file was somehow created before error, consider removing it too
        if final_file_path and os.path.exists(final_file_path):
            os.remove(final_file_path)
    finally:
        job_statuses[job_id].updated_at = datetime.datetime.utcnow()
        db_session.close()


@router.post("/upload", response_model=JobStatus, status_code=202)
async def upload_ndvi_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    if file.filename is None:
        raise HTTPException(status_code=400, detail="Filename cannot be empty.")

    if not (file.filename.endswith('.csv') or file.filename.endswith(('.xls', '.xlsx'))):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV and Excel files are allowed.")

    job_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()

    # Save to a temporary location first
    temp_base, temp_ext = os.path.splitext(file.filename)
    temp_saved_filename = f"temp_ndvi_{job_id}{temp_ext}"
    temp_file_path = os.path.join(TEMP_NDVI_FILES_DIR, temp_saved_filename)

    file_content = await file.read()
    await file.seek(0) 

    try:
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save temporary file: {e}")

    # Initial quick validation (optional, as full validation happens in background)
    # try:
    #     if file.filename.endswith('.csv'):
    #         df_quick_validation = pd.read_csv(io.BytesIO(file_content), nrows=5)
    #     else:
    #         df_quick_validation = pd.read_excel(io.BytesIO(file_content), nrows=5)
    #     validate_ndvi_data(df_quick_validation)
    # except Exception as e:
    #     if os.path.exists(temp_file_path):
    #         os.remove(temp_file_path)
    #     raise HTTPException(status_code=400, detail=f"Initial file validation failed: {str(e)}")

    job_statuses[job_id] = JobStatus(
        job_id=job_id,
        status="pending",
        message="File upload accepted, processing in background.",
        created_at=now,
        original_filename=file.filename,
        # saved_filename and file_path will be updated by background task
    )

    db_session_bg = next(db.get_db())
    background_tasks.add_task(
        background_process_ndvi_file,
        db_session_bg,
        file_content, # Pass content directly
        file.filename,
        temp_file_path, # Pass temp file path
        job_id
    )
    return job_statuses[job_id]

@router.get("/upload/status/{job_id}", response_model=JobStatus)
async def get_ndvi_upload_status(job_id: str):
    status = job_statuses.get(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job ID not found.")
    return status

@router.get("/{grid_id}", response_model=ndvi_schemas.NDVIResponse)
def get_ndvi(grid_id: int, db_session: Session = Depends(db.get_db)):
    # Changed from filter to filter_by
    db_ndvi = db_session.query(models.NDVI).filter_by(grid=grid_id).first()
    if db_ndvi is None:
        raise HTTPException(status_code=404, detail="NDVI data for the given grid not found")
    return db_ndvi

@router.get("/", response_model=List[ndvi_schemas.NDVIResponse])
def get_all_ndvi_data(skip: int = 0, limit: int = 1000, db_session: Session = Depends(db.get_db)):
    # Potentially very large, so pagination is important. Default limit increased.
    ndvi_data = db_session.query(models.NDVI).offset(skip).limit(limit).all()
    return ndvi_data

@router.get("/files/{filename}", response_class=FileResponse)
async def get_uploaded_ndvi_file(filename: str):
    file_path = os.path.join(NDVI_FILES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=filename)

@router.get("/files/", response_model=List[file_schemas.FileUploadResponse])
def list_uploaded_ndvi_files(db_session: Session = Depends(db.get_db)):
    files = db_session.query(models.UploadedFile).filter(
        models.UploadedFile.file_type == "ndvi",
        models.UploadedFile.upload_type == "ndvi_grid" # Ensure we only list successfully processed NDVI files
    ).order_by(models.UploadedFile.uploaded_at.desc()).all()
    return [file_schemas.FileUploadResponse.from_orm(f) for f in files]
