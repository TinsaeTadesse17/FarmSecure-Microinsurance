'use client';

import React, { useEffect, useState, Fragment } from 'react';
import {
  listCompanies,
  approveCompany,
  InsuranceCompanyResponse,
} from '@/utils/api/company';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getToken } from '@/utils/api/user';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2, ClipboardList, Sprout } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingCompanies, setPendingCompanies] = useState<InsuranceCompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompanyResponse | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const token = getToken();
        if (!token) return;

        const all = await listCompanies();
        const pending = all.filter((company) => company.status === 'pending');
        setPendingCompanies(pending);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const handleApprove = async () => {
    if (!selectedCompany) return;

    try {
      await approveCompany(selectedCompany.id);
      setPendingCompanies((prev) => prev.filter((c) => c.id !== selectedCompany.id));
      setIsModalOpen(false);
    } catch (err) {
      alert(`Failed to approve company: ${(err as Error).message}`);
    }
  };

  const openModal = (company: InsuranceCompanyResponse) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-[#8ba77f]" />
              Company Approvals
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Pending Registrations
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Manage insurance company approvals • Last updated 2h ago
            </p>
          </div>
          <div className="flex gap-4">
            <AvatarMenu />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 text-[#8ba77f] animate-spin" />
            </div>
          ) : pendingCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="mx-auto h-12 w-12 text-[#7a938f] mb-4" />
              <p className="text-[#7a938f]">No pending approvals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCompanies.map((company) => (
                <div 
                  key={company.id}
                  className="bg-[#f9f8f3] p-6 rounded-xl border border-[#e0e7d4] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#7a938f] bg-[#eef4e5] px-3 py-1 rounded-full">
                      ID: {company.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#3a584e] mb-2">{company.name}</h3>
                  <p className="text-[#7a938f] mb-4 break-all">{company.email}</p>
                  <button
                    className="w-full py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={async () => {
                      const confirmed = window.confirm(`Approve "${company.name}"?`);
                      if (!confirmed) return;

                      try {
                        await approveCompany(company.id);
                        setPendingCompanies((prev) => prev.filter((c) => c.id !== company.id));
                      } catch (err) {
                        alert(`Approval failed: ${(err as Error).message}`);
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}