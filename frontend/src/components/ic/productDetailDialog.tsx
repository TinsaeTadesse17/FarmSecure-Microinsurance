'use client';

import React from 'react';
import { X, Package, Percent, DollarSign, Zap, ArrowDown, ArrowUp, Bell, DoorOpen } from 'lucide-react';
import { Product } from '@/utils/api/product';

interface ProductDetailDialogProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0  bg-transparency-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#e0e7d4] sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#3a584e] flex items-center gap-3">
              <Package className="w-6 h-6 text-[#8ba77f]" />
              {product.name}
            </h2>
            <button onClick={onClose} className="text-[#7a938f] hover:text-[#3a584e]">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-1 text-sm text-[#7a938f] capitalize">{product.type} product</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[#f9f8f3] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-[#7a938f] mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium text-[#3a584e]">Fiscal Year:</span> {product.fiscal_year || 'N/A'}</p>
                
                </div>
              </div>

              <div className="bg-[#f9f8f3] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-[#7a938f] mb-2">Premium Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Rate:</span> {product.premium_rate ?? 'N/A'}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Premium:</span> {product.premium !== undefined ? `${product.premium.toFixed(2)} ETB` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Commission:</span> {product.commission ?? 'N/A'} ETB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#f9f8f3] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-[#7a938f] mb-2">Adjustments</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">ELC:</span> {product.elc ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Load:</span> {product.load ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Discount:</span> {product.discount ?? 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f9f8f3] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-[#7a938f] mb-2">Thresholds</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Trigger:</span> {product.trigger ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-[#8ba77f]" />
                    <span className="text-sm"><span className="font-medium text-[#3a584e]">Exit:</span> {product.exit ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e0e7d4] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDialog;