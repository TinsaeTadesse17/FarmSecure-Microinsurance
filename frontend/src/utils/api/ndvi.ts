import axios from 'axios';


const CLAIM_SERVICE_BASE_URL = 'http://localhost:8001/api'

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
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error uploading NDVI data:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail?.[0]?.msg || 'Failed to upload NDVI data' 
    };
  }
};