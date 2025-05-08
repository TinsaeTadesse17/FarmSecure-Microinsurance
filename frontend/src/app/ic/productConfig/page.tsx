'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreateProductDialog from '@/components/ic/productDialog';
import { getProducts, createProduct, Product, ProductCreate } from '@/lib/api/product';

export default function ProductConfiguration() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleCreate = async (newProduct: ProductCreate) => {
    try {
      await createProduct(newProduct);
      await fetchProducts();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Commission Rate</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2 border">{product.name}</td>
                  <td className="px-4 py-2 border">{product.type}</td>
                  <td className="px-4 py-2 border">{product.commission_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dialogOpen && <CreateProductDialog onClose={() => setDialogOpen(false)} onCreate={handleCreate} />}
      </main>
    </div>
  );
}
