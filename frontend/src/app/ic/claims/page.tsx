'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { fetchClaimsByCustomerByCompany, CustomerClaimsSummary } from '@/utils/api/claim';
import { getToken, getCurrentUser } from '@/utils/api/user';
import { Sprout, ChevronDown, ChevronUp } from 'lucide-react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ClaimsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CustomerClaimsSummary[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const user = await getCurrentUser();
        const company_id = Number(user.company_id);

        if (!company_id) {
          setError('Invalid company ID. Please check your account.');
          setLoading(false);
          return;
        }

        const summary = await fetchClaimsByCustomerByCompany(company_id);
        setData(summary);
      } catch (e: any) {
        const msg = e.message.toLowerCase();
        if (msg.includes('unauthorized')) {
          setError('Session expired, please log in');
        } else if (msg.includes('no claims found')) {
          setData([]);
        } else {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const exportRows = data.flatMap(group =>
    group.claims.map(c => ({
      customerId: group.customer_id,
      policyId: c.policy_id,
      claimType: c.claim_type,
      claimAmount: c.claim_amount,
      status: c.status,
      gridId: c.grid_id,
      period: c.period,
    }))
  );

  const csvHeaders = [
    { label: 'Customer ID', key: 'customerId' },
    { label: 'Policy ID', key: 'policyId' },
    { label: 'Claim Type', key: 'claimType' },
    { label: 'Amount', key: 'claimAmount' },
    { label: 'Status', key: 'status' },
    { label: 'Grid ID', key: 'gridId' },
    { label: 'Period', key: 'period' },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Insurance Claims Report', 14, 16);
    const tableData = exportRows.map(r => [
      r.customerId,
      r.policyId,
      r.claimType,
      `$${r.claimAmount.toFixed(2)}`,
      r.status,
      r.gridId,
      r.period,
    ]);
    (doc as any).autoTable({
      head: [['Customer', 'Policy', 'Type', 'Amount', 'Status', 'Grid ID', 'Period']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save('claims-report.pdf');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8 flex flex-col">
          <div className="flex justify-end">
            <AvatarMenu />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#a3b18a] border-t-[#3a5a40]"></div>
              <p className="text-lg text-[#3a5a40] font-medium">Loading Claims...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  if (data.length === 0 || data[0].claims.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8 flex flex-col">
          <div className="flex justify-end mb-8">
            <AvatarMenu />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 bg-white shadow-lg rounded-xl w-full max-w-md border border-[#e0e7d4]">
              <Sprout className="mx-auto h-16 w-16 text-[#a3b18a] mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Claims Found</h2>
              <p className="text-gray-500">Start by creating a new claim to see it here.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-center">
          <AvatarMenu />
          <div className="space-x-2">
            <CSVLink
              data={exportRows}
              headers={csvHeaders}
              filename="claims.csv"
              className="px-4 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#2c423f]"
            >
              Export CSV
            </CSVLink>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-[#a3b18a] text-white rounded-lg hover:bg-[#8c9b70]"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#2c423f] mb-8">Insurance Claims</h1>

          <div className="space-y-4">
            {data.map(group => (
              <details
                key={group.customer_id}
                className="group bg-white rounded-xl shadow-sm border border-[#e0e7d4]"
              >
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <ChevronDown className="w-5 h-5 text-[#3a5a40] group-open:hidden" />
                      <ChevronUp className="w-5 h-5 text-[#3a5a40] hidden group-open:block" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#3a5a40]">
                      Customer #{group.customer_id}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {group.claims.length} claim{group.claims.length !== 1 ? 's' : ''}
                  </span>
                </summary>

                <div className="px-6 pb-6 pt-2 space-y-4">
                  {group.claims.map(c => (
                    <details
                      key={c.id}
                      className="bg-[#f9f8f3] p-4 rounded-lg border border-[#e0e7d4] hover:border-[#3a5a40] transition-colors"
                    >
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <div className="flex-1">
                          <span className="font-medium text-[#2c423f]">Policy {c.policy_id}</span>
                          <span className="text-gray-500 ml-2">– {c.claim_type}</span>
                        </div>
                        <span
                          className={`text-lg font-semibold ${
                            c.claim_amount === 0 ? 'text-gray-500' : 'text-[#3a5a40]'
                          }`}
                        >
                          ${c.claim_amount.toFixed(2)}
                        </span>
                      </summary>

                      {c.claim_amount > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#e0e7d4]">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="text-gray-500">Status</label>
                              <p className="font-medium">{c.status}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">Grid ID</label>
                              <p className="font-medium">{c.grid_id}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">Period</label>
                              <p className="font-medium">{c.period}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
