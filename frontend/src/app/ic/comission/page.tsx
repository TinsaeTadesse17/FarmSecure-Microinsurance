'use client';
import React from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Sprout, Coins } from 'lucide-react';

export default function CommissionManagementPage() {
  const mockCommissions = [
    {
      id: 1,
      agentName: 'Alemu Tadesse',
      policySold: 10,
      totalCommission: 3000,
      status: 'Paid',
    },
    {
      id: 2,
      agentName: 'Sara Hailu',
      policySold: 7,
      totalCommission: 2100,
      status: 'Pending',
    },
    {
      id: 3,
      agentName: 'Michael Kebede',
      policySold: 5,
      totalCommission: 1500,
      status: 'Paid',
    },
  ];

  const statusStyles = {
    Paid: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    Pending: 'bg-amber-100/80 text-amber-800 border-amber-200',
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Coins className="w-8 h-8 text-[#8ba77f]" />
              Commission Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Finance Overview
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f]">Track and manage agent commissions</p>
          </div>
          <AvatarMenu />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <div className="overflow-hidden border border-[#e0e7d4] rounded-xl">
              <table className="min-w-full divide-y divide-[#e0e7d4]">
                <thead className="bg-[#f9f8f3]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Agent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Policies Sold</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Commission</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e0e7d4]">
                  {mockCommissions.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9f8f3] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#3a584e]">{item.agentName}</div>
                      </td>
                      <td className="px-6 py-4 text-[#3a584e]">{item.policySold}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#3a584e]">
                          ${item.totalCommission.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-3 py-1 text-sm font-medium rounded-full border ${statusStyles[item.status as keyof typeof statusStyles]}`}>
                          {item.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}