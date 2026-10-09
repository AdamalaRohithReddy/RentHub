import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, RefreshCw, AlertCircle, ArrowLeft, 
  Layers, CheckCircle2, Tag, X, ShieldCheck, History, Calendar, AlertTriangle 
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { ProductOwnerCard } from '../components/ProductOwnerCard';

export const MyProducts = ({ 
  onNavigateToHome, 
  onNavigateToGiveForRent, 
  onNavigateToEdit, 
  onNavigateToOrders,
  onSelectProduct 
}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'RENTED'

  // Condition History Modal State
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
  const [conditionHistory, setConditionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

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

  const handleOpenConditionHistory = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    setSelectedProductForHistory(prod || { id: productId, itemName: `Product #${productId}` });
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const history = await resourceService.getConditionHistory(productId);
      setConditionHistory(history || []);
    } catch (err) {
      console.error('Failed to load condition history:', err);
      setHistoryError(err.response?.data?.message || 'Failed to load condition history.');
    } finally {
      setIsLoadingHistory(false);
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
            Manage your items, edit quantities, inspect returned equipment, view orders, and check AI condition scan history.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={fetchMyProducts}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title="Refresh listings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToGiveForRent}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Give for Rent</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {['ALL', 'AVAILABLE', 'RENTED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
              onViewDetails={onSelectProduct ? () => onSelectProduct(prod.id) : null}
              onEdit={() => onNavigateToEdit(prod.id)}
              onViewOrders={() => onNavigateToOrders(prod.id)}
              onViewConditionHistory={() => handleOpenConditionHistory(prod.id)}
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

      {/* Condition History Modal */}
      {selectedProductForHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-5 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-purple-400">
                <History className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold text-white">Condition Scan History</h3>
                  <p className="text-xs text-slate-400">{selectedProductForHistory.itemName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForHistory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {isLoadingHistory ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading scan timeline...</p>
                </div>
              ) : historyError ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {historyError}
                </div>
              ) : conditionHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-slate-400">
                  <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No condition scan records found</p>
                  <p className="text-xs text-slate-500">Scans are automatically generated during product listing and return inspections.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conditionHistory.map((h, idx) => (
                    <div
                      key={h.id || idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {h.scanType || 'SCAN'}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Condition: {h.conditionStatus || 'GOOD'} ({h.conditionScore}/100)
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {h.scannedAt ? new Date(h.scannedAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>

                      {h.scanResult && (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          {h.scanResult}
                        </p>
                      )}

                      {h.issues && h.issues.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            Detected Observations:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {h.issues.map((iss, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-300"
                              >
                                {iss.issueType || iss.description}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProductForHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
