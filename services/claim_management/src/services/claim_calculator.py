"""
Module for claim calculation logic.
"""

def calculate_crop_claim(ndvi_val: float, trigger: float, exitp: float, sum_insured: float) -> float:
    """
    Calculate the crop claim amount based on NDVI value, trigger/exit points, and sum insured.
    """
    print(f"[calculate_crop_claim] Inputs: ndvi_val={ndvi_val}, trigger={trigger}, exitp={exitp}, sum_insured={sum_insured}")

    if ndvi_val >= trigger:
        print(f"[calculate_crop_claim] Condition: ndvi_val ({ndvi_val}) >= trigger ({trigger}). Returning 0.0")
        return 0.0
    if ndvi_val <= exitp:
        print(f"[calculate_crop_claim] Condition: ndvi_val ({ndvi_val}) <= exitp ({exitp}). Returning sum_insured ({sum_insured})")
        return sum_insured
    
    # Check for potential division by zero if trigger == exitp (and both non-zero)
    if trigger == exitp:
        print(f"[calculate_crop_claim] Warning: trigger ({trigger}) == exitp ({exitp}) and both are non-zero. This would lead to division by zero. Returning 0.0 to prevent error.")
        return 0.0
        
    ratio = (trigger - ndvi_val) / (trigger - exitp)
    result = round(ratio * sum_insured, 2)
    print(f"[calculate_crop_claim] Calculated ratio: {ratio}, result: {result}")
    return result


def calculate_livestock_claim(z_score: float, sum_insured: float) -> float:
    """
    Calculate the livestock claim amount based on z-score and sum insured.
    """
    print(f"[calculate_livestock_claim] Inputs: z_score={z_score}, sum_insured={sum_insured}")
    LIVESTOCK_TRIGGER = 1.5
    LIVESTOCK_EXIT = 0.5
    LIVESTOCK_MP_PERCENT = 0.1  # minimum payment percentage
    
    print(f"[calculate_livestock_claim] Constants: LIVESTOCK_TRIGGER={LIVESTOCK_TRIGGER}, LIVESTOCK_EXIT={LIVESTOCK_EXIT}, LIVESTOCK_MP_PERCENT={LIVESTOCK_MP_PERCENT}")

    if z_score >= LIVESTOCK_TRIGGER:
        print(f"[calculate_livestock_claim] Condition: z_score ({z_score}) >= LIVESTOCK_TRIGGER ({LIVESTOCK_TRIGGER}). Returning 0.0")
        return 0.0
    if z_score <= LIVESTOCK_EXIT:
        print(f"[calculate_livestock_claim] Condition: z_score ({z_score}) <= LIVESTOCK_EXIT ({LIVESTOCK_EXIT}). Returning sum_insured ({sum_insured})")
        return sum_insured
    
    # Denominator check (though fixed constants make it non-zero here)
    denominator = LIVESTOCK_TRIGGER - LIVESTOCK_EXIT
    if denominator == 0:
        print(f"[calculate_livestock_claim] Warning: LIVESTOCK_TRIGGER == LIVESTOCK_EXIT. This should not happen with current constants. Returning 0.0.")
        return 0.0

    ratio = (LIVESTOCK_TRIGGER - z_score) / denominator
    claim_amount = ratio * sum_insured
    min_payment = LIVESTOCK_MP_PERCENT * sum_insured
    final_amount = max(claim_amount, min_payment)
    print(f"[calculate_livestock_claim] Calculated ratio: {ratio}, initial_claim_amount: {claim_amount}, min_payment: {min_payment}, final_amount: {final_amount}")
    return final_amount
