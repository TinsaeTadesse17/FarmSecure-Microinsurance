'use client';

import React from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { ClipboardList, Wallet, FileText, Sprout } from 'lucide-react';

interface DashboardProps {
  children?: React.ReactNode;
}

export default function IcDashboard({ children }: DashboardProps) {
  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#3a584e]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              IC Dashboard
              <span className="ml-2 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Insurance Portal
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Manage insurance policies, claims, and commissions with real-time insights
            </p>
          </div>
          <AvatarMenu />
        </div>

        {children ? (
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.15)] border border-[#e0e7d4] max-w-6xl mx-auto">
            {children}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.15)] border border-[#e0e7d4]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#e8f5e9] rounded-lg">
                      <ClipboardList className="w-6 h-6 text-[#2e7d32]" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#7a938f]">Total Policies</h3>
                      <p className="text-2xl font-bold text-[#3a584e] mt-1">124</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#fff3e0] rounded-lg">
                      <FileText className="w-6 h-6 text-[#d4a064]" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#7a938f]">Active Claims</h3>
                      <p className="text-2xl font-bold text-[#3a584e] mt-1">8</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#e5f0f4] rounded-lg">
                      <Wallet className="w-6 h-6 text-[#7fa3b0]" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#7a938f]">Commission Paid</h3>
                      <p className="text-2xl font-bold text-[#3a584e] mt-1">
                        ETB 23,500
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.15)] border border-[#e0e7d4]">
              <h2 className="text-xl font-semibold text-[#3a584e] mb-4">
                Performance Overview
              </h2>
              <div className="bg-[#f9f8f3] rounded-lg p-4 h-64 flex items-center justify-center">
                <span className="text-[#7a938f]">Revenue Chart Placeholder</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}