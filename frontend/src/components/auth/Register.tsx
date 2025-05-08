'use client';

import { useState } from 'react';
import { InsuranceCompanyCreate, InsuranceCompanyResponse, registerCompany } from '@/utils/api/company';

interface RegisterFormProps {
  onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licensedBy, setLicensedBy] = useState('');
  const [operationDate, setOperationDate] = useState('');
  const [capital, setCapital] = useState<number | ''>('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState<InsuranceCompanyResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !name ||
      !licenseNo ||
      !licensedBy ||
      !operationDate ||
      capital === '' ||
      !country ||
      !city ||
      !phoneNo ||
      !postalCode ||
      !email
    ) {
      setError('Please fill out all fields');
      return;
    }

    const payload: InsuranceCompanyCreate = {
      name,
      licenseNo,
      licensedBy,
      operationDate,
      capital: Number(capital),
      country,
      city,
      phoneNo,
      postalCode,
      email,
    };

    setLoading(true);
    try {
      const created = await registerCompany(payload);
      setCompany(created);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md font-sans space-y-4">
      <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">
        Insurance Company Registration
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {company && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md">
          Registered successfully! Company ID: {company.id}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-black mb-1">Company Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Farm Co."
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="licenseNo" className="block text-black mb-1">License Number</label>
        <input
          id="licenseNo"
          type="text"
          value={licenseNo}
          onChange={(e) => setLicenseNo(e.target.value)}
          placeholder="LIC-12345"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="country" className="block text-black mb-1">Country</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Ethiopia"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="city" className="block text-black mb-1">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Addis Ababa"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="phoneNo" className="block text-black mb-1">Phone Number</label>
          <input
            id="phoneNo"
            type="tel"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            placeholder="+251 9xx xxx xxx"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="postalCode" className="block text-black mb-1">Postal Code</label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="1000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="licensedBy" className="block text-black mb-1">Licensed By</label>
        <input
          id="licensedBy"
          type="text"
          value={licensedBy}
          onChange={(e) => setLicensedBy(e.target.value)}
          placeholder="Regulatory Authority"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="operationDate" className="block text-gray-700 mb-1">Operation Date</label>
        <input
          id="operationDate"
          type="date"
          value={operationDate}
          onChange={(e) => setOperationDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="capital" className="block text-black mb-1">Capital (USD)</label>
        <input
          id="capital"
          type="number"
          value={capital}
          onChange={(e) => setCapital(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="e.g. 5000"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@farmersinsurance.com"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Registering…' : 'Register'}
      </button>

      <p className="mt-4 text-center text-gray-600 text-sm">
        Already have an account?{' '}
        <span onClick={onSwitch} className="text-green-600 hover:underline cursor-pointer">
          Login
        </span>
      </p>
    </form>
  );
}
