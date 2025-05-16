'use client';

import React, { useState } from 'react';
import { X, ClipboardList, Sprout, Building, Leaf, Coins, Calendar, Globe } from 'lucide-react';

interface CreateProductDialogProps {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateProductDialog({ onClose, onCreate }: CreateProductDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      company_id: Number(companyId),
      name,
      type,
      elc: Number(elc),
      trigger_point: Number(triggerPoint),
      exit_point: Number(exitPoint),
      commission_rate: Number(commissionRate),
      load: Number(load),
      discount: Number(discount),
      fiscal_year: fiscalYear,
      growing_season: growingSeason,
      cps_zone_id: Number(cpsZoneId),
      period,
    };

    onCreate(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4]">
        <div className="flex justify-between items-center p-6 border-b border-[#e0e7d4]">
          <h2 className="text-xl font-bold text-[#3a584e] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#8ba77f]" />
            New Product Setup
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a938f] hover:text-[#5a736e] p-1 rounded-full hover:bg-[#eef4e5] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company ID
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Product Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">ELC</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={elc}
                onChange={(e) => setElc(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Trigger Point (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={triggerPoint}
                onChange={(e) => setTriggerPoint(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Exit Point (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={exitPoint}
                onChange={(e) => setExitPoint(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f] flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Commission Rate
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Load</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={load}
                onChange={(e) => setLoad(e.target.value)}
              />
            </div>

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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#7a938f]">Growing Season</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={growingSeason}
                onChange={(e) => setGrowingSeason(e.target.value)}
              />
            </div>

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
              className="px-4 py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}