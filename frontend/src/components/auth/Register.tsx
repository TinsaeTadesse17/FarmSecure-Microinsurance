'use client';

import { useState } from 'react';
import {
  InsuranceCompanyCreate,
  InsuranceCompanyResponse,
  registerCompany,
} from '@/utils/api/company';
import { Sprout } from 'lucide-react';

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
  const [successOpen, setSuccessOpen] = useState(false);

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
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md border border-[#e0e7d4] space-y-6"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sprout className="w-7 h-7 text-[#8ba77f]" />
            <h2 className="text-2xl font-bold text-[#3a584e]">
              Insurance Company Registration
            </h2>
          </div>
          <p className="text-[#7a938f] text-sm">Register your agricultural insurance cooperative</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[#7a938f] text-sm font-medium mb-2">
              Company Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Farm Co."
              required
              className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="licenseNo" className="block text-[#7a938f] text-sm font-medium mb-2">
                License Number
              </label>
              <input
                id="licenseNo"
                type="text"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                placeholder="LIC-12345"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>

            <div>
              <label htmlFor="licensedBy" className="block text-[#7a938f] text-sm font-medium mb-2">
                Licensed By
              </label>
              <input
                id="licensedBy"
                type="text"
                value={licensedBy}
                onChange={(e) => setLicensedBy(e.target.value)}
                placeholder="Regulatory Authority"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="operationDate" className="block text-[#7a938f] text-sm font-medium mb-2">
                Operation Date
              </label>
              <input
                id="operationDate"
                type="date"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>

            <div>
              <label htmlFor="capital" className="block text-[#7a938f] text-sm font-medium mb-2">
                Capital (USD)
              </label>
              <input
                id="capital"
                type="number"
                value={capital}
                onChange={(e) =>
                  setCapital(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 5000"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-[#7a938f] text-sm font-medium mb-2">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ethiopia"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-[#7a938f] text-sm font-medium mb-2">
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Addis Ababa"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNo" className="block text-[#7a938f] text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="phoneNo"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="+251 9xx xxx xxx"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-[#7a938f] text-sm font-medium mb-2">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="1000"
                required
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-[#7a938f] text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@farmersinsurance.com"
              required
              className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors text-[#3a584e]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            'Register'
          )}
        </button>

        <p className="text-center text-sm text-[#7a938f]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#8ba77f] hover:text-[#7a937f] font-medium focus:outline-none focus:underline transition-colors"
          >
            Login
          </button>
        </p>
      </form>

      {successOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm w-full border border-[#e0e7d4]">
            <div className="text-center">
              <Sprout className="mx-auto w-8 h-8 text-[#8ba77f] mb-4" />
              <h3 className="text-xl font-semibold text-[#3a584e] mb-2">
                Registration Successful!
              </h3>
              <p className="text-[#7a938f] text-sm leading-relaxed">
                You will be notified once your company is approved. 
                Please remember to update your password after initial login.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setSuccessOpen(false)}
                className="w-full py-2.5 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}