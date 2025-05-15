// src/lib/insuranceCompany.ts
const API_BASE = 'http://localhost:8000/companies'


export interface InsuranceCompanyCreate {
  name: string;
  licenseNo: string;
  licensedBy: string;
  operationDate: string; 
  capital: number;
  country: string;
  city: string;
  phoneNo: string;
  postalCode: string;
  email: string;
}

export interface InsuranceCompanyResponse extends InsuranceCompanyCreate {
  status: string;
  id: number;
  approved: boolean;
  created_at: string;

}

export interface CredentialResponse {
  username: string;
  password: string;
}

// 1. Register a new company
export async function registerCompany(data: InsuranceCompanyCreate) {
  const res = await fetch(`http://localhost:8000/companies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.statusText}`);
  return (await res.json()) as InsuranceCompanyResponse;
}

// 2. Get a single company by ID
export async function getCompany(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Fetch company failed: ${res.statusText}`);
  return (await res.json()) as InsuranceCompanyResponse;
}

// 3. List companies (with pagination)
export async function listCompanies(skip = 0, limit = 1000) {
  const res = await fetch(`${API_BASE}/?skip=${skip}&limit=${limit}`);
  if (!res.ok) throw new Error(`List companies failed: ${res.statusText}`);
  return (await res.json()) as InsuranceCompanyResponse[];
}

// 4. Approve a company
export async function approveCompany(id: number) {
  const res = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'PUT',
  });
  if (res.status === 404) throw new Error('Company not found');
  if (!res.ok) throw new Error(`Approve failed: ${res.statusText}`);
  return (await res.json()) as InsuranceCompanyResponse;
}

// 5. Generate credentials for a company
export async function generateCredentials(id: number, role: string) {
  const res = await fetch(`${API_BASE}/${id}/credentials?role=${encodeURIComponent(role)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generate credentials failed (${res.status}): ${text}`);
  }
  return (await res.json()) as CredentialResponse;
}
