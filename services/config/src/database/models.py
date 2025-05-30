from sqlalchemy import Column, Integer, String, Float, DateTime, func, UniqueConstraint # Added UniqueConstraint
from .db import Base
import datetime

class CPSZonePeriodConfig(Base):
    __tablename__ = "cps_zone_period_config"

    id = Column(Integer, primary_key=True, index=True)
    cps_zone = Column(Integer, index=True, nullable=False) # Should be 0-200 as per usage
    period = Column(Integer, index=True, nullable=False) # 1-36
    trigger_point = Column(Float, nullable=False)
    exit_point = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint('cps_zone', 'period', name='_cps_zone_period_uc'),)


class NDVI(Base):
    __tablename__ = "ndvi"

    id = Column(Integer, primary_key=True, index=True)
    grid = Column(Integer, index=True, nullable=False)
    period = Column(Integer, index=True, nullable=False)
    ndvi = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint('grid', 'period', name='_grid_period_uc'),)


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False) # Original filename, not necessarily unique if re-uploaded
    saved_filename = Column(String, unique=True, index=True, nullable=False) # Timestamped or uniquely named file on server
    file_type = Column(String, nullable=False) # 'cps_zone' or 'ndvi' - general category
    upload_type = Column(String, nullable=True) # More specific: 'trigger', 'exit', 'season', 'ndvi_grid'
    uploaded_at = Column(DateTime, default=func.now()) # Renamed from upload_date
    file_path = Column(String, nullable=False) # Path where the file is stored


class GrowingSeasonByGrid(Base):
    __tablename__ = "growing_season_by_grid"

    id = Column(Integer, primary_key=True, index=True)
    grid = Column(Integer, index=True, nullable=False)
    start_period = Column(Integer, nullable=False)
    end_period = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
