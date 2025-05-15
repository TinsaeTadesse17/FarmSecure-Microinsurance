'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import * as XLSX from 'xlsx';
import { uploadNDVIData } from '@/utils/api/ndvi';
import { fetchAllClaims } from '@/utils/api/claim';
import ClaimsList from '@/components/ic/claimList';

export default function UploadNDVIPage() {
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ndviType, setNdviType] = useState<'crop' | 'livestock'>('crop');
  const [period, setPeriod] = useState<string>('1');
  const [isDragging, setIsDragging] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    if (claims.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedClaims = await fetchAllClaims();
        setClaims(updatedClaims);

        const allProcessed = updatedClaims.every(
          (claim: any) => ['PENDING', 'AUTHORIZED', 'FAILED'].includes(claim.status)
        );

        if (allProcessed) {
          clearInterval(interval);
          setSuccess('All claims have been processed!');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [claims]);

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload an Excel file (.xlsx, .xls)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (parsedData.length < 2) {
          setError('File must contain at least 1 data row (excluding header)');
          return;
        }

        const headers = parsedData[0] as string[];
        if (!headers.includes('CPS_ZONE') || !headers.includes('NDVI')) {
          setError('File must contain CPS_ZONE and NDVI columns');
          return;
        }

        setData(parsedData);
      } catch (err) {
        setError('Failed to parse the file. Please check the format.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    if (!data.length || !fileName) {
      setError('Please upload a valid file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) {
        setError('File not found');
        return;
      }

      const response = await uploadNDVIData({ file, period, ndviType });

      if (response.success || response.message === 'Claims are being processed.') {
        setSuccess('NDVI data uploaded successfully! Fetching claims...');
        const claimsList = await fetchAllClaims();
        setClaims(claimsList);
        setData([]);
        setFileName('');
        if (fileInput) fileInput.value = '';
      } else {
        setError(response.message || 'Failed to upload data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">NDVI Data Upload</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload and process NDVI data for analysis
            </p>
          </div>
          <AvatarMenu />
        </div>

        {/* Upload Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Upload Data</h2>
                <p className="text-sm text-gray-500 mt-1">Supported formats: .xlsx, .xls (Max 5MB)</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                <div className="min-w-[160px]">
                  <label htmlFor="ndviType" className="block text-sm font-medium text-gray-700 mb-1">NDVI Type</label>
                  <select
                    id="ndviType"
                    value={ndviType}
                    onChange={(e) => setNdviType(e.target.value as 'crop' | 'livestock')}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  >
                    <option value="crop">Crop</option>
                    <option value="livestock">Livestock</option>
                  </select>
                </div>
                <div className="min-w-[120px]">
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num.toString()}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />

            <label
              htmlFor="fileInput"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-lg border-2 border-dashed ${
                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
              } cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-green-500 hover:bg-green-50'}`}
            >
              <div className="text-center">
                <p className="text-sm font-medium">{isLoading ? 'Processing...' : 'Click or drag and drop a file'}</p>
                <p className="text-xs text-gray-500">File must include CPS_ZONE and NDVI columns</p>
              </div>
            </label>

            {fileName && (
              <div className="mt-2 text-green-600 text-sm">{fileName} is ready to upload</div>
            )}
            {error && <div className="mt-2 text-red-600 text-sm"> {error}</div>}
            {success && <div className="mt-2 text-green-600 text-sm">{success}</div>}
          </div>

          {data.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Data Preview</h3>
              <div className="overflow-x-auto border rounded-md shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {data[0].map((header: string, i: number) => (
                        <th key={i} className="px-4 py-2 text-left text-xs text-gray-600">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(1, 11).map((row: any[], i) => (
                      <tr key={i} className="even:bg-gray-50">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 text-black">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !!error}
                  className={`px-4 py-2 rounded text-white ${
                    isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLoading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          )}
        </div>

        {claims.length > 0 && <ClaimsList claims={claims} />}
      </main>
    </div>
  );
}
