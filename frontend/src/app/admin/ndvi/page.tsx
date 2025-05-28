'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { FileText, Upload, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadCpsZoneFiles, uploadNdviFile, getNdviJobStatus, startClaimCalculation } from '@/utils/api/config';

const FileUpload = ({ label, file, onChange }: { label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-[#2c423f]">{label}</label>
    <div className="relative">
      <button
        type="button"
        className="w-full px-4 py-2.5 bg-[#f0f4ec] border-2 border-dashed border-[#8ba77f] rounded-lg hover:bg-[#e4ebe3] transition-colors flex items-center justify-center gap-2 text-[#2c423f]"
        onClick={() => document.getElementById(label)?.click()}
      >
        <Upload className="h-4 w-4 text-[#8ba77f]" />
        <span className="font-medium">Choose File</span>
      </button>
      <input
        id={label}
        type="file"
        onChange={onChange}
        className="hidden"
        accept=".geojson,.json,.csv"
      />
    </div>
    {file && (
      <div className="text-sm text-[#6b7f7c] flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="font-medium">{file.name}</span>
      </div>
    )}
  </div>
);

const AdminConfigPage: React.FC = () => {
  const [triggerFile, setTriggerFile] = useState<File | null>(null);
  const [exitFile, setExitFile] = useState<File | null>(null);
  const [seasonFile, setSeasonFile] = useState<File | null>(null);
  const [cpsLoading, setCpsLoading] = useState(false);
  const [cpsError, setCpsError] = useState<string | null>(null);
  const [cpsSuccess, setCpsSuccess] = useState<string | null>(null);

  const [ndviFile, setNdviFile] = useState<File | null>(null);
  const [ndviLoading, setNdviLoading] = useState(false);
  const [ndviError, setNdviError] = useState<string | null>(null);
  const [ndviSuccess, setNdviSuccess] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const [claimCalculationLoading, setClaimCalculationLoading] = useState(false);
  const [claimCalculationError, setClaimCalculationError] = useState<string | null>(null);
  const [claimCalculationSuccess, setClaimCalculationSuccess] = useState<string | null>(null);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const status = await getNdviJobStatus(jobId!);
          setJobStatus(status.status);
          if (status.status === 'completed') {
            setNdviSuccess(status.message || 'NDVI processing completed successfully');
            confetti();
            clearInterval(interval);
          } else if (status.status === 'failed') {
            setNdviError(status.error_details || 'Processing failed');
            clearInterval(interval);
          }
        } catch {
          setNdviError('Error fetching job status');
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  const handleCpsSubmit = async () => {
    if (!triggerFile || !exitFile || !seasonFile) {
      setCpsError('Please select all three CPS zone files');
      return;
    }
    setCpsLoading(true); setCpsError(null); setCpsSuccess(null);
    try {
      await uploadCpsZoneFiles(triggerFile, exitFile, seasonFile);
      setCpsSuccess('CPS zone configuration uploaded successfully!');
      confetti();
      // Do not reset files here, keep them for claim calculation
    } catch (e: any) {
      setCpsError(e.message || 'Upload failed');
    } finally {
      setCpsLoading(false);
    }
  };

  const handleNdviSubmit = async () => {
    if (!ndviFile) {
      setNdviError('Please select an NDVI file');
      return;
    }
    setNdviLoading(true); setNdviError(null); setNdviSuccess(null); setJobStatus(null);
    try {
      const res = await uploadNdviFile(ndviFile);
      setJobId(res.job_id);
      setJobStatus(res.status);
    } catch (e: any) {
      setNdviError(e.message || 'Upload failed');
    } finally {
      setNdviLoading(false);
    }
  };

  const handleStartClaimCalculation = async () => {
    setClaimCalculationLoading(true);
    setClaimCalculationError(null);
    setClaimCalculationSuccess(null);
    try {
      const response = await startClaimCalculation();
      setClaimCalculationSuccess(response.message || 'Claim calculation started successfully!');
      confetti();
      // Reset all files and states after successful claim calculation
      setTriggerFile(null);
      setExitFile(null);
      setSeasonFile(null);
      setNdviFile(null);
      setCpsSuccess(null); // Clear CPS success message
      setNdviSuccess(null); // Clear NDVI success message
      setJobId(null);
      setJobStatus(null);
    } catch (e: any) {
      setClaimCalculationError(e.message || 'Claim calculation failed');
    } finally {
      setClaimCalculationLoading(false);
    }
  };

  const allFilesUploaded = ndviSuccess && jobStatus === 'completed';

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8 space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configuration</h1>
          <AvatarMenu />
        </header>

        {/* CPS Zone Section */}
        <section className="bg-white p-8 rounded-2xl border border-[#e0e4dd] shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <FileText className="text-[#8ba77f]" />
              CPS Zone Configuration Upload
            </h2>
            <p className="text-[#6b7f7c] text-sm">Upload GeoJSON files for trigger, exit, and season zones</p>
          </div>

          {cpsError && (
            <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{cpsError}</span>
            </div>
          )}

          {cpsSuccess && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{cpsSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUpload
              label="Trigger Zones"
              file={triggerFile}
              onChange={(e) => setTriggerFile(e.target.files?.[0] || null)}
            />
            <FileUpload
              label="Exit Zones"
              file={exitFile}
              onChange={(e) => setExitFile(e.target.files?.[0] || null)}
            />
            <FileUpload
              label="Season Zones"
              file={seasonFile}
              onChange={(e) => setSeasonFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={handleCpsSubmit}
            disabled={cpsLoading}
            className="w-full md:w-auto px-6 py-3 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors flex items-center justify-center gap-2"
          >
            {cpsLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Configuration
          </button>
        </section>

        {/* NDVI Section */}
        <section className="bg-white p-8 rounded-2xl border border-[#e0e4dd] shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <FileText className="text-[#8ba77f]" />
              NDVI Data Upload
            </h2>
            <p className="text-[#6b7f7c] text-sm">Upload NDVI data in CSV format</p>
          </div>

          {ndviError && (
            <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{ndviError}</span>
            </div>
          )}

          {ndviSuccess && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{ndviSuccess}</span>
            </div>
          )}

          <FileUpload
            label="NDVI Data File"
            file={ndviFile}
            onChange={(e) => setNdviFile(e.target.files?.[0] || null)}
          />

          <div className="flex flex-col md:flex-row items-start gap-4 justify-between">
            <button
              onClick={handleNdviSubmit}
              disabled={ndviLoading}
              className="w-full md:w-auto px-6 py-3 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors flex items-center justify-center gap-2"
            >
              {ndviLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload NDVI Data
            </button>

            {jobStatus && (
              <div className="text-sm text-[#3a584e] bg-[#f0f4ec] px-4 py-2.5 rounded-lg">
                Processing Status: <strong className="font-medium capitalize">{jobStatus}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Claim Calculation Section */}
        <section className="bg-white p-8 rounded-2xl border border-[#e0e4dd] shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <FileText className="text-[#8ba77f]" />
              Claim Calculation
            </h2>
            <p className="text-[#6b7f7c] text-sm">Start the claim calculation process after all files are uploaded successfully.</p>
          </div>

          {claimCalculationError && (
            <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{claimCalculationError}</span>
            </div>
          )}

          {claimCalculationSuccess && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{claimCalculationSuccess}</span>
            </div>
          )}

          <button
            onClick={handleStartClaimCalculation}
            disabled={!allFilesUploaded || claimCalculationLoading}
            className="w-full md:w-auto px-6 py-3 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimCalculationLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" /> // Consider a different icon like Play or Calculator
            )}
            Start Claim Calculation
          </button>
        </section>
      </main>
    </div>
  );
};

export default AdminConfigPage;