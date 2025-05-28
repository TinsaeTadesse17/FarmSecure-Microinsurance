'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreateProductDialog from '@/components/ic/productDialog';
import { getProducts, createProduct, Product, ProductCreate } from '@/utils/api/product';
import { Plus, RefreshCw, Search, Package } from 'lucide-react';
import {  getCurrentUser, getToken } from '@/utils/api/user';  

export default function ProductConfiguration() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

const fetchProducts = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const token = await getToken(); 
    if (!token) {
      setError('No authentication token found. Please log in.');
      setIsLoading(false);
      return;
    }
    
    const user = await getCurrentUser(); 
    const allProducts = await getProducts(); 
    const filteredProducts = allProducts.filter(
      product => product.company_id === user.company_id
    );
    setProducts(filteredProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    setError('Failed to load products. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleCreate = async (newProduct: ProductCreate) => {
    try {
      await createProduct(newProduct);
      await fetchProducts();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. Please try again.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Package className="w-8 h-8 text-[#8ba77f]" />
              Product Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Insurance Configuration
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Manage agricultural insurance products and commission structures • Updated in real-time
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a938f]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] text-[#3a584e] placeholder-[#a3b5af]"
              />
            </div>
            <AvatarMenu />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e0e7d4]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#3a584e]">Product Portfolio</h2>
                <p className="text-sm text-[#7a938f] mt-1">
                  Configure insurance products and premium rates
                </p>
              </div>
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-all shadow-sm"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Product
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-[#fee2e2] border-l-4 border-[#dc2626] p-4 rounded">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-[#dc2626] mr-3" />
                <p className="text-sm text-[#7a938f]">{error}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <RefreshCw className="h-12 w-12 text-[#8ba77f] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-[#7a938f]" />
                <h3 className="mt-4 text-lg font-medium text-[#3a584e]">No products found</h3>
                <p className="mt-2 text-sm text-[#7a938f]">
                  Try adjusting your search or create a new product
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-all"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Product
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#e0e7d4]">
                <thead className="bg-[#f9f8f3]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                      Insurance Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                      Coverage Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                      Commission Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e7d4]">
                  {filtered.map(product => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-[#f9f8f3] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3a584e]">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7a938f]">
                        {product.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm font-medium bg-[#eef4e5] text-[#3a584e] rounded-full">
                          {product.commission_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {dialogOpen && (
          <CreateProductDialog onClose={() => setDialogOpen(false)} onCreate={handleCreate} />
        )}
      </main>
    </div>
  );
}