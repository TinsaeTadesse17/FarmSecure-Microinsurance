const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/config`;

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; // Changed to 'token' to match user.ts
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export async function uploadCpsZoneFiles(
  triggerPointsFile: File,
  exitPointsFile: File,
  growingSeasonsFile: File
) {
  const form = new FormData();
  form.append("trigger_points_file", triggerPointsFile);
  form.append("exit_points_file", exitPointsFile);
  form.append("growing_seasons_file", growingSeasonsFile);

  const res = await fetch(`${BASE_URL}/cps-zone/upload-set`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: form
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'CPS zone upload failed');
  }
  return res.json();
}

export interface JobStatus {
  job_id: string;
  status: string;
  message?: string;
  error_details?: string;
}

export async function uploadNdviFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/ndvi/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: form
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'NDVI upload failed');
  }
  return res.json() as Promise<JobStatus>;
}

export async function getNdviJobStatus(jobId: string) {
  const res = await fetch(`${BASE_URL}/ndvi/upload/status/${jobId}`, {
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!res.ok) {
    throw new Error('Job status fetch failed');
  }
  return res.json() as Promise<JobStatus>;
}

export async function startClaimCalculation() {
  const CLAIM_SERVICE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/claims`;
  const res = await fetch(`${CLAIM_SERVICE_URL}/trigger`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Starting claim calculation failed');
  }
  return res.json();
}
