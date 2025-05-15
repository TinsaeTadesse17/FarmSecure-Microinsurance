'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getCompany, InsuranceCompanyResponse } from '@/utils/api/company';
import { Loader2, Building, BadgeCheck, Calendar, Landmark, MapPin, Phone, Mail, FileDigit, Clock } from 'lucide-react';

interface Props {
  companyId: number | null;
  open: boolean;
  onClose: () => void;
}

const CompanyDetailModal: React.FC<Props> = ({ companyId, open, onClose }) => {
  const [company, setCompany] = useState<InsuranceCompanyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const data = await getCompany(companyId);
        setCompany(data);
      } catch (error) {
        console.error('Failed to fetch company details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | number, colspan?: string) => (
    <div className={`flex items-start gap-3 ${colspan || 'col-span-1'}`}>
      <span className="text-[#8ba77f] mt-1">{icon}</span>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );

  const statusBadge = (status: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status.toLowerCase() === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {status}
    </span>
  );

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          leave="ease-in duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-800 pb-2 border-b border-gray-100"
                >
                  <Building className="inline-block h-6 w-6 text-[#8ba77f] mr-2" />
                  Company Details
                </Dialog.Title>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-[#8ba77f]" />
                  </div>
                ) : company ? (
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {renderDetailItem(
                        <BadgeCheck className="h-4 w-4" />,
                        'License Number',
                        company.licenseNo
                      )}
                      {renderDetailItem(
                        <Landmark className="h-4 w-4" />,
                        'Licensed By',
                        company.licensedBy
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {renderDetailItem(
                        <Calendar className="h-4 w-4" />,
                        'Operation Date',
                        new Date(company.operationDate).toLocaleDateString()
                      )}
                      {renderDetailItem(
                        <Landmark className="h-4 w-4" />,
                        'Capital',
                        `$${company.capital.toLocaleString()}`
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#8ba77f]" />
                        Location Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {renderDetailItem(<span />, 'Country', company.country)}
                        {renderDetailItem(<span />, 'City', company.city)}
                        {renderDetailItem(<span />, 'Postal Code', company.postalCode)}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#8ba77f]" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {renderDetailItem(<span />, 'Phone Number', company.phoneNo)}
                        {renderDetailItem(
                          <Mail className="h-4 w-4" />,
                          'Email Address',
                          company.email
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        {renderDetailItem(
                          <BadgeCheck className="h-4 w-4" />,
                          'Status',
                          statusBadge(company.status)
                        )}
                        {renderDetailItem(
                          <Clock className="h-4 w-4" />,
                          'Created At',
                          new Date(company.createdAt).toLocaleString()
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-red-600">
                    <FileDigit className="h-8 w-8 mb-2" />
                    <p className="font-medium">Company not found or failed to load.</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg border bg-[#8ba77f] text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CompanyDetailModal;