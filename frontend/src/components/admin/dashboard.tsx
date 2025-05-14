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
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-black">Pending Companies</h1>
          <AvatarMenu />
        </div>

        <section className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto">
          <h2 className="text-xl font-medium mb-4 text-black">
            Companies Awaiting Approval
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : pendingCompanies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No pending companies for approval</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{company.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(company)}
                          className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
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

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-transparent" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Confirm Approval
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to approve{' '}
                        <span className="font-semibold">{selectedCompany?.name}</span>?
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md"
                        onClick={handleApprove}
                      >
                        Approve
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </main>
    </div>
  );
}
