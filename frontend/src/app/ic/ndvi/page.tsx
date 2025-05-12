'use client';

import React, { useState, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

  // =============== FILE HANDLER ===============
  const processFile = useCallback((file: File) => {
    // Validate file type
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
        
        // Basic validation
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

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
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
      const file = fileInput.files?.[0];
      
      if (!file) {
        setError('File not found');
        return;
      }

      const response = await uploadNDVIData({
        file,
        period,
        ndviType
      });

      if (response.success) {
        setSuccess('NDVI data uploaded successfully!');
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

  // =============== RENDER ===============
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Header with Avatar */}
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
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Upload Data</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: .xlsx, .xls (Max 5MB)
                </p>
              </div>
              
              {/* Type and Period Selection */}
              <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                <div className="min-w-[160px]">
                  <label htmlFor="ndviType" className="block text-sm font-medium text-gray-700 mb-1">
                    NDVI Type
                  </label>
                  <select
                    id="ndviType"
                    value={ndviType}
                    onChange={(e) => setNdviType(e.target.value as 'crop' | 'livestock')}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="crop">Crop</option>
                    <option value="livestock">Livestock</option>
                  </select>
                </div>
                <div className="min-w-[120px]">
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num.toString()}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* File Input */}
            <div className="space-y-3">
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
                } cursor-pointer transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-green-500 hover:bg-green-50'}`}
              >
                <div className="flex flex-col items-center text-center">
                  <UploadIcon className={`w-10 h-10 mb-3 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    {isLoading ? 'Processing file...' : 'Drag & drop file here or click to browse'}
                  </span>
                  <span className="text-xs text-gray-500">
                    The file should contain CPS_ZONE and NDVI columns
                  </span>
                </div>
              </label>
              
              {/* File Status */}
              {fileName && (
                <div className="flex items-center p-3 bg-green-50 rounded-md border border-green-100">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">{fileName}</p>
                    <p className="text-xs text-green-600">Ready to upload</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFileName('');
                      setData([]);
                      setError(null);
                      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="flex items-start p-3 bg-red-50 rounded-md border border-red-100">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="flex items-center p-3 bg-green-50 rounded-md border border-green-100">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Success</p>
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Preview */}
          {data.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Data Preview</h3>
                <p className="text-sm text-gray-500">
                  Showing first 10 rows of {data.length - 1} total rows
                </p>
              </div>
              
              <div className="overflow-x-auto border rounded-lg shadow-xs">
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
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !!error}
                  className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
                    isLoading || error 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                  } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Data'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Help Section */}
        <div className="mt-6 bg-white p-4 md:p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-3">File Requirements</h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>Excel file (.xlsx or .xls format)</li>
            <li>Must contain columns named <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">CPS_ZONE</span> and <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">NDVI</span></li>
            <li>At least 200 rows of data recommended for accurate analysis</li>
            <li>First row should contain column headers</li>
            <li>File size should not exceed 5MB</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// Icons
const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);