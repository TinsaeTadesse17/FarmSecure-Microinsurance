import pandas as pd
from sklearn.neighbors import KDTree
import pickle
import numpy as np
import logging
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GridAndZoneGetter:
    def __init__(self, tree_path="src/utils/kdtree.pkl", data_path="src/utils/selected_data_sorted.pkl", distance_threshold=0.9):
        logger.info("Initializing GridAndZoneGetter...")

        with open(tree_path, "rb") as f:
            self.tree_model = pickle.load(f)
            logger.info(f"KDTree model loaded from {tree_path}")

        with open(data_path, "rb") as f:
            self.data_df = pickle.load(f)
            logger.info(f"Data loaded from {data_path}")
            logger.info(f"DataFrame columns: {self.data_df.columns.tolist()}")  # log actual column names

        self.distance_threshold = distance_threshold
        logger.info(f"Distance threshold set to {self.distance_threshold}")

    def _get_with_alias(self, row, key):
        alias_map = {
            "lattitude": "lattitude",     # actual column is misspelled
            "latitude": "lattitude",
            "longtitude": "longitude",
            "longitude": "longitude"
        }
        actual_key = alias_map.get(key, key)
        if actual_key not in row:
            raise KeyError(f"Expected key '{actual_key}' not found in data row.")
        return row[actual_key]

    def get_grid_and_zone_inference_filtered(self, lat, lon):
        logger.info(f"Querying grid and zone for coordinates: lat={lat}, lon={lon}")

        if self.data_df.empty:
            logger.warning("DataFrame is empty. Returning None, None.")
            return None, None

        dist, ind = self.tree_model.query([[lon, lat]], k=1)
        logger.info(f"KDTree query result: dist={dist}, ind={ind}")

        closest_distance = dist[0][0]
        if closest_distance <= self.distance_threshold:
            closest_row_index = self.data_df.iloc[ind[0][0]].name
            closest_row = self.data_df.loc[closest_row_index]

            closest_lat = self._get_with_alias(closest_row, "lattitude")
            closest_lon = self._get_with_alias(closest_row, "longtitude")

            logger.info(f"Closest match coordinates (from dataset): lattitude={closest_lat}, longtitude={closest_lon}")
            logger.info(f"Closest row found: {closest_row.to_dict()}")

            if not (1 <= closest_row["CPS_ZONE"] <= 200):
                logger.error(f"CPS_ZONE {closest_row['CPS_ZONE']} is out of range (1–200).")
                raise ValueError(f"CPS_ZONE {closest_row['CPS_ZONE']} is out of range (1–200).")

            logger.info(f"Returning GRID_CODE={closest_row['GRID_CODE']}, CPS_ZONE={closest_row['CPS_ZONE']}")
            return float(closest_row["GRID_CODE"]), float(closest_row["CPS_ZONE"])
        else:
            logger.warning(f"Closest distance {closest_distance} exceeds threshold {self.distance_threshold}. Returning None, None.")
            return None, None
