import axios from 'axios';
import { getToken, getCurrentUser } from './user';
 // Define this based on your schema if needed

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/claims`;  

export interface NDVIData {
  period: number;
  ndvi_type: Record<string, number>; 
}

// 1. Fetch all claims
export async function fetchAllClaims() {
  const response = await axios.get(`${BASE_URL}/`, { headers: getAuthHeaders() });
  return response.data;
}

// 2. Fetch a specific claim by ID
export async function fetchClaimById(claimId: number) {
  const response = await axios.get(`${BASE_URL}/${claimId}`, { headers: getAuthHeaders() });
  return response.data;
}

// 3. Submit crop claim (NDVI-based)
export async function submitCropClaim(ndviData: NDVIData) {
  const response = await axios.post(`${BASE_URL}/crop`, ndviData, { headers: getAuthHeaders() });
  return response.data;
}

// 4. Submit livestock claim (NDVI-based)
export async function submitLivestockClaim(ndviData: NDVIData) {
  const response = await axios.post(`${BASE_URL}/livestock`, ndviData, { headers: getAuthHeaders() });
  return response.data;
}

// 5. Authorize a claim
export async function authorizeClaim(claimId: number) {
  const response = await axios.put(`${BASE_URL}/${claimId}/authorize`, {}, { headers: getAuthHeaders() }); // Added empty data object for PUT
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
  // const token = getToken(); // Replaced with getAuthHeaders

  try {
    const response = await axios.get<CustomerClaimsSummary[]>(
      `${BASE_URL}/by-customer`,
      {
        headers: getAuthHeaders() // Use getAuthHeaders for consistency
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