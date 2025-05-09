'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import * as XLSX from 'xlsx';
import { uploadNDVIData } from '@/utils/api/ndvi';

export default function UploadNDVIPage() {
  // =============== STATE MANAGEMENT ===============
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ndviType, setNdviType] = useState<'crop' | 'livestock'>('crop');
  const [period, setPeriod] = useState<string>('1');

  // =============== FILE HANDLER ===============
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload an Excel file (.xlsx, .xls)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws, { header: 1 });
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
      // Get the file again to send to the API
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      const file = await new Promise<File>((resolve) => {
        fileInput.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) resolve(files[0]);
        };
        // Create a fake click event to trigger file selection
        const clickEvent = new MouseEvent('click');
        fileInput.dispatchEvent(clickEvent);
      });

      const response = await uploadNDVIData({
        file,
        period,
        ndviType
      });

      if (response.success) {
        setSuccess('NDVI data uploaded successfully!');
        setData([]);
        setFileName('');
      } else {
        setError(response.message || 'Failed to upload data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // =============== RENDER ===============
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8">
        {/* Header with Avatar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">NDVI Data Upload</h1>
          <AvatarMenu />
        </div>

        {/* Upload Card */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Upload Excel File</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please upload an Excel file with CPS_ZONE and NDVI columns (200 rows required)
            </p>
            
            {/* Type and Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="ndviType" className="block text-sm font-medium text-gray-700 mb-1">
                  NDVI Type
                </label>
                <select
                  id="ndviType"
                  value={ndviType}
                  onChange={(e) => setNdviType(e.target.value as 'crop' | 'livestock')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="crop">Crop</option>
                  <option value="livestock">Livestock</option>
                </select>
              </div>
              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                  Period (1-30)
                </label>
                <select
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num.toString()}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* File Input */}
            <label className="flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div className="flex flex-col items-center">
                <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {isLoading ? 'Processing...' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  XLSX or XLS (Max 5MB)
                </span>
              </div>
            </label>
            
            {/* Status Indicators */}
            {fileName && (
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Selected file:</span> {fileName}
              </p>
            )}
            
            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            {success && (
              <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md">
                <p className="text-sm">{success}</p>
              </div>
            )}
          </div>

          {/* Data Preview */}
          {data.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Preview (First 10 rows)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {data[0].map((header: string, i: number) => (
                        <th 
                          key={i} 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(1, 11).map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, colIndex) => (
                          <td 
                            key={colIndex} 
                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isLoading || !!error}
                >
                  {isLoading ? 'Uploading...' : 'Submit Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Simple Upload Icon Component
const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);