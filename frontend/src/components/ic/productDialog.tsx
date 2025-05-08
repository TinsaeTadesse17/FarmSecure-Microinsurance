'use client';

import React, { useState } from 'react';

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-md w-[480px] shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Fields grouped in pairs for layout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Company ID</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Type</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">ELC</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={elc}
                onChange={(e) => setElc(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Trigger Point</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={triggerPoint}
                onChange={(e) => setTriggerPoint(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Exit Point</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={exitPoint}
                onChange={(e) => setExitPoint(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Commission Rate</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Load</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={load}
                onChange={(e) => setLoad(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Discount</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fiscal Year</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Growing Season</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={growingSeason}
                onChange={(e) => setGrowingSeason(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">CPS Zone ID</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={cpsZoneId}
                onChange={(e) => setCpsZoneId(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium">Period</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
