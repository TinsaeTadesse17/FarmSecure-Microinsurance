import { ReactNode } from 'react';

const API_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1`;

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") return {};
  return { Authorization: `Bearer ${raw.trim()}` };
};

export interface PolicyCreateRequest {
  enrollment_id: number;
}

export interface Policy {
  details: any;
  policy_no: ReactNode;
  fiscal_year: ReactNode;
  policy_id: number;
  enrollment_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyDetail {
  detail_id: number;
  policy_id: number;
  key: string;
  value: string;
}

// Utility for better error extraction
const extractError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.detail || res.statusText;
  } catch {
    return res.statusText;
  }
};

// 1. Create policy
export async function createPolicy(data: PolicyCreateRequest): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 2. Approve policy
export async function approvePolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/approve`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 3. Reject policy
export async function rejectPolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/reject`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 4. Get a single policy
export async function getPolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// Get a single policy by enrollment ID
export async function getPolicyByEnrollment(enrollment_id: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/by-enrollment/${enrollment_id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 5. Get policy details
export async function getPolicyDetails(policyId: number): Promise<PolicyDetail[]> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/details`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 6. List all policies
export async function listPolicies(): Promise<Policy[]> {
  const res = await fetch(`${API_BASE}/policies`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 6b. List all policies by company ID
export async function listPoliciesbyCompany(company_id: number): Promise<Policy[]> {
  const res = await fetch(`${API_BASE}/policies/by-company/${company_id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 6c. List all policies by user ID
export async function listPoliciesbyUser(user_id: number): Promise<Policy[]> {
  const res = await fetch(`${API_BASE}/policies/by-user/${user_id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 7. List all policy details (bulk)
export async function listPolicyDetails(): Promise<Record<string, any>[]> {
  const res = await fetch(`${API_BASE}/policies/details`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
