'use client';

import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Sprout, Building, Leaf, Coins, Calendar, Globe } from 'lucide-react';
import { getCurrentUser } from '@/utils/api/user';

interface CreateProductDialogProps {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateProductDialog({ onClose, onCreate }: CreateProductDialogProps) {
  // Form state
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('crop');
  const [elc, setElc] = useState('');
  const [triggerPoint, setTriggerPoint] = useState('15');
  const [exitPoint, setExitPoint] = useState('5');
  const [commissionRate, setCommissionRate] = useState('');
  const [load, setLoad] = useState('');
  const [discount, setDiscount] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [growingSeason, setGrowingSeason] = useState('');
  const [cpsZoneId, setCpsZoneId] = useState('');
  const [period, setPeriod] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const user = await getCurrentUser();
        setCompanyId(user.company_id.toString());
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load company information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !elc || !commissionRate) {
      setError('Please fill in all required fields');
      return;
    }

    const newProduct = {
      company_id: Number(companyId),
      name,
      type,
      elc: Number(elc),
      trigger_point: Number(triggerPoint),
      exit_point: Number(exitPoint),
      commission_rate: Number(commissionRate),
      load: load ? Number(load) : null,
      discount: discount ? Number(discount) : null,
      fiscal_year: fiscalYear,
      growing_season: growingSeason,
      cps_zone_id: cpsZoneId ? Number(cpsZoneId) : null,
      period,
    };

    onCreate(newProduct);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4] p-6 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <Sprout className="w-8 h-8 text-[#8ba77f] mb-2" />
            <p className="text-[#3a584e]">Loading product form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4] p-6">
          <div className="text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[#3a584e] mb-2">Error Loading Form</h3>
            <p className="text-[#7a938f] mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#e0e7d4]">
          <h2 className="text-xl font-bold text-[#3a584e] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#8ba77f]" />
            New Product Setup
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a938f] hover:text-[#5a736e] p-1 rounded-full hover:bg-[#eef4e5] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Company ID (auto-filled) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg bg-gray-50 text-gray-500"
                value={companyId}
                readOnly
                disabled
              />
            </div>

            {/* Product Name (required) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Product Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Product Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Type</label>
              <select
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="crop">Crop</option>
                <option value="livestock">Livestock</option>
              </select>
            </div>

            {/* ELC (required) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">ELC *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={elc}
                onChange={(e) => setElc(e.target.value)}
                required
              />
            </div>

            {/* Trigger Point */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Trigger Point (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={triggerPoint}
                onChange={(e) => setTriggerPoint(e.target.value)}
              />
            </div>

            {/* Exit Point */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Exit Point (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={exitPoint}
                onChange={(e) => setExitPoint(e.target.value)}
              />
            </div>

            {/* Commission Rate (required) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Commission Rate *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                required
              />
            </div>

            {/* Load */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Load</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={load}
                onChange={(e) => setLoad(e.target.value)}
              />
            </div>

            {/* Fiscal Year */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fiscal Year
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
            </div>

            {/* Growing Season */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Growing Season</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={growingSeason}
                onChange={(e) => setGrowingSeason(e.target.value)}
              />
            </div>

            {/* CPS Zone ID */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Globe className="w-4 h-4" />
                CPS Zone ID
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={cpsZoneId}
                onChange={(e) => setCpsZoneId(e.target.value)}
              />
            </div>

            {/* Period */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Period</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          {/* Discount */}
          <div className="mt-4 space-y-1">
            <label className="block text-sm font-medium text-[#7a938f]">Discount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e0e7d4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5a736e] hover:text-[#3a584e] hover:bg-[#eef4e5] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}