// src/lib/api/policy.ts

const API_BASE = 'http://localhost:8009/api'; // adjust as necessary

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

// 1. Create policy
export async function createPolicy(data: PolicyCreateRequest): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create policy');
  return res.json();
}

// 2. Approve policy
export async function approvePolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/approve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to approve policy');
  return res.json();
}

// 3. Reject policy
export async function rejectPolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/reject`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reject policy');
  return res.json();
}

// 4. Get a single policy
export async function getPolicy(policyId: number): Promise<Policy> {
  const res = await fetch(`${API_BASE}/policy/${policyId}`);
  if (!res.ok) throw new Error('Failed to fetch policy');
  return res.json();
}

// 5. Get policy details
export async function getPolicyDetails(policyId: number): Promise<PolicyDetail[]> {
  const res = await fetch(`${API_BASE}/policy/${policyId}/details`);
  if (!res.ok) throw new Error('Failed to fetch policy details');
  return res.json();
}

// 6. List all policies
export async function listPolicies(): Promise<Policy[]> {
  const res = await fetch(`${API_BASE}/policies`);
  if (!res.ok) throw new Error('Failed to fetch policies');
  return res.json();
}

// 7. List all policy details (bulk)
export async function listPolicyDetails(): Promise<Record<string, any>[]> {
  const res = await fetch(`${API_BASE}/policies/details`);
  if (!res.ok) throw new Error('Failed to fetch all policy details');
  return res.json();
}
