// src/lib/api/config.ts

const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/config`;
const CLAIM_SERVICE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/claims`;

// Safe token accessor
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem("token");
  if (!raw || raw === "null" || raw === "undefined") return {};
  return { Authorization: `Bearer ${raw.trim()}` };
};

// Shared error extractor
const extractError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.detail || res.statusText;
  } catch {
    return res.statusText;
  }
};

// Upload CPS zone files
export async function uploadCpsZoneFiles(
  triggerPointsFile: File,
  exitPointsFile: File,
  growingSeasonsFile: File
): Promise<any> {
  const form = new FormData();
  form.append("trigger_points_file", triggerPointsFile);
  form.append("exit_points_file", exitPointsFile);
  form.append("growing_seasons_file", growingSeasonsFile);

  const res = await fetch(`${BASE_URL}/cps-zone/upload-set`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: form,
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export interface JobStatus {
  job_id: string;
  status: string;
  message?: string;
  error_details?: string;
}

// Upload NDVI file
export async function uploadNdviFile(file: File): Promise<JobStatus> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/ndvi/upload`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: form,
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// Check job status
export async function getNdviJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE_URL}/ndvi/upload/status/${jobId}`, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// Trigger claim calculation
export async function startClaimCalculation(): Promise<any> {
  const res = await fetch(`${CLAIM_SERVICE_URL}/trigger`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
