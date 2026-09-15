import React from 'react';
import { 
  Tag, Calendar, User, Clock, CheckCircle2, XCircle, 
  AlertCircle, Image as ImageIcon, RotateCcw, AlertTriangle, ShieldCheck, X 
} from 'lucide-react';

export const MyOrderCard = ({ order, onRequestReturn, onCancelOrder }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>PENDING</span>
          </span>
        );
      case 'ACCEPTED':
      case 'RENTED':
      case 'ACTIVE':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ACTIVE / RENTED</span>
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-blue-400" />
            <span>RETURN REQUESTED</span>
          </span>
        );
      case 'RETURN_INSPECTION_PENDING':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>INSPECTION IN PROGRESS</span>
          </span>
        );
      case 'RETURN_CONFIRMED':
      case 'RETURNED':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>RETURNED</span>
          </span>
        );
      case 'CANCELLED_BY_CUSTOMER':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>CANCELLED BY YOU</span>
          </span>
        );
      case 'CANCELLED_BY_VENDOR':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>CANCELLED BY VENDOR</span>
          </span>
        );
      case 'DAMAGE_REPORTED':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>DAMAGE REPORTED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const isRentedActive = order.status === 'ACCEPTED' || order.status === 'RENTED' || order.status === 'ACTIVE';

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
              Owner: <strong className="text-slate-300">{order.ownerName || 'Verified Neighbor'}</strong>
            </p>
          </div>
        </div>

        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Rented Qty:</span>
          <span className="text-white font-bold font-mono">{order.quantity} {order.quantity === 1 ? 'Unit' : 'Units'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Rent Rate:</span>
          <span className="text-brand-300 font-bold font-mono">
            {formatCurrency(order.rentAmount)} / {order.rentDurationUnit || 'Day'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Total / {order.rentDurationUnit || 'Day'}:</span>
          <span className="text-emerald-400 font-bold font-mono">
            {formatCurrency((order.rentAmount || 0) * (order.quantity || 1))}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block">Requested Date:</span>
          <span className="text-slate-300 font-mono">{order.requestedAt ? new Date(order.requestedAt).toLocaleDateString() : 'Today'}</span>
        </div>
      </div>

      {/* PENDING: Allow Customer to Cancel */}
      {order.status === 'PENDING' && onCancelOrder && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Waiting for owner approval. Available quantity is not reduced until accepted.</span>
          </div>

          <button
            type="button"
            onClick={() => onCancelOrder(order.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-semibold transition-all self-stretch sm:self-auto justify-center"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Request</span>
          </button>
        </div>
      )}

      {/* ACTIVE / RENTED: Return Product or Cancel */}
      {isRentedActive && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Currently rented. Owner Contact: <strong>+91 {order.ownerPhone}</strong></span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {onCancelOrder && (
              <button
                type="button"
                onClick={() => onCancelOrder(order.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-semibold transition-all justify-center"
                title="Cancel active rental and restore product quantity"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            {onRequestReturn && (
              <button
                type="button"
                onClick={() => onRequestReturn(order)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETURN PRODUCT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {order.status === 'RETURN_REQUESTED' && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Return requested on {order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleDateString() : 'Today'}. Owner inspection pending.</span>
        </div>
      )}

      {(order.status === 'RETURN_CONFIRMED' || order.status === 'RETURNED') && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>Return verified and confirmed by owner. Available quantity has been restored to the listing!</span>
        </div>
      )}

      {order.status === 'CANCELLED_BY_CUSTOMER' && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>You cancelled this order. Any deducted quantity was restored to the product inventory.</span>
        </div>
      )}

      {order.status === 'CANCELLED_BY_VENDOR' && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>The vendor cancelled this order. Product quantity was restored.</span>
        </div>
      )}

      {order.status === 'DAMAGE_REPORTED' && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>The owner submitted a damage report during return inspection.</span>
        </div>
      )}
    </div>
  );
};
