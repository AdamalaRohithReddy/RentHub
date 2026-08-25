import React from 'react';
import { 
  Tag, Calendar, User, Clock, CheckCircle2, XCircle, 
  AlertCircle, Image as ImageIcon, RotateCcw, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export const MyOrderCard = ({ order, onRequestReturn }) => {
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
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>RETURN CONFIRMED</span>
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

      {/* Action Notices & Return Button */}
      {isRentedActive && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Currently rented. Owner Contact: <strong>+91 {order.ownerPhone}</strong></span>
          </div>

          {onRequestReturn && (
            <button
              type="button"
              onClick={() => onRequestReturn(order)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all self-stretch sm:self-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETURN PRODUCT</span>
            </button>
          )}
        </div>
      )}

      {order.status === 'RETURN_REQUESTED' && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Return requested on {order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleDateString() : 'Today'}. Owner inspection pending.</span>
        </div>
      )}

      {order.status === 'RETURN_CONFIRMED' && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>Return verified and confirmed by owner. Thank you for sharing in our community!</span>
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
