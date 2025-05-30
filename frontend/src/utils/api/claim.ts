import axios from 'axios';

// Safe token retrieval and cleanup
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem("token");
  if (!raw || raw === 'undefined' || raw === 'null') return {};
  return { Authorization: `Bearer ${raw.trim()}` };
};

const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/claims`;

// Error handler for Axios
const extractAxiosError = (err: any): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail[0]?.msg || 'Request failed';
    return err.message || 'Request failed';
  }
  return 'Request failed';
};

export interface NDVIData {
  period: number;
  ndvi_type: Record<string, number>;
}

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

// 1. Fetch all claims
export async function fetchAllClaims(): Promise<ClaimSummary[]> {
  try {
    const response = await axios.get(`${BASE_URL}/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (err) {
    throw new Error(extractAxiosError(err));
  }
}

// 2. Fetch a specific claim by ID
export async function fetchClaimById(claimId: number): Promise<ClaimSummary> {
  try {
    const response = await axios.get(`${BASE_URL}/${claimId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (err) {
    throw new Error(extractAxiosError(err));
  }
}

// 3. Submit crop claim (NDVI-based)
export async function submitCropClaim(ndviData: NDVIData): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/crop`, ndviData, { headers: getAuthHeaders() });
    return response.data;
  } catch (err) {
    throw new Error(extractAxiosError(err));
  }
}

// 4. Submit livestock claim (NDVI-based)
export async function submitLivestockClaim(ndviData: NDVIData): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/livestock`, ndviData, { headers: getAuthHeaders() });
    return response.data;
  } catch (err) {
    throw new Error(extractAxiosError(err));
  }
}

// 5. Authorize a claim
export async function authorizeClaim(claimId: number): Promise<any> {
  try {
    const response = await axios.put(`${BASE_URL}/${claimId}/authorize`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (err) {
    throw new Error(extractAxiosError(err));
  }
}

// 6. Fetch claims grouped by customer
export async function fetchClaimsByCustomer(): Promise<CustomerClaimsSummary[]> {
  try {
    const response = await axios.get<CustomerClaimsSummary[]>(
      `${BASE_URL}/by-customer`,
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) throw new Error('Unauthorized');
      if (err.response?.status === 404) return [];
    }
    throw new Error(extractAxiosError(err));
  }
}
