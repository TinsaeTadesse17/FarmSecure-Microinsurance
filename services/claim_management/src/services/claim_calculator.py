"""
Module for claim calculation logic.
"""

def calculate_crop_claim(ndvi_val: float, trigger: float, exitp: float, sum_insured: float) -> float:
    """
    Calculate the crop claim amount based on NDVI value, trigger/exit points, and sum insured.
    """
    # ensure the trigger and exit points are between 0 and 1 not 0 and 100, convert otherwise
    if trigger > 1:
        trigger /= 100.0   
    if exitp > 1:
        exitp /= 100.0
    if ndvi_val > 1:
        ndvi_val /= 100.0

    if trigger == 0 and exitp == 0:
        return 0.0
    if ndvi_val >= trigger:
        return 0.0
    if ndvi_val <= exitp:
        return sum_insured
    ratio = (trigger - ndvi_val) / (trigger - exitp)
    return round(ratio * sum_insured, 2)


def calculate_livestock_claim(z_score: float, sum_insured: float) -> float:
    """
    Calculate the livestock claim amount based on z-score and sum insured.
    """
    LIVESTOCK_TRIGGER = 1.5
    LIVESTOCK_EXIT = 0.5
    LIVESTOCK_MP_PERCENT = 0.1  # minimum payment percentage
    if z_score >= LIVESTOCK_TRIGGER:
        return 0.0
    if z_score <= LIVESTOCK_EXIT:
        return sum_insured
    ratio = (LIVESTOCK_TRIGGER - z_score) / (LIVESTOCK_TRIGGER - LIVESTOCK_EXIT)
    claim_amount = ratio * sum_insured
    min_payment = LIVESTOCK_MP_PERCENT * sum_insured
    return max(claim_amount, min_payment)
