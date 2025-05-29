'use client';

import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getCurrentUser } from '@/utils/api/user';
import { listPoliciesbyUser, Policy } from '@/utils/api/policy';
import { getEnrollment, EnrollmentResponse } from '@/utils/api/enrollment';
import {
  ScrollText,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  User,
  Download,
  FileText,
  Shield
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PolicyDetailViewProps {
  params: {
    id: string;
  };
}

interface EnhancedPolicy extends Policy {
  enrollment?: EnrollmentResponse;
}

export default function PolicyDetailView({ params }: PolicyDetailViewProps) {
  const [policies, setPolicies] = useState<EnhancedPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPolicies, setExpandedPolicies] = useState<Record<number, boolean>>({});
  const policyRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [currentlyExporting, setCurrentlyExporting] = useState<number | null>(null);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const user = await getCurrentUser();
        const data = await listPoliciesbyUser(Number(user.sub));

        const enhancedPolicies = await Promise.all(
          data.map(async (policy) => {
            if (policy.enrollment_id) {
              try {
                const enrollment = await getEnrollment(policy.enrollment_id);
                return { ...policy, enrollment };
              } catch (err) {
                console.error(`Failed to fetch enrollment for policy ${policy.policy_id}:`, err);
                return policy;
              }
            }
            return policy;
          })
        );

        setPolicies(enhancedPolicies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch policies');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  const toggleExpand = (policyId: number) => {
    setExpandedPolicies((prev) => ({
      ...prev,
      [policyId]: !prev[policyId],
    }));
  };

  const handleExportPDF = async (policyId: number) => {
    setCurrentlyExporting(policyId);

    if (!expandedPolicies[policyId]) {
      setExpandedPolicies(prev => ({ ...prev, [policyId]: true }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      const policyElement = policyRefs.current[policyId];
      if (!policyElement) return;

      const clone = policyElement.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '800px';
      document.body.appendChild(clone);

      const detailsSection = clone.querySelector('[data-policy-details]');
      if (detailsSection) {
        detailsSection.classList.remove('hidden');
      }

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`policy-${policyId}-details.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setCurrentlyExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-end mb-8">
            <AvatarMenu />
          </div>
          <div className="flex items-center justify-center h-80 gap-3 text-[#3a584e]">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-lg">Loading Policy Details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-end mb-8">
            <AvatarMenu />
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] flex items-center gap-3 text-[#dc2626]">
            <AlertTriangle className="w-6 h-6" />
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#8ba77f]" />
              Policy Portfolio
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Risk Coverage Details
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Comprehensive view of agricultural insurance policies and their coverage details
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="space-y-6">
          {policies.length === 0 ? (
            <div className="bg-[#f9f8f3] p-8 rounded-xl border border-[#e0e7d4] text-center text-[#7a938f]">
              No active policies found
            </div>
          ) : (
            policies.map((policy) => {
              const isExpanded = !!expandedPolicies[policy.policy_id];
              const isExporting = currentlyExporting === policy.policy_id;

              return (
                <div
                  key={policy.policy_id}
                  className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm overflow-hidden"
                  ref={(el) => { policyRefs.current[policy.policy_id] = el; }}
                >
                  <div className="p-6">
                    {policy.enrollment?.customer && (
                      <div className="mb-6 bg-[#f5f9f8] p-4 rounded-lg border border-[#e0e7d4]">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-[#7a938f] flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Information
                          </h3>
                          <button
                            onClick={() => handleExportPDF(policy.policy_id)}
                            className="border border-[#8ba77f] text-[#3a584e] hover:bg-[#eef4e5] flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors duration-200"
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Export Policy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-[#7a938f]">Name</p>
                            <p className="mt-1 text-[#3a584e]">
                              {[
                                policy.enrollment.customer.f_name,
                                policy.enrollment.customer.m_name,
                                policy.enrollment.customer.l_name
                              ].filter(Boolean).join(' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#7a938f]">Account No.</p>
                            <p className="mt-1 text-[#3a584e]">
                              {policy.enrollment.customer.account_no || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#7a938f]">Account Type</p>
                            <p className="mt-1 text-[#3a584e]">
                              {policy.enrollment.customer.account_type || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#7a938f]">Premium</p>
                            <p className="mt-1 text-[#3a584e]">
                              {policy.enrollment.premium 
                                ? `$${policy.enrollment.premium.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold text-[#3a584e] mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#8ba77f]" />
                      Policy Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-[#7a938f]">Policy Number</p>
                        <p className="mt-1 text-[#3a584e] font-medium">
                          {policy.policy_no || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#7a938f]">Fiscal Year</p>
                        <p className="mt-1 text-[#3a584e]">{policy.fiscal_year || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#7a938f]">Status</p>
                        <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                          policy.status?.toLowerCase() === 'active'
                            ? 'bg-[#e6f3d6] text-[#3a7d0a]'
                            : 'bg-[#fff3e5] text-[#d46a1a]'
                        }`}>
                          {policy.status || '—'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#7a938f]">Initiated</p>
                        <p className="mt-1 text-[#3a584e]">
                          {policy.createdAt
                            ? new Date(policy.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <h3 className="text-sm font-medium text-[#7a938f] flex items-center gap-2">
                        <ScrollText className="w-4 h-4" />
                        Coverage Details
                      </h3>
                      <button
                        onClick={() => toggleExpand(policy.policy_id)}
                        className="flex items-center text-sm font-medium text-[#8ba77f] hover:text-[#7a937f] px-3 py-1 rounded-lg hover:bg-[#f0f5ed]"
                      >
                        {isExpanded ? (
                          <>
                            <span>Collapse</span>
                            <ChevronUp className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            <span>Expand</span>
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`bg-[#f5f9f8] border-t border-[#e0e7d4] ${isExpanded ? 'block' : 'hidden'}`}
                    data-policy-details
                  >
                    <div className="p-6">
                      <h3 className="text-sm font-medium text-[#7a938f] mb-4">Coverage Breakdown</h3>
                      <div className="space-y-4">
                        {policy.details?.map((detail: any) => (
                          <div 
                            key={detail.policy_detail_id}
                            className="bg-white p-4 rounded-lg border border-[#e0e7d4]"
                          >
                            <ul className="space-y-3">
                              <li className="flex justify-between">
                                <span className="text-sm font-medium text-[#7a938f]">Sum Insured</span>
                                <span className="text-[#3a584e]">
                                  ${detail.period_sum_insured?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '—'}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm font-medium text-[#7a938f]">CPS Zone</span>
                                <span className="text-[#3a584e]">{detail.cps_zone || '—'}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm font-medium text-[#7a938f]">Product Type</span>
                                <span className="text-[#3a584e]">{detail.product_type || '—'}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm font-medium text-[#7a938f]">Period (Days)</span>
                                <span className="text-[#3a584e]">{detail.period || '—'}</span>
                              </li>
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
