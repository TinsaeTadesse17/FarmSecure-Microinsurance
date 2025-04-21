import random

def get_ndvi_index(grid_id: int, period: str) -> float:
    """
    Simulate retrieving an NDVI index for a given grid and period.
    In production, call: GET /api/ndvi/{gridId}/{period}
    """
    return round(random.uniform(0, 1), 2)

def get_trigger_and_exit_points(grid_id: int, claim_type: str) -> (float, float):
    """
    Simulate retrieving trigger and exit points from a configuration endpoint.
    For CROP claims, returns a tuple (trigger_point, exit_point).
    For LIVESTOCK claims, these represent the z-score thresholds.
    """
    if claim_type == "CROP":
        return (0.7, 0.4)
    else:
        return (1.5, 0.5)

def get_policy_details(policy_id: int) -> dict:
    """
    Simulate retrieving policy details from the Policy Administration Service.
    Expected return format:
        {
            "sumInsured": 10000,
            "periods": [
                {"period": "period1", "amount": 2500},
                {"period": "period2", "amount": 2500},
                {"period": "period3", "amount": 2500},
                {"period": "period4", "amount": 2500}
            ]
        }
    """
    return {
        "sumInsured": 10000,
        "periods": [
            {"period": "period1", "amount": 2500},
            {"period": "period2", "amount": 2500},
            {"period": "period3", "amount": 2500},
            {"period": "period4", "amount": 2500}
        ]
    }

def calculate_crop_claim(ndvi_index: float, trigger: float, exit_point: float, sum_insured_period: float) -> float:
    """
    Compute the crop claim according to business rules:
      - Claim = 0, if ndvi_index >= trigger point.
      - Claim = (1 - (ndvi_index - exit_point)/(trigger - exit_point)) * sum_insured_period,
        if exit_point < ndvi_index < trigger.
      - Claim = sum_insured_period, if ndvi_index <= exit_point.
    """
    if ndvi_index >= trigger:
        return 0.0
    elif ndvi_index > exit_point:
        return (1 - (ndvi_index - exit_point) / (trigger - exit_point)) * sum_insured_period
    else:
        return sum_insured_period

def calculate_livestock_claim(z_score: float, trigger: float, exit_point: float, sum_insured_period: float) -> float:
    """
    Compute the livestock claim according to business rules:
      - Claim = 0, if z_score >= trigger point.
      - Claim = ((trigger - z_score) / (trigger - exit_point)) * sum_insured_period,
        if exit_point < z_score < trigger; if the computed claim is less than MP (5% of sum insured),
        then the claim = MP.
      - Claim = sum_insured_period, if z_score <= exit_point.
    """
    mp = 0.05 * sum_insured_period
    if z_score >= trigger:
        return 0.0
    elif z_score > exit_point:
        claim = ((trigger - z_score) / (trigger - exit_point)) * sum_insured_period
        return claim if claim >= mp else mp
    else:
        return sum_insured_period

def calculate_livestock_z_score(grid_id: int, month: str) -> float:
    """
    Simulate computing a livestock z-score using NDVI data:
      - Retrieve three NDVI values (first, second, third decades) for the month.
      - Average them and apply an arbitrary transformation to compute a z-score.
    """
    # Retrieve three NDVI values for different decades
    ndvi_values = [get_ndvi_index(grid_id, f"{month}_decade{i}") for i in range(1, 4)]
    avg_ndvi = sum(ndvi_values) / len(ndvi_values)
    # Arbitrary transformation for demonstration
    z_score = (avg_ndvi - 0.5) * 2
    return round(z_score, 2)
