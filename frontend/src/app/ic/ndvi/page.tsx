'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import * as XLSX from 'xlsx';
import { uploadNDVIData } from '@/utils/api/ndvi';
import { fetchAllClaims } from '@/utils/api/claim';
import ClaimsList from '@/components/ic/claimList';
import { Upload, FileText, Sprout, Clock, AlertCircle } from 'lucide-react';

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
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              NDVI Data Upload
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Insurance Cooperative
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f]">
              Upload and process NDVI data for agricultural insurance analysis
            </p>
          </div>
          <AvatarMenu />
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6 shadow-sm mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#3a584e] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8ba77f]" />
                Data Upload
              </h2>
              <p className="text-sm text-[#7a938f]">Supported formats: .xlsx, .xls (Max 5MB)</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm text-[#7a938f] mb-1">NDVI Type</label>
                <select
                  value={ndviType}
                  onChange={(e) => setNdviType(e.target.value as 'crop' | 'livestock')}
                  className="w-full bg-[#eef4e5] border border-[#e0e7d4] text-[#3a584e] px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#8ba77f]"
                >
                  <option value="crop">Crop</option>
                  <option value="livestock">Livestock</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm text-[#7a938f] mb-1">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-[#eef4e5] border border-[#e0e7d4] text-[#3a584e] px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#8ba77f]"
                >
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
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
            className={`block group transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-[#f5f3eb]'
            }`}
          >
            <div className={`p-8 rounded-xl border-2 border-dashed ${
              isDragging ? 'border-[#8ba77f] bg-[#f5f3eb]' : 'border-[#e0e7d4]'
            } transition-colors`}>
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <Upload className={`w-8 h-8 ${
                  isDragging ? 'text-[#8ba77f]' : 'text-[#7a938f]'
                } transition-colors`} />
                <p className={`font-medium ${
                  isDragging ? 'text-[#8ba77f]' : 'text-[#3a584e]'
                } transition-colors`}>
                  {isLoading ? 'Processing...' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-[#7a938f]">Requires CPS_ZONE and NDVI columns</p>
              </div>
            </div>
          </label>

          <div className="mt-4 space-y-2">
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-[#8ba77f]">
                <FileText className="w-4 h-4" />
                {fileName} ready for upload
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-[#8ba77f]">
                <Clock className="w-4 h-4" />
                {success}
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#3a584e] mb-3">Data Preview</h3>
              <div className="border border-[#e0e7d4] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full divide-y divide-[#e0e7d4]">
                  <thead className="bg-[#f9f8f3]">
                    <tr>
                      {data[0].map((header: string, i: number) => (
                        <th key={i} className="px-4 py-3 text-left text-sm text-[#7a938f] font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e7d4] bg-white">
                    {data.slice(1, 11).map((row: any[], i) => (
                      <tr key={i} className="hover:bg-[#f9f8f3] transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-[#3a584e]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !!error}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                    isLoading ? 'bg-[#c5d3bc]' : 'bg-[#8ba77f] hover:bg-[#7a937f]'
                  } ${
                    error ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Process
                    </>
                  )}
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