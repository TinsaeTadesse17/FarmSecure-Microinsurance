from pydantic import BaseModel
import datetime
from typing import Optional

class UploadedFileBase(BaseModel):
    filename: str # Original filename
    file_type: str
    file_path: str # Path where the file is saved on the server
    saved_filename: Optional[str] = None # The potentially modified filename on the server
    upload_type: Optional[str] = None # Specific type, e.g., 'trigger', 'exit', 'season', 'ndvi_grid'

class UploadedFileCreate(UploadedFileBase):
    pass

class UploadedFileInDBBase(UploadedFileBase):
    id: int
    uploaded_at: datetime.datetime # Renamed from upload_date for consistency

    class Config:
        from_attributes = True # Changed from orm_mode = True

# This will be the general response model for file uploads
class FileUploadResponse(UploadedFileInDBBase):
    pass
