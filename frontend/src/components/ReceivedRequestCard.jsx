import React, { useState } from 'react';
import { 
  Check, X, Clock, CheckCircle2, XCircle, User, Phone, 
  Layers, Image as ImageIcon, RefreshCw, RotateCcw, ShieldCheck, AlertTriangle 
} from 'lucide-react';

export const ReceivedRequestCard = ({ order, onAccept, onReject, onCancel, onInspectReturn }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsProcessing(true);
    try {
      await onCancel(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const isReturnPending = order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_INSPECTION_PENDING';
  const isAcceptedActive = order.status === 'ACCEPTED' || order.status === 'RENTED' || order.status === 'ACTIVE';

  // Prevent accepting requests that exceed available stock
  const hasInsufficientStock = order.resourceAvailableQuantity != null && order.resourceAvailableQuantity < order.quantity;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex-shrink-0 flex items-center justify-center">
            {order.firstImageUrl ? (
              <img src={order.firstImageUrl} alt={order.itemName} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{order.category}</span>
            <h3 className="text-base font-bold text-white leading-tight">{order.itemName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Requested by: <strong className="text-brand-300">{order.customerName}</strong>
              {order.customerPhone && <span className="text-slate-500 font-mono ml-2">(+91 {order.customerPhone})</span>}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {order.status === 'PENDING' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>PENDING REQUEST</span>
            </span>
          )}
          {isAcceptedActive && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>RENTED / ACTIVE</span>
            </span>
          )}
          {order.status === 'RETURN_REQUESTED' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 animate-pulse">
              <RotateCcw className="w-3 h-3 text-blue-400" />
              <span>RETURN REQUESTED</span>
            </span>
          )}
          {order.status === 'RETURN_INSPECTION_PENDING' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>INSPECTION PENDING</span>
            </span>
          )}
          {(order.status === 'RETURN_CONFIRMED' || order.status === 'RETURNED') && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>RETURNED</span>
            </span>
          )}
          {order.status === 'CANCELLED_BY_CUSTOMER' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-slate-400" />
              <span>CANCELLED BY CUSTOMER</span>
            </span>
          )}
          {order.status === 'CANCELLED_BY_VENDOR' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>CANCELLED BY YOU</span>
            </span>
          )}
          {order.status === 'DAMAGE_REPORTED' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>DAMAGE REPORTED</span>
            </span>
          )}
          {order.status === 'REJECTED' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>REJECTED</span>
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Requested Qty:</span>
          <span className="text-white font-bold font-mono">{order.quantity} {order.quantity === 1 ? 'Unit' : 'Units'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Current Available:</span>
          <span className={`font-bold font-mono ${order.resourceAvailableQuantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {order.resourceAvailableQuantity != null ? `${order.resourceAvailableQuantity} Units` : 'Check Inventory'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Rent Rate:</span>
          <span className="text-brand-300 font-bold font-mono">
            {formatCurrency(order.rentAmount)} / {order.rentDurationUnit || 'Day'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Total Earning:</span>
          <span className="text-emerald-400 font-bold font-mono">
            {formatCurrency((order.rentAmount || 0) * (order.quantity || 1))}
          </span>
        </div>
      </div>

      {/* Return Note from Borrower */}
      {order.returnNote && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
          <strong className="text-white">Borrower's Return Note:</strong> "{order.returnNote}"
        </div>
      )}

      {/* Return Inspection Action Button */}
      {isReturnPending && onInspectReturn && (
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-blue-300 font-semibold flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Borrower returned this item. Inspection required before confirming return and restoring quantity.</span>
          </div>

          <button
            type="button"
            onClick={() => onInspectReturn(order.id)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex-shrink-0 self-stretch sm:self-auto justify-center"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>📷 INSPECT RETURN</span>
          </button>
        </div>
      )}

      {/* PENDING Action Buttons */}
      {order.status === 'PENDING' && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
          <div>
            {hasInsufficientStock ? (
              <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Cannot accept: Requested {order.quantity} units exceed available stock ({order.resourceAvailableQuantity ?? 0})</span>
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Sufficient stock available to fulfill this request
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleReject}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>REJECT</span>
            </button>

            <button
              type="button"
              disabled={isProcessing || hasInsufficientStock}
              onClick={handleAccept}
              title={hasInsufficientStock ? "Requested quantity exceeds available stock" : "Accept request and deduct stock"}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-bold shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>ACCEPT REQUEST</span>
            </button>
          </div>
        </div>
      )}

      {/* ACCEPTED / RENTED: Vendor Cancellation Button */}
      {isAcceptedActive && (
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Active rental. Available quantity was deducted from your inventory.</span>
          </div>

          {onCancel && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0 self-stretch sm:self-auto justify-center"
              title="Cancel this order and restore product quantity"
            >
              {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      )}

      {(order.status === 'RETURN_CONFIRMED' || order.status === 'RETURNED') && (
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>Return completed and confirmed. Product quantity has been restored to your available inventory.</span>
        </div>
      )}

      {order.status === 'CANCELLED_BY_VENDOR' && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>You cancelled this order. Product quantity was restored to your available inventory.</span>
        </div>
      )}

      {order.status === 'CANCELLED_BY_CUSTOMER' && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>Customer cancelled this order. Product quantity is available in your inventory.</span>
        </div>
      )}
    </div>
  );
};
