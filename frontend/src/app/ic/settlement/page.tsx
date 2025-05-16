'use client';

import React from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Wallet, BadgeDollarSign, CircleDollarSign, CheckCircle, Clock } from 'lucide-react';

export default function ViewSettlementStatusPage() {
  const mockSettlements = [
    {
      id: 1,
      policyHolder: 'John Doe',
      amount: 1200,
      status: 'Paid',
      date: '2025-05-01',
    },
    {
      id: 2,
      policyHolder: 'Jane Smith',
      amount: 950,
      status: 'Pending',
      date: '2025-05-03',
    },
    {
      id: 3,
      policyHolder: 'Ali Beko',
      amount: 1340,
      status: 'Paid',
      date: '2025-05-04',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Wallet className="w-8 h-8 text-[#8ba77f]" />
              Settlement Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Transaction Overview
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Monitor insurance claim settlements and payment statuses • Updated in real-time
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e0e7d4]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#3a584e]">Settlement Transactions</h2>
                <p className="text-sm text-[#7a938f] mt-1">
                  Recent insurance claim settlements and their status
                </p>
              </div>
              <button className="flex items-center px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-all">
                <BadgeDollarSign className="mr-2 h-5 w-5" />
                Export Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9f8f3] border-b border-[#e0e7d4]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                    Policy Holder
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                    Settlement Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e7d4]">
                {mockSettlements.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[#f9f8f3] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7a938f]">
                      {item.policyHolder}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                      <div className="flex items-center">
                        <CircleDollarSign className="w-4 h-4 mr-2 text-[#8ba77f]" />
                        ${item.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                        ${item.status === 'Paid' 
                          ? 'bg-[#eef4e5] text-[#3a584e]'
                          : 'bg-[#fff3e5] text-[#d46a1a]'}`}>
                        {item.status === 'Paid' ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Clock className="w-4 h-4 mr-2" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7a938f]">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}