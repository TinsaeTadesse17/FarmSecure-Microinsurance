'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { createEnrollment } from '@/lib/api/enrollment';
import { getToken } from '@/lib/api/user';
import { jwtDecode  } from 'jwt-decode';
import EnrollmentList from '@/components/agent/enrollmentList';

interface DecodedToken {
  company_id: number[];
  sub: string;
  [key: string]: any;
}

export default function CustomerEnrollmentPage() {
  const [fName, setFName] = useState('');
  const [mName, setMName] = useState('');
  const [lName, setLName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountType, setAccountType] = useState('ID');
  const [premium, setPremium] = useState(500);
  const [sumInsured, setSumInsured] = useState(10000);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [productId, setProductId] = useState(1);
  const [cpsZone, setCpsZone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  React.useEffect(() => {
    const token = getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setCompanyId(decoded.company_id?.[0] || null);
      setUserId(parseInt(decoded.sub));
    } catch {
      setErrorMessage('Invalid token or unable to extract user info');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!companyId || !userId) {
      setErrorMessage('Missing user or company info');
      return;
    }

    try {
      await createEnrollment({
        f_name: fName,
        m_name: mName,
        l_name: lName,
        account_no: accountNo,
        account_type: accountType,
        user_id: userId,
        ic_company_id: companyId,
        branch_id: 1,
        premium,
        sum_insured: sumInsured,
        date_from: dateFrom,
        date_to: dateTo,
        receipt_no: receiptNo,
        product_id: productId,
        cps_zone: cpsZone,
      });

      setSuccessMessage('Customer enrolled successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Enrollment failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto mb-10">
          <h2 className="text-xl font-bold mb-4">Customer Enrollment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="First Name" value={fName} onChange={(e) => setFName(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Middle Name" value={mName} onChange={(e) => setMName(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Last Name" value={lName} onChange={(e) => setLName(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Account Number" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Account Type" value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Premium" value={premium} onChange={(e) => setPremium(parseFloat(e.target.value))} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Sum Insured" value={sumInsured} onChange={(e) => setSumInsured(parseFloat(e.target.value))} className="w-full border p-2 rounded" required />
            <input type="date" placeholder="Date From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="date" placeholder="Date To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Receipt No" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Product ID" value={productId} onChange={(e) => setProductId(parseInt(e.target.value))} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="CPS Zone" value={cpsZone} onChange={(e) => setCpsZone(e.target.value)} className="w-full border p-2 rounded" required />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
          </form>
          {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
          {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
        </div>

        <EnrollmentList />
      </main>
    </div>
  );
}
