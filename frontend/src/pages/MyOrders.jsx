import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Inbox, Clock, CheckCircle2, XCircle, RefreshCw, 
  ArrowLeft, Search, Filter, AlertCircle, Sparkles, RotateCcw, X 
} from 'lucide-react';
import { api } from '../api/client';
import { returnService } from '../services/returnService';
import { useAuth } from '../context/AuthContext';
import { MyOrderCard } from '../components/MyOrderCard';
import { ReceivedRequestCard } from '../components/ReceivedRequestCard';
import './MyOrders.css';

const STATUS_FILTERS = [
  'ALL', 
  'PENDING', 
  'ACCEPTED', 
  'RETURN_REQUESTED', 
  'RETURNED', 
  'CANCELLED_BY_CUSTOMER', 
  'CANCELLED_BY_VENDOR', 
  'REJECTED'
];

export const MyOrders = ({ 
  initialTab = 'my-requests', 
  onTabChange,
  onNavigateToHome, 
  onNavigateToGiveForRent,
  onNavigateToReturnInspect 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'my-requests' or 'requests-received'
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [myOrders, setMyOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Return Modal State
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnNote, setReturnNote] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    setActionFeedback(null);
    try {
      const [myRes, recRes] = await Promise.all([
        api.getMyOrders(),
        api.getReceivedOrders(),
      ]);

      if (myRes.data) setMyOrders(myRes.data);
      if (recRes.data) setReceivedOrders(recRes.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setActionFeedback(null);
    try {
      const res = await api.acceptOrder(orderId);
      if (res.data) {
        setActionFeedback({
          type: 'success',
          message: `✅ Order #${orderId} accepted successfully! Available product quantity has been deducted.`,
        });
        fetchAllOrders();
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to accept order request.',
      });
    }
  };

  const handleRejectOrder = async (orderId) => {
    setActionFeedback(null);
    try {
      const res = await api.rejectOrder(orderId);
      if (res.data) {
        setActionFeedback({
          type: 'info',
          message: `Order #${orderId} has been rejected.`,
        });
        fetchAllOrders();
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject order request.',
      });
    }
  };

  // Customer Cancels Order
  const handleCancelByCustomer = async (orderId) => {
    setActionFeedback(null);
    try {
      const res = await api.cancelOrderByCustomer(orderId);
      if (res.data) {
        setActionFeedback({
          type: 'success',
          message: `Order #${orderId} has been cancelled. Any deducted product quantity was restored.`,
        });
        fetchAllOrders();
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel order.',
      });
    }
  };

  // Vendor Cancels Order
  const handleCancelByVendor = async (orderId) => {
    setActionFeedback(null);
    try {
      const res = await api.cancelOrderByVendor(orderId);
      if (res.data) {
        setActionFeedback({
          type: 'success',
          message: `Order #${orderId} was cancelled by you. Product quantity has been restored to your inventory.`,
        });
        fetchAllOrders();
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel order.',
      });
    }
  };

  // Borrower Return Request
  const handleOpenReturnModal = (order) => {
    setSelectedOrderForReturn(order);
    setReturnNote('');
    setActionFeedback(null);
  };

  const handleSubmitReturnRequest = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    setIsSubmittingReturn(true);
    try {
      await returnService.requestReturn(selectedOrderForReturn.id, returnNote);
      setActionFeedback({
        type: 'success',
        message: `🔄 Return requested for "${selectedOrderForReturn.itemName}". The owner will inspect the equipment and confirm the return to restore available quantity.`,
      });
      setSelectedOrderForReturn(null);
      fetchAllOrders();
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to request return.',
      });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    setStatusFilter('ALL');
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  // Filter orders according to active tab and status pill
  const currentList = activeTab === 'my-requests' ? myOrders : receivedOrders;
  const filteredList = currentList.filter((order) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'RETURNED' && (order.status === 'RETURN_CONFIRMED' || order.status === 'RETURNED')) return true;
    return order.status === statusFilter;
  });

  const pendingReceivedCount = receivedOrders.filter((o) => o.status === 'PENDING' || o.status === 'RETURN_REQUESTED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Orders &amp; Rental Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track rental orders, cancel requests, return borrowed products, and manage received requests with real-time inventory updates.
          </p>
        </div>

        <button
          onClick={fetchAllOrders}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
          title="Refresh orders from MySQL"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 animate-fade-in ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : actionFeedback.type === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : 'bg-slate-900 border border-slate-800 text-slate-300'
        }`}>
          {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Two Main Mode Tabs: Customer vs Vendor */}
      <div className="flex border-b border-slate-800 gap-4">
        
        {/* Tab 1: My Requests */}
        <button
          onClick={() => handleTabSwitch('my-requests')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'my-requests'
              ? 'border-brand-400 text-brand-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>MY BORROWED REQUESTS</span>
          <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-800">
            {myOrders.length}
          </span>
        </button>

        {/* Tab 2: Requests Received */}
        <button
          onClick={() => handleTabSwitch('requests-received')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'requests-received'
              ? 'border-brand-400 text-brand-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>REQUESTS &amp; RETURNS RECEIVED</span>
          {pendingReceivedCount > 0 ? (
            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-mono font-bold shadow-glow animate-pulse">
              {pendingReceivedCount} action(s)
            </span>
          ) : (
            <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-800">
              {receivedOrders.length}
            </span>
          )}
        </button>

      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {status === 'ALL' ? 'All Orders' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders Content List */}
      <div className="space-y-4">
        
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading orders from MySQL database...</p>
          </div>
        )}

        {!isLoading && filteredList.length === 0 && (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-slate-600">
              {activeTab === 'my-requests' ? <ShoppingBag className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-bold text-white">No orders found</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'my-requests' 
                ? "You haven't requested any resources for rent yet."
                : "No incoming rental or return requests found for your listed products."}
            </p>
          </div>
        )}

        {!isLoading && filteredList.length > 0 && activeTab === 'my-requests' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredList.map((order) => (
              <MyOrderCard 
                key={order.id} 
                order={order}
                onRequestReturn={handleOpenReturnModal}
                onCancelOrder={handleCancelByCustomer}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredList.length > 0 && activeTab === 'requests-received' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredList.map((order) => (
              <ReceivedRequestCard 
                key={order.id} 
                order={order} 
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                onCancel={handleCancelByVendor}
                onInspectReturn={onNavigateToReturnInspect}
              />
            ))}
          </div>
        )}

      </div>

      {/* Borrower Return Product Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Return Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReturn(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <strong className="text-white">{selectedOrderForReturn.itemName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rented Quantity:</span>
                <strong className="text-emerald-400 font-mono">{selectedOrderForReturn.quantity} Unit(s)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="text-slate-300">{selectedOrderForReturn.ownerName}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReturnRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Return Note / Pickup Info <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Left in porch box, cleaned and ready for inspection..."
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReturn(null)}
                  disabled={isSubmittingReturn}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'SUBMIT RETURN REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
