import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, RefreshCw, AlertCircle, ArrowLeft, 
  Layers, CheckCircle2, Tag 
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { ProductOwnerCard } from '../components/ProductOwnerCard';

export const MyProducts = ({ onNavigateToHome, onNavigateToGiveForRent, onNavigateToEdit, onNavigateToOrders }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'RENTED'

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await resourceService.getMyProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch my products:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load your listed products.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'ALL') return true;
    const avail = p.availableQuantity != null ? p.availableQuantity : 0;
    const total = p.totalQuantity != null ? p.totalQuantity : p.availableQuantity;
    const rented = p.rentedQuantity != null ? p.rentedQuantity : (total - avail);

    if (filter === 'AVAILABLE') return avail > 0;
    if (filter === 'RENTED') return rented > 0;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToHome}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Listed Products
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your items, edit quantities, inspect returned equipment, and manage photos.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToGiveForRent}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Give for Rent</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'AVAILABLE', 'RENTED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab === 'ALL' && `All Items (${products.length})`}
            {tab === 'AVAILABLE' && 'Available for Rent'}
            {tab === 'RENTED' && 'Currently Rented'}
          </button>
        ))}
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchMyProducts}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading your listed items...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <ProductOwnerCard
              key={prod.id}
              product={prod}
              onEdit={() => onNavigateToEdit(prod.id)}
              onViewOrders={() => onNavigateToOrders(prod.id)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400">
              {filter === 'ALL'
                ? "You haven't listed any items for rent yet."
                : `No products matching filter "${filter}".`}
            </p>
          </div>
          {filter === 'ALL' && (
            <button
              type="button"
              onClick={onNavigateToGiveForRent}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all"
            >
              List Your First Item
            </button>
          )}
        </div>
      )}

    </div>
  );
};
