'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getIcUsers, updateUserAccount, UserOut, getToken } from '@/utils/api/user';

interface FetchState {
  data: UserOut[];
  loading: boolean;
  error: string | null;
}

const statusOptions = ['approve', 'pending', 'reject'];

const statusColors: Record<string, string> = {
  approve: 'bg-green-100 text-green-800',
  pending: 'bg-gray-100 text-gray-800',
  reject: 'bg-red-100 text-red-800',
};

const IcUsersPage: React.FC = () => {
  const [icUsers, setIcUsers] = useState<FetchState>({
    data: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchIcUsers = async () => {
      setIcUsers(prev => ({ ...prev, loading: true, error: null }));
      const token = getToken();
      if (!token) {
        setIcUsers({
          data: [],
          loading: false,
          error: 'No authentication token found. Please log in as an admin.',
        });
        return;
      }
      try {
        const data = await getIcUsers(token);
        setIcUsers({ data, loading: false, error: null });
      } catch (error) {
        setIcUsers({
          data: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch IC users',
        });
      }
    };

    fetchIcUsers();
  }, []);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    const token = getToken();
    if (!token) {
      setIcUsers(prev => ({
        ...prev,
        error: 'No authentication token found. Please log in.',
      }));
      return;
    }

    // Optimistic update
    const previousData = [...icUsers.data];
    setIcUsers(prev => ({
      ...prev,
      data: prev.data.map(user =>
        user.user_id === userId ? { ...user, status: newStatus } : user
      ),
    }));

    try {
      await updateUserAccount(userId, { status: newStatus }, token);
    } catch (error) {
      // Revert on error
      setIcUsers(prev => ({
        ...prev,
        data: previousData,
        error: error instanceof Error ? error.message : 'Failed to update status',
      }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-700">User Management</h1>
          <AvatarMenu />
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-green-800">IC users</h2>
              <div className="text-sm text-gray-500">
                {icUsers.data.length} users found
              </div>
            </div>
            
            {icUsers.loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
              </div>
            )}
            
            {icUsers.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{icUsers.error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!icUsers.loading && !icUsers.error && icUsers.data.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">There are currently no investment club users registered.</p>
              </div>
            )}
            
            {!icUsers.loading && !icUsers.error && icUsers.data.length > 0 && (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {icUsers.data.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.status}
                            onChange={e => handleStatusChange(user.user_id, e.target.value)}
                            className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md ${
                              user.status === 'approve' ? 'border-green-300 bg-green-50' : 
                              user.status === 'pending' ? 'border-gray-300 bg-gray-50' : 
                              'border-red-300 bg-red-50'
                            }`}
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IcUsersPage;