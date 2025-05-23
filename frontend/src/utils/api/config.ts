const BASE_URL = process.env.NEXT_PUBLIC_CONFIG_SERVICE_URL || "http://localhost:8008";

export async function uploadCpsZoneFiles(
  triggerPointsFile: File,
  exitPointsFile: File,
  growingSeasonsFile: File
) {
  const form = new FormData();
  form.append("trigger_points_file", triggerPointsFile);
  form.append("exit_points_file", exitPointsFile);
  form.append("growing_seasons_file", growingSeasonsFile);

  const res = await fetch(`${BASE_URL}/api/v1/cps-zone/upload-set`, {
    method: 'POST',
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
  const res = await fetch(`${BASE_URL}/api/v1/ndvi/upload`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'NDVI upload failed');
  }
  return res.json() as Promise<JobStatus>;
}

export async function getNdviJobStatus(jobId: string) {
  const res = await fetch(`${BASE_URL}/api/v1/ndvi/upload/status/${jobId}`);
  if (!res.ok) {
    throw new Error('Job status fetch failed');
  }
  return res.json() as Promise<JobStatus>;
}
