'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Tractor, ClipboardList, Warehouse, Sprout, Plus, Droplet, Building, ChevronRight } from 'lucide-react';
import { listCompanies, InsuranceCompanyResponse } from '@/utils/api/company';
import { getIcUsers } from '@/utils/api/user';
import CompanyDetailModal from '@/components/admin/companyDetail';

export default function AdminDashboard() {
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [companies, setCompanies] = useState<InsuranceCompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const companyList = await listCompanies();
        const usersList = await getIcUsers();

        setCompanies(companyList);
        setTotalCompanies(companyList.length);
        setPendingApprovals(companyList.filter(c => c.status === 'pending').length);
        setTotalUsers(usersList.length);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      }
    }

    fetchStats();
  }, []);

  const handleCompanyClick = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setIsModalOpen(true);
  };

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
            { icon: Warehouse, title: 'Total Cooperatives', value: totalCompanies.toString(), color: '#8ba77f' },
            { icon: ClipboardList, title: 'Pending Approvals', value: pendingApprovals.toString(), color: '#d4a064', path: '/admin' },
            { icon: Sprout, title: 'Total Users', value: totalUsers.toString(), color: '#7fa3b0', path: '/admin/users' }
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
              {/* <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => router.push(stat.path)}
                  className="text-[#7a938f] hover:text-[#3a584e] flex items-center text-sm"
                >
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div> */}
            </div>
          ))}
        </div>

        {/* System Overview Section */}
        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#3a584e]">System Overview</h2>
            <div className="flex gap-2">
              <button className="flex items-center text-sm bg-[#f5f3eb] px-3 py-1 rounded-lg hover:bg-[#e0e7d4]">
                <Droplet className="w-4 h-4 mr-2 text-[#7fa3b0]" />
                Last 30 Days
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[#7a938f] leading-relaxed">
              Welcome to the Admin Dashboard. Monitor key metrics and manage agricultural insurance cooperatives with real-time insights.
            </p>
            
            <div>
              <h3 className="text-sm font-bold text-[#3a584e] mb-4">Registered Companies</h3>
              <div className="border border-[#e0e7d4] rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-[#e0e7d4]">
                  <thead className="bg-[#f9f8f3]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7a938f] uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7a938f] uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7a938f] uppercase tracking-wider">
                        Capital
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7a938f] uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e0e7d4]">
                    {companies.map((company) => (
                      <tr 
                        key={company.id} 
                        className="hover:bg-[#f9f8f3] cursor-pointer"
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-[#8ba77f20] rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-[#8ba77f]" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#3a584e]">{company.name}</div>
                              <div className="text-sm text-[#7a938f]">{company.licenseNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            company.status === 'active' ? 'bg-green-100 text-green-800' :
                            company.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7a938f]">
                          {company.capital|| 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7a938f]">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-[#8ba77f] hover:text-[#3a584e] flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompanyClick(company.id);
                            }}
                          >
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Company Detail Modal */}
        <CompanyDetailModal
          companyId={selectedCompanyId}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}