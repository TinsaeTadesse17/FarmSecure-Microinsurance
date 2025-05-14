'use client';

import React from 'react';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Tractor, ClipboardList, Warehouse, Sprout, Plus, Droplet } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              AgriTeck Dashboard
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Admin View
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Cultivate insights across all insurance cooperatives • Last updated 2h ago
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center bg-[#8ba77f] text-white px-4 py-2 rounded-lg hover:bg-[#7a937f] transition-all">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </button>
            <AvatarMenu />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#e0e7d4]">
          {['Overview', 'Cooperatives', 'Users', 'Approvals'].map((tab) => (
            <button 
              key={tab}
              className={`pb-2 px-1 ${
                tab === 'Overview' 
                  ? 'border-b-2 border-[#8ba77f] text-[#3a584e]' 
                  : 'text-[#7a938f] hover:text-[#5a736e]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Warehouse, title: 'Total Cooperatives', value: '12', color: '#8ba77f' },
            { icon: ClipboardList, title: 'Pending Approvals', value: '4', color: '#d4a064' },
            { icon: Sprout, title: 'Total Users', value: '58', color: '#7fa3b0' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <h3 className="text-sm text-[#7a938f]">{stat.title}</h3>
                  <p className="text-2xl font-bold text-[#3a584e] mt-1">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-[#7a938f] hover:text-[#3a584e] flex items-center text-sm">
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* System Overview Section */}
        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#3a584e]">
              System Overview
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center text-sm bg-[#f5f3eb] px-3 py-1 rounded-lg hover:bg-[#e0e7d4]">
                <Droplet className="w-4 h-4 mr-2 text-[#7fa3b0]" />
                Last 30 Days
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[#7a938f] leading-relaxed">
                Welcome to the Admin Dashboard. Monitor key metrics and manage agricultural insurance cooperatives with real-time insights.
              </p>
              <div className="bg-[#f9f8f3] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7a938f]">System Health</span>
                  <span className="text-sm font-bold text-[#8ba77f]">Optimal</span>
                </div>
                <div className="mt-2 h-2 bg-[#e0e7d4] rounded-full">
                  <div className="h-2 bg-[#8ba77f] rounded-full w-4/5" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#f9f8f3] rounded-lg p-4 flex items-center justify-center">
              <span className="text-[#7a938f]">Activity Chart Placeholder</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}