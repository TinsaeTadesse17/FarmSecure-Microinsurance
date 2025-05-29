'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { createEnrollment } from '@/utils/api/enrollment';
import { getToken } from '@/utils/api/user';
import { jwtDecode } from 'jwt-decode';
import EnrollmentList from '@/components/agent/enrollmentList';
import { UserPlus, AlertTriangle, CheckCircle2, ListChecks, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getProductsbyCompany } from '@/utils/api/product';
import { getCurrentUser } from '@/utils/api/user';

const MapPicker = dynamic(() => import('@/components/agent/mapPicker'), { ssr: false });

interface DecodedToken {
  company_id: number[];
  sub: string;
  [key: string]: any;
}

interface Product {
  id: number;
  name: string;
  company_id: number;
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
    cpsZone: 0,
    longitude: '',
    lattitude: '',
    grid: 0
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setProductsError(null);
    try {
      const token = await getToken();
      if (!token) {
        setProductsError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }

      const user = await getCurrentUser();
      const userId = Number(user.sub);
      const companyId = user.company_id ? Number(user.company_id) : null;
      setCompanyId(companyId);
      setUserId(userId);
    
      const productsResult = await getProductsbyCompany(Number(user.company_id));
      setProducts(Array.isArray(productsResult) ? productsResult : [productsResult]);
      
      // Set default product if available
      if (productsResult.length > 0) {
        setFormData(prev => ({ ...prev, productId: productsResult[0].id }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductsError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  fetchProducts();
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

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lattitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    if (!userId) {
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
        ic_company_id: companyId || 0,
        branch_id: 1,
        premium: formData.premium,
        sum_insured: formData.sumInsured,
        date_from: formData.dateFrom,
        date_to: formData.dateTo,
        receipt_no: formData.receiptNo,
        product_id: formData.productId,
        cps_zone: "0",
        longitude: formData.longitude,
        lattitude: formData.lattitude,
        grid: "0"
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
        cpsZone: 0,
        longitude: '',
        lattitude: '',
        grid: 0
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-[#8ba77f]" />
              Customer Enrollment
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                New Enrollment Registration
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Register new agricultural insurance policies and manage customer coverage
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['fName', 'mName', 'lName'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      {field === 'fName' ? 'First Name*' : field === 'mName' ? 'Middle Name*' : 'Last Name*'}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Account Number*</label>
                  <input
                    type="text"
                    name="accountNo"
                    value={formData.accountNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Account Type*</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg bg-white"
                    required
                  >
                    <option value="ID">ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Policy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['premium', 'sumInsured'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      {field === 'premium' ? 'Premium Amount*' : 'Sum Insured*'}
                    </label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Coverage Start*</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Coverage End*</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={formData.dateTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Receipt and Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Receipt Number*</label>
                  <input
                    type="text"
                    name="receiptNo"
                    value={formData.receiptNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">Product*</label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg bg-white"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <h3 className="text-lg font-medium text-[#3a584e] mb-2">Location (Click map to set)</h3>
                <MapPicker onLocationSelect={handleLocationSelect} />
                {formData.lattitude && formData.longitude && (
                  <p className="text-sm text-[#7a938f] mt-2">
                    Selected Coordinates: <strong>{formData.lattitude}, {formData.longitude}</strong>
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-[#8ba77f]/70 text-white cursor-not-allowed'
                      : 'bg-[#8ba77f] text-white hover:bg-[#7a937f]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : 'Submit Enrollment'}
                </button>
              </div>

              {/* Feedback Messages */}
              {successMessage && (
                <div className="mt-4 p-3 bg-[#eef4e5] border-l-4 border-[#8ba77f] rounded text-sm text-[#3a584e] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 bg-[#fee2e2] border-l-4 border-[#dc2626] rounded text-sm text-[#7a938f] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
                  {errorMessage}
                </div>
              )}
            </form>
          </div>

          {/* Enrollment List */}
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <h2 className="text-xl font-semibold text-[#3a584e] mb-6 pb-2 border-b border-[#e0e7d4] flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Recent Enrollments
            </h2>
            <EnrollmentList />
          </div>
        </div>
      </main>
    </div>
  );
}