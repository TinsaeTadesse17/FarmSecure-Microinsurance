'use client';

import React, { useEffect, useState } from 'react';
import {
  listCompanies,
  approveCompany,
  InsuranceCompanyResponse,
} from '@/utils/api/company';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CompanyDetailModal from '@/components/admin/companyDetail';
import { getToken } from '@/utils/api/user';
import { Loader2, ClipboardList, Sprout, Check } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingCompanies, setPendingCompanies] = useState<InsuranceCompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompanyResponse | null>(null);
  const [detailCompanyId, setDetailCompanyId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const ApprovalModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-[#e0e7d4] p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-8 h-8 text-[#8ba77f]" />
          <h3 className="text-xl font-semibold text-[#3a584e]">
            Confirm Approval
          </h3>
        </div>
        
        <p className="text-[#7a938f] mb-6">
          Are you sure you want to approve{' '}
          <span className="font-medium text-[#3a584e]">{selectedCompany?.name}</span>?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setSelectedCompany(null)}
            className="px-4 py-2 text-[#7a938f] hover:text-[#3a584e] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!selectedCompany) return;
              try {
                await approveCompany(selectedCompany.id);
                setPendingCompanies(prev => prev.filter(c => c.id !== selectedCompany.id));
                setSelectedCompany(null);
              } catch (err) {
                alert(`Approval failed: ${(err as Error).message}`);
              }
            }}
            className="px-4 py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );

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
          <AvatarMenu />
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6 shadow-sm">
          {loading ? (
            <div className="min-h-screen bg-[#f9f8f3] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin-slow mx-auto">
                  <Sprout className="w-12 h-12 text-[#8ba77f]" />
                </div>
                <p className="text-[#3a584e] font-medium">
                  Cultivating your admin dashboard...
                </p>
                <span className="text-sm text-[#7a938f] block">
                  Securely growing your access permissions
                </span>
              </div>
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
                  className="bg-[#f9f8f3] p-6 rounded-xl border border-[#e0e7d4] hover:shadow-lg transition-all group cursor-pointer"
                  onClick={() => {
                    setDetailCompanyId(company.id);
                    setShowDetails(true);
                  }}
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering modal
                      setSelectedCompany(company);
                    }}
                  >
                    <Check className="h-5 w-5" />
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCompany && <ApprovalModal />}

        <CompanyDetailModal
          companyId={detailCompanyId}
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            setDetailCompanyId(null);
          }}
        />
      </main>
    </div>
  );
}