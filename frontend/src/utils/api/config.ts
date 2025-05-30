const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/config`;
const CLAIM_BASE = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1/claim`;

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

//
// — CPS Zone endpoints —
//
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

export async function getCpsZonePeriodConfig(
  cps_zone_value: number,
  period_value: number
) {
  const res = await fetch(`${BASE_URL}/cps-zone/${cps_zone_value}/${period_value}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch CPS zone period config');
  return res.json();
}

export async function getAllPeriodsForCpsZone(cps_zone_value: number) {
  const res = await fetch(`${BASE_URL}/cps-zone/zone/${cps_zone_value}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch all periods for CPS zone');
  return res.json();
}

export async function listCpsZoneFiles() {
  const res = await fetch(`${BASE_URL}/cps-zone/files`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to list CPS zone files');
  return res.json();
}

export async function downloadCpsZoneFile(filename: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/cps-zone/files/${encodeURIComponent(filename)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to download CPS zone file');
  return res.blob();
}

export async function getGrowingSeasonForGrid(grid_value: number) {
  const res = await fetch(`${BASE_URL}/cps-zone/growing_season/${grid_value}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch growing season for grid');
  return res.json() as Promise<number[]>;
}

export async function checkPeriodInGrowingSeason(
  grid_value: number,
  period: number
) {
  const res = await fetch(
    `${BASE_URL}/cps-zone/growing_season/${grid_value}/${period}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error('Failed to check period in growing season');
  return res.json(); // { growing_season: boolean }
}

//
// — NDVI endpoints —
//
export interface JobStatus {
  job_id: string;
  status: string;
  message?: string;
  error_details?: string;
}

export async function uploadNdviFile(file: File): Promise<JobStatus> {
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
    const err = await res.json();
    throw new Error(err.detail || 'NDVI upload failed');
  }
  return res.json();
}

export async function getNdviJobStatus(job_id: string): Promise<JobStatus> {
  const res = await fetch(`${BASE_URL}/ndvi/upload/status/${job_id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Job status fetch failed');
  return res.json();
}

export async function getNdvi(grid_id: number, period_id: number) {
  const res = await fetch(`${BASE_URL}/ndvi/${grid_id}/${period_id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch NDVI for grid & period');
  return res.json();
}

export async function getNdviForGrid(grid_id: number) {
  const res = await fetch(`${BASE_URL}/ndvi/${grid_id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch NDVI for grid');
  return res.json();
}

export async function getAllNdviData(
  skip = 0,
  limit = 1000
) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await fetch(`${BASE_URL}/ndvi?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch NDVI data');
  return res.json();
}

export async function listNdviFiles() {
  const res = await fetch(`${BASE_URL}/ndvi/files`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to list NDVI files');
  return res.json();
}

export async function downloadNdviFile(filename: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/ndvi/files/${encodeURIComponent(filename)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to download NDVI file');
  return res.blob();
}

//
// — Claim Calculation trigger —
//
export async function startClaimCalculation() {
  const res = await fetch(`${CLAIM_BASE}/trigger`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Starting claim calculation failed');
  }
  return res.json();
}
