import axios from 'axios';

//  Safe token fetch and trim
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") return {};
  return { Authorization: `Bearer ${raw.trim()}` };
};

const CLAIM_SERVICE_BASE_URL = `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_GATEWAY_PORT}/api`;

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

//  Utility to extract error message from Axios response
const extractAxiosError = (error: any): string => {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail[0]?.msg || 'Upload failed';
    }
    return error.response.data.detail;
  }
  return error.message || 'Unknown error occurred';
};

export const uploadNDVIData = async ({ file, period, ndviType }: UploadNDVIParams): Promise<NDVIResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `${CLAIM_SERVICE_BASE_URL}/upload_ndvi?period=${period}&ndvi_type=${ndviType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
      }
    );

    return { success: true, data: response.data };

  } catch (error: any) {
    console.error('Error uploading NDVI data:', error);
    return {
      success: false,
      message: extractAxiosError(error),
    };
  }
};
