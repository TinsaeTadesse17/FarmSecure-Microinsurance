'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser, getToken, clearToken } from '@/utils/api/user';
import { useRouter } from 'next/navigation';
import AccountSettingsDialog from '@/components/common/account_setting';

export default function AvatarMenu() {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  // new state for logout confirmation modal:
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
    <div className="flex justify-end mb-6 relative" ref={dropdownRef}>
      <button
        className="bg-green-600 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {username.charAt(0).toUpperCase() || '?'}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="px-4 py-2 border-b">
            Signed in as <strong>{username}</strong>
          </div>
          <button
            onClick={() => {
              setDialogOpen(true);
              setDropdownOpen(false);
            }}
            className="block px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100"
          >
            Account Settings
          </button>
          <button
            onClick={() => {
              setLogoutDialogOpen(true);
              setDropdownOpen(false);
            }}
            className="block px-4 py-2 w-full text-left text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      )}

      {dialogOpen && (
        <AccountSettingsDialog onClose={() => setDialogOpen(false)} />
      )}

      {/* Custom logout confirmation modal */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm z-20">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setLogoutDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
