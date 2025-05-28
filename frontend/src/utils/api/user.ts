
const API_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}`;


export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface UserCreate {
  email?: string;       // optional now
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
  // …other fields as returned by the API
}

export interface UserUpdate {
  username?: string;
  password?: string;
  status?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken(); // getToken() uses localStorage.getItem('token')
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

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
export async function createUser(data: UserCreate): Promise<CreateUserResponse> { // Removed token parameter
  const res = await fetch(`${API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Added auth headers
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as CreateUserResponse;
}

/**
 * 2. Create a new user(agent)
 */

export async function createAgentUser(data: UserCreate): Promise<CreateUserResponse> { // Removed token parameter
  const res = await fetch(`${API_BASE}/api/user/agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Used getAuthHeaders
    },
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
export async function getCurrentUser(): Promise<UserOut> {
  const token = getToken(); // gets it from localStorage

  if (!token) {
    throw new Error('No token found');
  }

  const res = await fetch(`${API_BASE}/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }

  return await res.json() as UserOut;
}


/**
 * 4. Update a user account
 */
export async function updateUserAccount(
  userId: string, data: UserUpdate
): Promise<UserOut> {
  const res = await fetch(`${API_BASE}/api/user/update/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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

/**
 * 8. Get users with IC role
 */
export async function getIcUsers(): Promise<UserOut[]> { // Removed token parameter
  const res = await fetch(`${API_BASE}/api/user/ics`, {
    headers: { ...getAuthHeaders() }, // Used getAuthHeaders
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as UserOut[];
}

/**
 * 9. Get agents for the current user's company
 */
export async function getAgentUsers(): Promise<UserOut[]> { // Removed token parameter
  const res = await fetch(`${API_BASE}/api/user/agents`, {
    headers: { ...getAuthHeaders() }, // Used getAuthHeaders
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return (await res.json()) as UserOut[];
}