'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser, getToken, clearToken } from '@/utils/api/user';
import { useRouter } from 'next/navigation';
import AccountSettingsDialog from '@/components/common/account_setting';

export default function AvatarMenu() {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getCurrentUser(token)
      .then((user) => setUsername(user.username))
      .catch((err) => console.error('Failed to fetch user:', err));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const confirmLogout = () => {
    clearToken();
    router.replace('/');
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        className="relative flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="User menu"
      >
        {username.charAt(0).toUpperCase() || '?'}
      </button>

      {/* Dropdown menu with transition */}
      <div
        className={`absolute right-0 top-12 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transition-all duration-200 ease-in-out ${
          dropdownOpen
            ? 'transform opacity-100 scale-100'
            : 'transform opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {dropdownOpen && (
          <>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setDialogOpen(true);
                  setDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Account Settings
              </button>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setLogoutDialogOpen(true);
                  setDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {dialogOpen && (
        <AccountSettingsDialog onClose={() => setDialogOpen(false)} />
      )}

      {/* Logout confirmation modal */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-transparent backdrop-blur-md transition-opacity" />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Confirm Logout
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to log out of your account?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => setLogoutDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  onClick={confirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}