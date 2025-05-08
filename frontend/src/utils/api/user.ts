// src/lib/userService.ts

const API_BASE =  'http://localhost:8003';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface UserCreate {
  role: string;
  company_id: number;
}

export interface CreateUserResponse {
  username: string;
  password: string;
  company_id: number;
}

export interface UserOut {
  user_id: number;
  username: string;
  role: string | string[];
  company_id: number;
  status: string;
  must_change_password: boolean;
  // …other fields as returned by the API
}

export interface UserUpdate {
  username?: string;
  password?: string;
  status?: string;
}

/**
 * 1. Login
 */
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  console.log('status', res.status);       // log status
  console.log('headers', res.headers);     // log headers
  const json = await res.json();
  console.log('json', json);               // log JSON body

  if (!res.ok) {
    throw new Error(json.detail || res.statusText);
  }

  return json as TokenResponse;
}


/**
 * 2. Create a new user
 */
export async function createUser(data: UserCreate): Promise<CreateUserResponse> {
  const res = await fetch(`${API_BASE}/api/user/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as CreateUserResponse;
}

/**
 * 3. Get current logged-in user
 */
export async function getCurrentUser(token: string): Promise<UserOut> {
  const res = await fetch(`${API_BASE}/api/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as UserOut;
}

/**
 * 4. Update a user account
 */
export async function updateUserAccount(
  userId: number,
  data: UserUpdate,
  token: string
): Promise<UserOut> {
  const res = await fetch(`${API_BASE}/api/user/update/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as UserOut;
}

/**
 * 5. Store access token in localStorage
 */
export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * 6. Get access token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * 7. Remove token from localStorage (logout)
 */
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

