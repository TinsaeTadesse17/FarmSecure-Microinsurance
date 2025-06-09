// src/lib/api/enrollment.ts

export interface CustomerInfo {
  f_name: string;
  m_name: string;
  l_name: string;
  account_no: string;
  account_type: string;
}

export interface EnrollmentPayload extends CustomerInfo {
  user_id: number;
  ic_company_id: number;
  branch_id: number;
  premium: number;
  sum_insured: number;
  date_from: string;
  date_to: string;
  receipt_no: string;
  product_id: number;
  cps_zone: string;
  longitude: string;
  grid: string;
  lattitude: string;
}

export interface EnrollmentResponse {
  enrolement_id: number;
  customer_id: number;
  customer: CustomerInfo; 
  createdAt: string;
  user_id: number;
  status: string;
  ic_company_id: number;
  branch_id: number;
  premium: number;
  sum_insured: number;
  date_from: string;
  date_to: string;
  receipt_no: string;
  product_id: number;
  cps_zone: string;
  longtiude: string;
  lattitude: string;
}

// const API_BASE = process.env.NEXT_PUBLIC_ENROLLMENT_API || 'http://localhost:8022/api/enrollments';
const API_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/enrollments`;

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export async function createEnrollment(data: EnrollmentPayload): Promise<EnrollmentResponse> {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}

export async function getEnrollment(id: number): Promise<EnrollmentResponse> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}


export async function getEnrollmentsByCompany(ic_company_id: number): Promise<EnrollmentResponse> {
  const res = await fetch(`${API_BASE}/by-company/${ic_company_id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}

export async function getEnrollmentsByUser(user_id: number): Promise<EnrollmentResponse> {
  const res = await fetch(`${API_BASE}/by-user/${user_id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}

export async function listEnrollments(): Promise<EnrollmentResponse[]> {
  const res = await fetch(`${API_BASE}/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}

export async function approveEnrollment(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}

export async function rejectEnrollment(id: number): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
  return res.json();
}
