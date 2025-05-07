'use client';

import React, { useState } from 'react';

interface CreateProductDialogProps {
  onClose: () => void;
}

export default function CreateProductDialog({ onClose }: CreateProductDialogProps) {
  const [name, setName] = useState('');
  const [ndviMin, setNdviMin] = useState('');
  const [ndviMax, setNdviMax] = useState('');
  const [premium, setPremium] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, ndviMin, ndviMax, premium, duration });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-md w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Create Product</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Product Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">NDVI Min</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={ndviMin}
            onChange={(e) => setNdviMin(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">NDVI Max</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={ndviMax}
            onChange={(e) => setNdviMax(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Premium</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Duration (months)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
