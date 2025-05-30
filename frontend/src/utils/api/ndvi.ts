import axios from 'axios';

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api/v1`;

interface UploadNDVIParams {
  file: File;
  period: string;
  ndviType: 'crop' | 'livestock';
}

interface NDVIResponse {
  success: boolean;
  message?: string;
  data?: any;
}

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