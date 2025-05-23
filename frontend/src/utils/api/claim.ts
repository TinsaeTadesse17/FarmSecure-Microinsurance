import axios from 'axios';
import { getToken, getCurrentUser } from './user';
 // Define this based on your schema if needed

const BASE_URL = 'http://localhost:8007/api/v1/claim';  

export interface NDVIData {
  period: number;
  ndvi_type: Record<string, number>; 
}

// 1. Fetch all claims
export async function fetchAllClaims() {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
}

// 2. Fetch a specific claim by ID
export async function fetchClaimById(claimId: number) {
  const response = await axios.get(`${BASE_URL}/${claimId}`);
  return response.data;
}

// 3. Submit crop claim (NDVI-based)
export async function submitCropClaim(ndviData: NDVIData) {
  const response = await axios.post(`${BASE_URL}/crop`, ndviData);
  return response.data;
}

// 4. Submit livestock claim (NDVI-based)
export async function submitLivestockClaim(ndviData: NDVIData) {
  const response = await axios.post(`${BASE_URL}/livestock`, ndviData);
  return response.data;
}

// 5. Authorize a claim
export async function authorizeClaim(claimId: number) {
  const response = await axios.put(`${BASE_URL}/${claimId}/authorize`);
  return response.data;
}
// 6. Fetch claims grouped by customer
export interface ClaimSummary {
  id: number;
  policy_id: number;
  grid_id: string;
  claim_type: string;
  status: string;
  claim_amount: number;
  created_at: string | null;
  updated_at: string | null;
  period: number;
}

export interface CustomerClaimsSummary {
  customer_id: number;
  claims: ClaimSummary[];
}

export async function fetchClaimsByCustomer(): Promise<CustomerClaimsSummary[]> {
  const token = getToken();

  try {
    const response = await axios.get<CustomerClaimsSummary[]>(
      `${BASE_URL}/claims/by-customer`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (err.response?.status === 404) {
        // No claims found for this customer
        return [];
      }
      const detail = err.response?.data?.detail;
      throw new Error(detail || 'Failed to load claims');
    }
    throw new Error('Failed to load claims');
  }
}