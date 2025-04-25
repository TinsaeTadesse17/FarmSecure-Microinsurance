from sqlalchemy import (
    Column, Integer, String, Date, ForeignKey, Float, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from src.database.db import Base
import enum

class ProductType(enum.Enum):
    crop = "crop"
    livestock = "livestock"

class CPSZone(Base):
    __tablename__ = "cps_zone"

    zone_id   = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String(length=100), unique=True, nullable=False)

    growing_seasons = relationship("GrowingSeason", back_populates="zone")
    ndvi_data       = relationship("NDVICrop", back_populates="zone")
    triggers        = relationship("TriggerExitPoint", back_populates="zone")

class Product(Base):
    __tablename__ = "product"

    product_id   = Column(Integer, primary_key=True, index=True)
    product_type = Column(SQLEnum(ProductType), unique=True, nullable=False)

    growing_seasons = relationship("GrowingSeason", back_populates="product")
    triggers        = relationship("TriggerExitPoint", back_populates="product")

class Period(Base):
    __tablename__ = "period"

    period_id   = Column(Integer, primary_key=True, index=True)
    period_name = Column(String(length=50), unique=True, nullable=False)
    date_from   = Column(Date, nullable=False)
    date_to     = Column(Date, nullable=False)

    ndvi_data = relationship("NDVICrop", back_populates="period")
    triggers  = relationship("TriggerExitPoint", back_populates="period")

class GrowingSeason(Base):
    __tablename__ = "growing_season"

    season_id  = Column(Integer, primary_key=True, index=True)
    season_type = Column(String(length=50), nullable=False)
    length      = Column(Integer, nullable=False)
    date_from   = Column(Date, nullable=False)
    date_to     = Column(Date, nullable=False)
    zone_id     = Column(Integer, ForeignKey("cps_zone.zone_id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("product.product_id"), nullable=False)

    zone     = relationship("CPSZone", back_populates="growing_seasons")
    product  = relationship("Product", back_populates="growing_seasons")
    ndvi_data = relationship("NDVICrop", back_populates="growing_season")
    triggers  = relationship("TriggerExitPoint", back_populates="growing_season")

class NDVICrop(Base):
    __tablename__ = "ndvi_crop"

    ndvi_id           = Column(Integer, primary_key=True, index=True)
    zone_id           = Column(Integer, ForeignKey("cps_zone.zone_id"), nullable=False)
    fiscal_year       = Column(Integer, nullable=False)
    growing_season_id = Column(Integer, ForeignKey("growing_season.season_id"), nullable=True)
    period_id         = Column(Integer, ForeignKey("period.period_id"), nullable=False)
    index_value       = Column(Float, nullable=False)

    zone           = relationship("CPSZone", back_populates="ndvi_data")
    period         = relationship("Period", back_populates="ndvi_data")
    growing_season = relationship("GrowingSeason", back_populates="ndvi_data")

class TriggerExitPoint(Base):
    __tablename__ = "trigger_exit_points"

    teid               = Column(Integer, primary_key=True, index=True)
    zone_id            = Column(Integer, ForeignKey("cps_zone.zone_id"), nullable=False)
    product_id         = Column(Integer, ForeignKey("product.product_id"), nullable=False)
    fiscal_year        = Column(Integer, nullable=False)
    period_id          = Column(Integer, ForeignKey("period.period_id"), nullable=False)
    growing_season_id  = Column(Integer, ForeignKey("growing_season.season_id"), nullable=False)
    trigger_point      = Column(Integer, nullable=False)
    exit_point         = Column(Integer, nullable=False)
    trigger_percentile = Column(Integer, nullable=False)
    exit_percentile    = Column(Integer, nullable=False)
    elc                = Column(Float, nullable=True)

    zone           = relationship("CPSZone", back_populates="triggers")
    product        = relationship("Product", back_populates="triggers")
    period         = relationship("Period", back_populates="triggers")
    growing_season = relationship("GrowingSeason", back_populates="triggers")
