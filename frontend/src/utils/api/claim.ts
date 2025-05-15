import axios from 'axios';
 // Define this based on your schema if needed

const BASE_URL = 'http://localhost:8007/api/claim';  

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
