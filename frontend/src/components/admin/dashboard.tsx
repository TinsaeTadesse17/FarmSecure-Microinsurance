'use client';

import React, { useEffect, useState } from 'react';
import {
  listCompanies,
  approveCompany,
  InsuranceCompanyResponse,
} from '@/lib/api/company';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getToken } from '@/lib/api/user';

export default function AdminDashboard() {
  const [pendingCompanies, setPendingCompanies] = useState<InsuranceCompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Avatar Dropdown */}
        <AvatarMenu />

        <section className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto mt-12">
          <h2 className="text-xl font-medium mb-4 text-black">
            Companies Awaiting Approval
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pendingCompanies.length === 0 ? (
            <p className="text-gray-500">No pending companies.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingCompanies.map((company) => (
                    <tr key={company.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{company.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{company.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{company.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          className="mr-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          onClick={async () => {
                            const confirmed = window.confirm(`Do you want to approve "${company.name}"?`);
                            if (!confirmed) return;

                            try {
                              await approveCompany(company.id);
                              setPendingCompanies((prev) => prev.filter((c) => c.id !== company.id));
                            } catch (err) {
                              alert(`Failed to approve company: ${(err as Error).message}`);
                            }
                          }}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
