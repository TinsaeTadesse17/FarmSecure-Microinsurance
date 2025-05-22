import io
import pandas as pd
import shutil
import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional

from src.database import models, db
from src.schemas import cps_zone as cps_zone_schemas
from src.schemas import file as file_schemas

router = APIRouter()

UPLOAD_DIR = "uploaded_files_config"
CPS_ZONE_FILES_DIR = os.path.join(UPLOAD_DIR, "cps_zone")
os.makedirs(CPS_ZONE_FILES_DIR, exist_ok=True)


def get_safe_filename_parts(upload_file: UploadFile) -> tuple[str, str]:
    if upload_file.filename is None:
        # This case should ideally be caught by FastAPI if file is required
        # or handled if filename is truly optional for some reason.
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")
    return os.path.splitext(upload_file.filename)


def process_and_store_cps_data(
    db_session: Session,
    trigger_points_df: pd.DataFrame,
    exit_points_df: pd.DataFrame,
    growing_seasons_df: pd.DataFrame,
    saved_files_info: List[dict] # List of dicts with original_filename, saved_filename, file_path, upload_type
):
    try:
        # Validate growing seasons data
        if not all(col in growing_seasons_df.columns for col in ['cps_zone', 'start', 'end']):
            raise HTTPException(status_code=400, detail="Growing season file must contain 'cps_zone', 'start', and 'end' columns.")
        if not pd.api.types.is_numeric_dtype(growing_seasons_df['cps_zone']) or \
           not pd.api.types.is_numeric_dtype(growing_seasons_df['start']) or \
           not pd.api.types.is_numeric_dtype(growing_seasons_df['end']):
            raise HTTPException(status_code=400, detail="'cps_zone', 'start', and 'end' columns in growing season file must be numeric.")

        # Validate percentile files (trigger and exit points)
        for df, name in [(trigger_points_df, "Trigger points"), (exit_points_df, "Exit points")]:
            if 'cps_zone' not in df.columns:
                raise HTTPException(status_code=400, detail=f"{name} file must contain a 'cps_zone' column (expected as the first column after header skip). Ensure it's named 'cps_zone' after read.")
            if not pd.api.types.is_numeric_dtype(df['cps_zone']):
                 raise HTTPException(status_code=400, detail=f"'cps_zone' column in {name} file must be numeric.")
            if not (df['cps_zone'] >= 0).all() or not (df['cps_zone'] <= 200).all(): # Series comparison
                raise HTTPException(status_code=400, detail=f"'cps_zone' values in {name} file must be between 0 and 200.")
            if len(df.columns) != 37: # cps_zone (1) + 36 periods
                raise HTTPException(status_code=400, detail=f"{name} file must have a 'cps_zone' column and 36 period columns. Found {len(df.columns)} columns.")
            # Check that period columns (columns 1 to 36) are numeric
            for col_idx in range(1, 37):
                # df.columns[col_idx] gives the name of the column at this position
                if not pd.api.types.is_numeric_dtype(df[df.columns[col_idx]]):
                    raise HTTPException(status_code=400, detail=f"Period columns in {name} file must be numeric. Column for period {col_idx} (actual column name: {df.columns[col_idx]}) is not.")

        growing_seasons_map: Dict[int, tuple[int, int]] = {}
        for _, row in growing_seasons_df.iterrows():
            cps_zone = int(row['cps_zone'])
            start_period = int(row['start'])
            end_period = int(row['end'])
            if not (0 <= cps_zone <= 200):
                raise HTTPException(status_code=400, detail=f"Growing season file: CPS Zone {cps_zone} out of range 0-200.")
            if not (1 <= start_period <= 36 and 1 <= end_period <= 36 and start_period <= end_period):
                raise HTTPException(status_code=400, detail=f"Growing season file: Invalid period for CPS Zone {cps_zone}. Start/End must be 1-36, start <= end.")
            growing_seasons_map[cps_zone] = (start_period, end_period)

        all_cps_zones_in_files = set(trigger_points_df['cps_zone'].astype(int).unique()) | \
                                 set(exit_points_df['cps_zone'].astype(int).unique()) | \
                                 set(growing_seasons_df['cps_zone'].astype(int).unique())
        
        if all_cps_zones_in_files:
            for zone_val_numpy in all_cps_zones_in_files:
                zone_val_python_int = int(zone_val_numpy) # Explicit conversion to Python int
                db_session.query(models.CPSZonePeriodConfig).filter(models.CPSZonePeriodConfig.cps_zone == zone_val_python_int).delete()
            db_session.commit()

        # Process trigger points
        for _, row in trigger_points_df.iterrows():
            cps_zone_val = int(row['cps_zone']) # Ensure this is Python int
            start_season, end_season = growing_seasons_map.get(cps_zone_val, (0, 0)) 

            for period_idx_in_df in range(1, 37): # Corresponds to columns 1 through 36 for period data
                period_num = period_idx_in_df # Period number is 1-36
                trigger_val = 0.0
                if start_season <= period_num <= end_season:
                    try:
                        trigger_val = float(row.iloc[period_idx_in_df]) 
                    except (IndexError, ValueError) as e:
                        raise HTTPException(status_code=400, detail=f"Error reading trigger point for CPS Zone {cps_zone_val}, Period {period_num} (column index {period_idx_in_df}). Ensure 36 period columns exist. Error: {e}")

                # Find existing or prepare new entry (without adding yet)
                config_entry = db_session.query(models.CPSZonePeriodConfig).filter(
                    models.CPSZonePeriodConfig.cps_zone == cps_zone_val,
                    models.CPSZonePeriodConfig.period == period_num
                ).first()

                if config_entry:
                    config_entry.trigger_point = trigger_val
                    config_entry.updated_at = datetime.datetime.utcnow()
                else:
                    config_entry = models.CPSZonePeriodConfig(
                        cps_zone=cps_zone_val,
                        period=period_num,
                        trigger_point=trigger_val,
                        exit_point=0.0 # Default, will be set by exit points processing
                    )
                    db_session.add(config_entry)
        db_session.commit() # Commit after all trigger points for all zones

        # Process exit points
        for _, row in exit_points_df.iterrows():
            cps_zone_val = int(row['cps_zone']) # Ensure this is also Python int
            start_season, end_season = growing_seasons_map.get(cps_zone_val, (0, 0))

            for period_idx_in_df in range(1, 37):
                period_num = period_idx_in_df
                exit_val = 0.0
                if start_season <= period_num <= end_season:
                    try:
                        exit_val = float(row.iloc[period_idx_in_df])
                    except (IndexError, ValueError) as e:
                         raise HTTPException(status_code=400, detail=f"Error reading exit point for CPS Zone {cps_zone_val}, Period {period_num} (column index {period_idx_in_df}). Ensure 36 period columns exist. Error: {e}")

                config_entry = db_session.query(models.CPSZonePeriodConfig).filter(
                    models.CPSZonePeriodConfig.cps_zone == cps_zone_val,
                    models.CPSZonePeriodConfig.period == period_num
                ).first()
                
                if config_entry: 
                    config_entry.exit_point = exit_val
                    config_entry.updated_at = datetime.datetime.utcnow()
                else:
                    # This case implies a zone/period in exit_points not covered by trigger_points processing.
                    # Create it with trigger_point = 0.0 as per current logic.
                    config_entry = models.CPSZonePeriodConfig(
                        cps_zone=cps_zone_val,
                        period=period_num,
                        trigger_point=0.0, 
                        exit_point=exit_val
                    )
                    db_session.add(config_entry)
        db_session.commit() # Commit after all exit points for all zones

        # Save uploaded file metadata
        for file_info in saved_files_info:
            db_file = models.UploadedFile(
                filename=file_info["original_filename"], 
                saved_filename=file_info["saved_filename"],
                file_type="cps_zone_config", 
                file_path=file_info["file_path"],
                upload_type=file_info["upload_type"]
            )
            db_session.add(db_file)
        db_session.commit()

    except HTTPException:
        db_session.rollback() 
        for file_info in saved_files_info:
            if os.path.exists(file_info["file_path"]):
                os.remove(file_info["file_path"])
        raise
    except Exception as e:
        db_session.rollback()
        for file_info in saved_files_info:
            if os.path.exists(file_info["file_path"]):
                os.remove(file_info["file_path"])
        print(f"Error processing CPS Zone files: {e}") # Replace with proper logging
        raise HTTPException(status_code=500, detail=f"Error processing CPS Zone files: {str(e)}")


@router.post("/upload-set", response_model=List[file_schemas.FileUploadResponse], status_code=201)
async def upload_cps_zone_files(
    trigger_points_file: UploadFile = File(..., description="Excel file for 15th percentile trigger points. Skip first 2 rows. Col 1: cps_zone, Col 2-37: Periods 1-36."),
    exit_points_file: UploadFile = File(..., description="Excel file for 5th percentile exit points. Skip first 2 rows. Col 1: cps_zone, Col 2-37: Periods 1-36."),
    growing_seasons_file: UploadFile = File(..., description="Excel file for growing seasons. Cols: cps_zone, start, end."),
    db_session: Session = Depends(db.get_db)
):
    files_to_process: Dict[str, UploadFile] = {
        "trigger": trigger_points_file,
        "exit": exit_points_file,
        "season": growing_seasons_file
    }
    saved_files_info: List[Dict[str, Optional[str]]] = [] # original_filename can be None if UploadFile.filename is None
    dataframes: Dict[str, pd.DataFrame] = {}

    try:
        for key, file_obj in files_to_process.items():
            if file_obj.filename is None:
                 raise HTTPException(status_code=400, detail=f"File for '{key}' is missing a filename.")
            # Ensure filename is a string before using endswith
            current_filename_str = str(file_obj.filename)
            if not current_filename_str.endswith(('.xls', '.xlsx')):
                raise HTTPException(status_code=400, detail=f"Invalid file type for {key} file ({current_filename_str}). Only Excel files (.xls, .xlsx) are allowed.")

            file_prefix = f"cps_{key}_points_" if key != "season" else "cps_growing_season_"
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            
            base, ext = get_safe_filename_parts(file_obj) # Relies on file_obj.filename being checked
            safe_filename = f"{file_prefix}{base.replace(' ', '_')}_{timestamp}{ext}"
            file_path = os.path.join(CPS_ZONE_FILES_DIR, safe_filename)

            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file_obj.file, buffer)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Could not save file {current_filename_str}: {e}")
            finally:
                file_obj.file.seek(0) 

            saved_files_info.append({
                "original_filename": current_filename_str,
                "saved_filename": safe_filename,
                "file_path": file_path,
                "upload_type": key
            })
            
            file_obj.file.seek(0) 
            try:
                if key in ["trigger", "exit"]:
                    df = pd.read_excel(io.BytesIO(file_obj.file.read()), skiprows=2, header=None)
                    # The first column (index 0) is cps_zone. Subsequent columns are period data.
                    df.rename(columns={0: 'cps_zone'}, inplace=True)
                else: # growing_seasons_file
                    df = pd.read_excel(io.BytesIO(file_obj.file.read())) # Assumes headers 'cps_zone', 'start', 'end'
                dataframes[key] = df
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error parsing Excel file {current_filename_str}: {e}")
            finally:
                file_obj.file.seek(0)

        process_and_store_cps_data(
            db_session=db_session,
            trigger_points_df=dataframes["trigger"],
            exit_points_df=dataframes["exit"],
            growing_seasons_df=dataframes["season"],
            saved_files_info=saved_files_info # type: ignore # saved_files_info matches List[dict]
        )
        
        response_files: List[file_schemas.FileUploadResponse] = []
        for info in saved_files_info:
            # Ensure info["saved_filename"] is str for query
            s_filename = str(info["saved_filename"]) if info["saved_filename"] else ""
            db_file_rec = db_session.query(models.UploadedFile).filter(models.UploadedFile.saved_filename == s_filename).first()
            if db_file_rec:
                 response_files.append(file_schemas.FileUploadResponse.from_orm(db_file_rec))
            else:
                print(f"Warning: Could not find saved file record for {s_filename} in DB for response.")

        if not response_files or len(response_files) != len(saved_files_info):
            raise HTTPException(status_code=500, detail="Failed to record all file uploads or generate full response.")

        return response_files

    except HTTPException as http_exc:
        for info in saved_files_info:
            # Ensure info["file_path"] is str for os.path.exists
            f_path = str(info["file_path"]) if info["file_path"] else ""
            if os.path.exists(f_path):
                is_problematic_file = False
                # Ensure info["original_filename"] is str for comparison
                orig_fn = str(info.get("original_filename", ""))
                for _, f_obj_iter in files_to_process.items():
                    f_obj_iter_fn = str(f_obj_iter.filename) if f_obj_iter.filename else ""
                    if f_obj_iter_fn and f_obj_iter_fn in str(http_exc.detail) and orig_fn == f_obj_iter_fn:
                        is_problematic_file = True
                        break
                
                if is_problematic_file or http_exc.status_code >= 500: 
                     if os.path.exists(f_path):
                        os.remove(f_path)
        raise http_exc
    except Exception as e:
        for info in saved_files_info:
            f_path = str(info["file_path"]) if info["file_path"] else ""
            if os.path.exists(f_path):
                os.remove(f_path)
        print(f"Unhandled error during CPS zone file upload: {e}") 
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.get("/{cps_zone_value}/{period_value}", response_model=cps_zone_schemas.CPSZonePeriodConfigResponse)
def get_cps_zone_period_config(cps_zone_value: int, period_value: int, db_session: Session = Depends(db.get_db)):
    if not (0 <= cps_zone_value <= 200):
        raise HTTPException(status_code=400, detail="CPS Zone value must be between 0 and 200.")
    if not (1 <= period_value <= 36):
        raise HTTPException(status_code=400, detail="Period value must be between 1 and 36.")

    config_entry = db_session.query(models.CPSZonePeriodConfig).filter(
        models.CPSZonePeriodConfig.cps_zone == cps_zone_value,
        models.CPSZonePeriodConfig.period == period_value
    ).first()

    if config_entry is None:
        # Per requirement: return 0.0 for trigger/exit if period is outside active growing season (or not configured)
        response_data = {
            "id": 0, # Placeholder ID as no DB record exists for this specific state
            "cps_zone": cps_zone_value,
            "period": period_value,
            "trigger_point": 0.0,
            "exit_point": 0.0,
            "created_at": datetime.datetime.utcnow(), # Placeholder date
            "updated_at": datetime.datetime.utcnow()  # Placeholder date
        }
        return cps_zone_schemas.CPSZonePeriodConfigResponse(**response_data)

    return config_entry


@router.get("/zone/{cps_zone_value}", response_model=List[cps_zone_schemas.CPSZonePeriodConfigResponse])
def get_all_periods_for_cps_zone(cps_zone_value: int, db_session: Session = Depends(db.get_db)):
    if not (0 <= cps_zone_value <= 200):
        raise HTTPException(status_code=400, detail="CPS Zone value must be between 0 and 200.")
    
    configs = db_session.query(models.CPSZonePeriodConfig).filter(
        models.CPSZonePeriodConfig.cps_zone == cps_zone_value
    ).order_by(models.CPSZonePeriodConfig.period).all()
    
    if not configs:
        # If a zone has no data at all, it means it was never uploaded or fully cleared.
        # Return empty list, as client might expect a list. Or 404 if that's preferred.
        # For now, returning empty list to match response_model=List[...]
        return [] 
        # Alternative: raise HTTPException(status_code=404, detail=f"No configuration data found for CPS Zone {cps_zone_value}.")
    return configs


@router.get("/files/{filename}", response_class=FileResponse)
async def get_uploaded_cps_file(filename: str, db_session: Session = Depends(db.get_db)):
    db_file = db_session.query(models.UploadedFile).filter(
        models.UploadedFile.saved_filename == filename,
        models.UploadedFile.file_type == "cps_zone_config" 
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or not authorized for this type.")

    file_path = os.path.join(CPS_ZONE_FILES_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File record exists but file not found on server.")
    
    download_filename_str = filename 
    # Explicitly check if db_file.filename (original filename) is not None and is a non-empty string
    if db_file.filename is not None and str(db_file.filename).strip() != "":
        download_filename_str = str(db_file.filename)
    
    return FileResponse(path=file_path, filename=download_filename_str)


@router.get("/files/", response_model=List[file_schemas.FileUploadResponse])
def list_uploaded_cps_files(db_session: Session = Depends(db.get_db)):
    files = db_session.query(models.UploadedFile).filter(
        models.UploadedFile.file_type == "cps_zone_config"
    ).order_by(models.UploadedFile.uploaded_at.desc()).all()
    return [file_schemas.FileUploadResponse.from_orm(f) for f in files]
