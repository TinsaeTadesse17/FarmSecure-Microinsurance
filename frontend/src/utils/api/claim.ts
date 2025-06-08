import axios from 'axios';
import { getToken, getCurrentUser } from './user';
 // Define this based on your schema if needed

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// point at the v1/gateway “claim” controller
const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/claim`;

export interface CustomerClaimsSummary {
  customer_id: number;
  claims: ClaimSummary[];
}
export interface ClaimSummary {
  id: number;
  policy_id: number;
  grid_id: number;
  claim_type: string;
  status: string;
  claim_amount: number;
  created_at: string | null;
  updated_at: string | null;
  period: number;
}

// 1. Get all claims
export async function fetchAllClaims() {
  const res = await axios.get(`${BASE_URL}`, { headers: getAuthHeaders() });
  return res.data;
}

// 2. Get a specific claim by ID
export async function fetchClaimById(claim_id: number) {
  const res = await axios.get(`${BASE_URL}/${claim_id}`, { headers: getAuthHeaders() });
  return res.data;
}

// 3. Trigger crop claims for a given period
export async function submitCropClaim(period: number) {
  const res = await axios.post(
    `${BASE_URL}/claims/crop?period=${period}`,
    null, // no body expected
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// 4. Trigger livestock claims
export async function submitLivestockClaim() {
  const res = await axios.post(
    `${BASE_URL}/claims/livestock`,
    null,
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// 5. Authorize a claim
export async function authorizeClaim(claim_id: number) {
  const res = await axios.put(
    `${BASE_URL}/${claim_id}/authorize`,
    null,
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// 6. Fetch claims grouped by customer
export async function fetchClaimsByCustomer(): Promise<CustomerClaimsSummary[]> {
  try {
    const res = await axios.get<CustomerClaimsSummary[]>(
      `${BASE_URL}/claims/by-customer`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) throw new Error('Unauthorized');
      if (err.response?.status === 404) return [];            // no claims for this user
      throw new Error(err.response?.data?.detail || err.message);
    }
    throw new Error('Failed to load claims');
  }
}

  // 7. Fetch claims grouped by customer for a specific company
export async function fetchClaimsByCustomerByCompany(company_id: number): Promise<CustomerClaimsSummary[]> {
  try {
    const res = await axios.get<CustomerClaimsSummary[]>(
      `${BASE_URL}/claims/by-customer/${company_id}`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) throw new Error('Unauthorized');
      if (err.response?.status === 404) return []; // No claims found for this company
      throw new Error(err.response?.data?.detail || err.message);
    }
    throw new Error('Failed to load claims by company');
  }
}


