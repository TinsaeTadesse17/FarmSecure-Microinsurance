'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { createEnrollment } from '@/utils/api/enrollment';
import { getToken } from '@/utils/api/user';
import { jwtDecode } from 'jwt-decode';
import EnrollmentList from '@/components/agent/enrollmentList';

interface DecodedToken {
  company_id: number[];
  sub: string;
  [key: string]: any;
}

export default function CustomerEnrollmentPage() {
  const [formData, setFormData] = useState({
    fName: '',
    mName: '',
    lName: '',
    accountNo: '',
    accountType: 'ID',
    premium: 500,
    sumInsured: 10000,
    dateFrom: '',
    dateTo: '',
    receiptNo: '',
    productId: 1,
    cpsZone: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'premium' || name === 'sumInsured' || name === 'productId' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    if (!companyId || !userId) {
      setErrorMessage('Missing user or company info');
      setIsSubmitting(false);
      return;
    }

    try {
      await createEnrollment({
        f_name: formData.fName,
        m_name: formData.mName,
        l_name: formData.lName,
        account_no: formData.accountNo,
        account_type: formData.accountType,
        user_id: userId,
        ic_company_id: companyId,
        branch_id: 1,
        premium: formData.premium,
        sum_insured: formData.sumInsured,
        date_from: formData.dateFrom,
        date_to: formData.dateTo,
        receipt_no: formData.receiptNo,
        product_id: formData.productId,
        cps_zone: formData.cpsZone,
      });

      setSuccessMessage('Customer enrolled successfully!');
      setFormData({
        fName: '',
        mName: '',
        lName: '',
        accountNo: '',
        accountType: 'ID',
        premium: 500,
        sumInsured: 10000,
        dateFrom: '',
        dateTo: '',
        receiptNo: '',
        productId: 1,
        cpsZone: ''
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Customer Enrollment</h1>
          <AvatarMenu />
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-800 mb-6 pb-2 border-b border-gray-200">
              New Enrollment Form
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-700">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                    <input
                      type="text"
                      name="fName"
                      value={formData.fName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name*</label>
                    <input
                      type="text"
                      name="mName"
                      value={formData.mName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                    <input
                      type="text"
                      name="lName"
                      value={formData.lName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number*</label>
                    <input
                      type="text"
                      name="accountNo"
                      value={formData.accountNo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type*</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="ID">ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-700">Policy Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount*</label>
                    <input
                      type="number"
                      name="premium"
                      value={formData.premium}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sum Insured*</label>
                    <input
                      type="number"
                      name="sumInsured"
                      value={formData.sumInsured}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Start Date*</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage End Date*</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-700">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number*</label>
                    <input
                      type="text"
                      name="receiptNo"
                      value={formData.receiptNo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID*</label>
                    <input
                      type="number"
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPS Zone*</label>
                  <input
                    type="text"
                    name="cpsZone"
                    value={formData.cpsZone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-green-500' : 'bg-green-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Enrollment'}
                </button>
              </div>

              {successMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-800 mb-6 pb-2 border-b border-gray-200">
              Recent Enrollments
            </h2>
            <EnrollmentList />
          </div>
        </div>
      </main>
    </div>
  );
}