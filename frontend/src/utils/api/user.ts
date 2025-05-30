const API_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}`;

//  Universal error extraction
const extractError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.detail || res.statusText;
  } catch {
    return res.statusText;
  }
};

//  Hardened token getter
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('token');
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return raw.trim();
}

//  Save & remove token
export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('token', token);
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('token');
}

//  Auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface UserCreate {
  email?: string;
  role: string;
  company_id: number;
}

export interface CreateUserResponse {
  username: string;
  password: string;
  company_id: number;
}

export interface UserOut {
  created_at: string | number | Date;
  email: string | null;
  sub: string;
  username: string;
  role: string | string[];
  company_id: number;
  status: string;
  must_change_password: boolean;
}

export interface UserUpdate {
  username?: string;
  password?: string;
}

export interface UserStatus {
  status?: string;
}

//  1. Login
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  2. Create new user
export async function createUser(data: UserCreate): Promise<CreateUserResponse> {
  const res = await fetch(`${API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  2b. Create agent user
export async function createAgentUser(data: UserCreate): Promise<CreateUserResponse> {
  const res = await fetch(`${API_BASE}/api/user/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  3. Get current user
export async function getCurrentUser(): Promise<UserOut> {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const res = await fetch(`${API_BASE}/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  4. Update user account
export async function updateUserAccount(userId: string, data: UserUpdate): Promise<UserOut> {
  const res = await fetch(`${API_BASE}/api/user/update/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  5. Get IC users
export async function getIcUsers(): Promise<UserOut[]> {
  const res = await fetch(`${API_BASE}/api/user/ics`, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  6. Get agent users
export async function getAgentUsers(): Promise<UserOut[]> {
  const res = await fetch(`${API_BASE}/api/user/agents`, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

//  7. Update user status
export async function updateUserStatus(userId: string, data: UserStatus): Promise<UserOut> {
  const res = await fetch(`${API_BASE}/api/user/update-status/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
