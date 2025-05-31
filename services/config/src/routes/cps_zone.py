import io
import pandas as pd
import shutil
import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path # Added Path
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional

from src.database import models, db
from src.schemas import cps_zone as cps_zone_schemas
from src.schemas import file as file_schemas
from src.schemas import growing_season as growing_season_schemas # New import

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
    growing_seasons_df: pd.DataFrame, # For the new GrowingSeasonByGrid table
    saved_files_info: List[dict]
):
    try:
        # Validate growing seasons data (for new table)
        if not all(col in growing_seasons_df.columns for col in ['grid', 'start', 'end']):
            raise HTTPException(status_code=400, detail="Growing season file must contain 'grid', 'start', and 'end' columns.")
        if not pd.api.types.is_numeric_dtype(growing_seasons_df['grid']) or \
           not pd.api.types.is_numeric_dtype(growing_seasons_df['start']) or \
           not pd.api.types.is_numeric_dtype(growing_seasons_df['end']):
            raise HTTPException(status_code=400, detail="'grid', 'start', and 'end' columns in growing season file must be numeric.")
        if not (growing_seasons_df['grid'] >= 1).all():
            raise HTTPException(status_code=400, detail="'grid' values in growing season file must be 1 or greater.")
        if not ((growing_seasons_df['start'] >= 1) & (growing_seasons_df['start'] <= 36)).all() or \
           not ((growing_seasons_df['end'] >= 1) & (growing_seasons_df['end'] <= 36)).all():
            raise HTTPException(status_code=400, detail="Invalid period(s) in growing season file. Start/End must be 1-36")

        # Validate percentile files (trigger and exit points)
        for df, name in [(trigger_points_df, "Trigger points"), (exit_points_df, "Exit points")]:
            if 'cps_zone' not in df.columns:
                raise HTTPException(status_code=400, detail=f"{name} file must contain a 'cps_zone' column. Ensure it's named 'cps_zone'.")
            if not pd.api.types.is_numeric_dtype(df['cps_zone']):
                 raise HTTPException(status_code=400, detail=f"'cps_zone' column in {name} file must be numeric.")
            if not (df['cps_zone'] >= 0).all() or not (df['cps_zone'] <= 200).all():
                raise HTTPException(status_code=400, detail=f"'cps_zone' values in {name} file must be between 0 and 200.")
            if len(df.columns) != 37:
                raise HTTPException(status_code=400, detail=f"{name} file must have a 'cps_zone' column and 36 period columns. Found {len(df.columns)} columns.")
            for col_idx in range(1, 37):
                if not pd.api.types.is_numeric_dtype(df[df.columns[col_idx]]):
                    raise HTTPException(status_code=400, detail=f"Period columns in {name} file must be numeric. Column for period {col_idx} (name: {df.columns[col_idx]}) is not.")

        # After validation, dedupe rows by zone/grid to avoid duplicates
        trigger_points_df = trigger_points_df.drop_duplicates(subset=['cps_zone'], keep='last')
        exit_points_df = exit_points_df.drop_duplicates(subset=['cps_zone'], keep='last')
        growing_seasons_df = growing_seasons_df.drop_duplicates(subset=['grid'], keep='last')

        # Clear existing CPSZonePeriodConfig and GrowingSeasonByGrid data
        # Use .tolist() to ensure native Python ints
        all_cps_zones_in_percentile_files = {int(z) for z in trigger_points_df['cps_zone'].unique()} | {int(z) for z in exit_points_df['cps_zone'].unique()}
        if all_cps_zones_in_percentile_files:
            db_session.query(models.CPSZonePeriodConfig).filter(
                models.CPSZonePeriodConfig.cps_zone.in_(all_cps_zones_in_percentile_files)
            ).delete(synchronize_session=False)
        all_grids_in_season_file = {int(g) for g in growing_seasons_df['grid'].unique()}
        if all_grids_in_season_file:
            db_session.query(models.GrowingSeasonByGrid).filter(
                models.GrowingSeasonByGrid.grid.in_(all_grids_in_season_file)
            ).delete(synchronize_session=False)
        db_session.commit()  # commit deletions

        # Bulk upsert CPSZonePeriodConfig entries (trigger & exit) to avoid duplicates
        from sqlalchemy.dialects.postgresql import insert as pg_insert
        now = datetime.datetime.utcnow()
        # Prepare combined rows per (zone,period) to avoid duplicates in same upsert
        rows_map: Dict[tuple[int,int], dict] = {}
        for _, row in trigger_points_df.iterrows():
            zone = int(row['cps_zone'])
            for idx in range(1, 37):
                key = (zone, idx)
                rows_map[key] = {
                    'cps_zone': zone,
                    'period': idx,
                    'trigger_point': float(row.iloc[idx]),
                    'exit_point': 0.0,
                    'created_at': now,
                    'updated_at': now
                }
        for _, row in exit_points_df.iterrows():
            zone = int(row['cps_zone'])
            for idx in range(1, 37):
                key = (zone, idx)
                exit_val = float(row.iloc[idx])
                if key in rows_map:
                    rows_map[key]['exit_point'] = exit_val
                    rows_map[key]['updated_at'] = now
                else:
                    rows_map[key] = {
                        'cps_zone': zone,
                        'period': idx,
                        'trigger_point': 0.0,
                        'exit_point': exit_val,
                        'created_at': now,
                        'updated_at': now
                    }
        rows = list(rows_map.values())
        if rows:
            stmt = pg_insert(models.CPSZonePeriodConfig).values(rows)
            stmt = stmt.on_conflict_do_update(
                index_elements=['cps_zone', 'period'],
                set_={
                    'trigger_point': stmt.excluded.trigger_point,
                    'exit_point': stmt.excluded.exit_point,
                    'updated_at': stmt.excluded.updated_at
                }
            )
            db_session.execute(stmt)
            db_session.commit()

        # Process and store growing season data by grid
        for _, row in growing_seasons_df.iterrows():
            db_session.add(models.GrowingSeasonByGrid(
                grid=int(row['grid']),
                start_period=int(row['start']),
                end_period=int(row['end'])
            ))
        db_session.commit()

        # Save uploaded file metadata
        for file_info in saved_files_info:
            db_file = models.UploadedFile(
                filename=file_info["original_filename"], 
                saved_filename=file_info["saved_filename"],
                file_type="cps_zone_config", # Consider if "growing_season_config" for type "season"
                file_path=file_info["file_path"],
                upload_type=file_info["upload_type"]
            )
            db_session.add(db_file)
        db_session.commit()

    except HTTPException:
        db_session.rollback() 
        for file_info in saved_files_info:
            f_path = str(file_info.get("file_path")) if file_info.get("file_path") else ""
            if f_path and os.path.exists(f_path):
                os.remove(f_path)
        raise
    except Exception as e:
        db_session.rollback()
        for file_info in saved_files_info:
            f_path = str(file_info.get("file_path")) if file_info.get("file_path") else ""
            if f_path and os.path.exists(f_path):
                os.remove(f_path)
        print(f"Error processing CPS Zone files: {e}") 
        raise HTTPException(status_code=500, detail=f"Error processing CPS Zone files: {str(e)}")


@router.post("/upload-set", response_model=List[file_schemas.FileUploadResponse], status_code=201)
async def upload_cps_zone_files(
    trigger_points_file: UploadFile = File(..., description="Excel file for 15th percentile trigger points. Skip first 2 rows. Col 1: cps_zone, Col 2-37: Periods 1-36."),
    exit_points_file: UploadFile = File(..., description="Excel file for 5th percentile exit points. Skip first 2 rows. Col 1: cps_zone, Col 2-37: Periods 1-36."),
    growing_seasons_file: UploadFile = File(..., description="Excel file for growing seasons. Expected columns: grid, start, end."), # UPDATED
    db_session: Session = Depends(db.get_db)
):
    files_to_process: Dict[str, UploadFile] = {
        "trigger": trigger_points_file,
        "exit": exit_points_file,
        "season": growing_seasons_file
    }
    saved_files_info: List[Dict[str, Optional[str]]] = []
    dataframes: Dict[str, pd.DataFrame] = {}

    try:
        for key, file_obj in files_to_process.items():
            if file_obj.filename is None:
                 raise HTTPException(status_code=400, detail=f"File for '{key}' is missing a filename.")
            current_filename_str = str(file_obj.filename)
            if not current_filename_str.endswith(('.xls', '.xlsx')):
                raise HTTPException(status_code=400, detail=f"Invalid file type for {key} file ({current_filename_str}). Only Excel files (.xls, .xlsx) are allowed.")

            file_prefix = f"cps_{key}_points_" if key != "season" else "growing_season_grid_" # UPDATED prefix
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            
            base, ext = get_safe_filename_parts(file_obj)
            safe_filename = f"{file_prefix}{base.replace(' ', '_')}_{timestamp}{ext}"
            file_path = os.path.join(CPS_ZONE_FILES_DIR, safe_filename)

            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file_obj.file, buffer)
            except Exception as e:
                # Clean up this specific file if saving failed before adding to saved_files_info
                if os.path.exists(file_path):
                    os.remove(file_path)
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
                    df.rename(columns={0: 'cps_zone'}, inplace=True)
                else: # growing_seasons_file
                    df = pd.read_excel(io.BytesIO(file_obj.file.read())) # Assumes headers 'grid', 'start', 'end'
                    if not all(col in df.columns for col in ['grid', 'start', 'end']):
                        raise HTTPException(status_code=400, detail="Growing season file is missing required columns: 'grid', 'start', 'end'.")
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
            saved_files_info=saved_files_info # type: ignore
        )
        
        response_files: List[file_schemas.FileUploadResponse] = []
        for info in saved_files_info:
            s_filename = str(info["saved_filename"]) if info["saved_filename"] else ""
            # Ensure we query for the correct file type if it was changed for growing season files
            db_file_rec = db_session.query(models.UploadedFile).filter(
                models.UploadedFile.saved_filename == s_filename
                # Optionally, add: models.UploadedFile.upload_type == info["upload_type"]
            ).first()
            if db_file_rec:
                 response_files.append(file_schemas.FileUploadResponse.from_orm(db_file_rec))
            else:
                print(f"Warning: Could not find saved file record for {s_filename} in DB for response.")
        
        if len(response_files) != len(saved_files_info) and saved_files_info:
             # This indicates an issue if process_and_store_cps_data supposedly succeeded
             # but not all file metadata was found.
            raise HTTPException(status_code=500, detail="Failed to fully record all file uploads or generate complete response.")

        return response_files

    except HTTPException as http_exc:
        for info in saved_files_info:
            f_path = str(info.get("file_path")) if info.get("file_path") else ""
            if f_path and os.path.exists(f_path):
                os.remove(f_path)
        raise http_exc
    except Exception as e:
        for info in saved_files_info:
            f_path = str(info.get("file_path")) if info.get("file_path") else ""
            if f_path and os.path.exists(f_path):
                os.remove(f_path)
        print(f"Unhandled error during file upload: {e}") 
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# New endpoint for growing season by grid
@router.get("/growing_season/{grid_value}", response_model=List[int], tags=["Growing Season"])
async def get_growing_season_for_grid(
    grid_value: int = Path(..., ge=1),
    db_session: Session = Depends(db.get_db)
):
    result = (
        db_session
        .query(models.GrowingSeasonByGrid.start_period,
               models.GrowingSeasonByGrid.end_period)
        .filter(models.GrowingSeasonByGrid.grid == grid_value)
        .first()
    )
    if not result:
        return []

    start, end = result
    if start <= end:
        return list(range(start, end + 1))
    else:
        # handle wrap-around seasons
        return list(range(start, 37)) + list(range(1, end + 1))

@router.get("/growing_season/{grid_value}/{period}", response_model=growing_season_schemas.GrowingSeasonPeriodCheckResponse, tags=["Growing Season"])
async def check_period_in_growing_season_for_grid(
    grid_value: int = Path(..., title="The grid ID", ge=1, description="Identifier for the grid."),
    period: int = Path(..., title="The period number to check", ge=1, le=36, description="Period number (1-36)."),
    db_session: Session = Depends(db.get_db)
):
    """
    Check if a specific period is within the growing season for a given grid.
    Returns {"growing_season": True} if the period is within the season, otherwise {"growing_season": False}.
    """
    result = db_session.query(models.GrowingSeasonByGrid.start_period, models.GrowingSeasonByGrid.end_period).filter(
        models.GrowingSeasonByGrid.grid == grid_value
    ).first()
    if not result:
        return growing_season_schemas.GrowingSeasonPeriodCheckResponse(growing_season=False)
    start, end = result
    return growing_season_schemas.GrowingSeasonPeriodCheckResponse(growing_season=(start <= period <= end))


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
        # If no configuration exists for the given cps_zone and period, return default 0.0 values.
        response_data = {
            "id": 0, 
            "cps_zone_value": cps_zone_value,
            "period_value": period_value,
            "trigger_point": 0.0,
            "exit_point": 0.0,
            "created_at": datetime.datetime.utcnow(), 
            "updated_at": datetime.datetime.utcnow()
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
