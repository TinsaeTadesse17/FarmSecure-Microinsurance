'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreateProductDialog from '@/components/ic/productDialog';

export default function ProductConfiguration() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockProducts = [
    {
      id: 1,
      name: 'Crop Cover A',
      ndviMin: 0.2,
      ndviMax: 0.8,
      premium: 150,
      duration: 3,
    },
    {
      id: 2,
      name: 'Crop Cover B',
      ndviMin: 0.4,
      ndviMax: 0.9,
      premium: 200,
      duration: 6,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Product Configuration</h2>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Product
            </button>
          </div>

          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">NDVI Min</th>
                <th className="px-4 py-2 border">NDVI Max</th>
                <th className="px-4 py-2 border">Premium</th>
                <th className="px-4 py-2 border">Duration</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2 border">{product.name}</td>
                  <td className="px-4 py-2 border">{product.ndviMin}</td>
                  <td className="px-4 py-2 border">{product.ndviMax}</td>
                  <td className="px-4 py-2 border">{product.premium}</td>
                  <td className="px-4 py-2 border">{product.duration} months</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dialogOpen && <CreateProductDialog onClose={() => setDialogOpen(false)} />}
      </main>
    </div>
  );
}
