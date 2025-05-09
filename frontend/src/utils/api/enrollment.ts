// src/lib/api/enrollment.ts

export interface EnrollmentPayload {
    f_name: string;
    m_name: string;
    l_name: string;
    account_no: string;
    account_type: string;
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
  }
  
  export interface EnrollmentResponse {
    enrolement_id: number;
    customer_id: number;
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
  }
  
  const API_BASE = process.env.NEXT_PUBLIC_ENROLLMENT_API || 'http://localhost:8022/api/enrollments';
  
  export async function createEnrollment(data: EnrollmentPayload): Promise<EnrollmentResponse> {
    const res = await fetch(`${API_BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
    return res.json();
  }
  
  export async function getEnrollment(id: number): Promise<EnrollmentResponse> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
    return res.json();
  }
  
  export async function listEnrollments(): Promise<EnrollmentResponse[]> {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
    return res.json();
  }
  
  export async function approveEnrollment(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/${id}/approve`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
    return res.json();
  }
  
  export async function rejectEnrollment(id: number): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/${id}/reject`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
    return res.json();
  }
  