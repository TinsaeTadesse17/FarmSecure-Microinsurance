// src/lib/insuranceCompany.ts

const API_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/companies`;

// Safe token accessor
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") return {};
  return { Authorization: `Bearer ${raw.trim()}` };
};

// Central error handler
const extractError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.detail || res.statusText;
  } catch {
    return res.statusText;
  }
};

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
export async function registerCompany(companyData: InsuranceCompanyCreate): Promise<InsuranceCompanyResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(companyData),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 2. Get a single company by ID
export async function getCompany(id: number): Promise<InsuranceCompanyResponse | null> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 3. List companies (with pagination)
export async function listCompanies(skip = 0, limit = 1000): Promise<InsuranceCompanyResponse[]> {
  const res = await fetch(`${API_BASE}/?skip=${skip}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 4. Approve a company
export async function approveCompany(id: number): Promise<InsuranceCompanyResponse> {
  const res = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (res.status === 404) throw new Error('Company not found');
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// 5. Generate credentials for a company
export async function generateCredentials(id: number, role: string): Promise<CredentialResponse> {
  const res = await fetch(`${API_BASE}/${id}/credentials?role=${encodeURIComponent(role)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
