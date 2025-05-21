import pandas as pd
from sklearn.neighbors import KDTree
import pickle
import numpy as np
class GridAndZoneGetter:
    def __init__(self, tree_path="src/utils/kdtree.pkl", data_path="src/utils/selected_data_sorted.pkl", distance_threshold=0.9):
        with open(tree_path, "rb") as f:
            self.tree_model = pickle.load(f)
        with open(data_path, "rb") as f:
            self.data_df = pickle.load(f)
        self.distance_threshold = distance_threshold

    def get_grid_and_zone_inference_filtered(self, lat, lon):
        if self.data_df.empty:
            return None, None
        dist, ind = self.tree_model.query([[lon, lat]], k=1)
        closest_distance = dist[0][0]
        if closest_distance <= self.distance_threshold:
            closest_row_index = self.data_df.iloc[ind[0][0]].name
            closest_row = self.data_df.loc[closest_row_index]
            return float(closest_row["GRID_CODE"]), float(closest_row["CPS_ZONE"])
        else:
            print(f"Closest point is too far (distance: {closest_distance:.4f}), exceeding the threshold of {self.distance_threshold}.")
            return None, None
