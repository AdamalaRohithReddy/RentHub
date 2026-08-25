import React from 'react';
import { 
  Package, Tag, IndianRupee, Layers, ShieldCheck, 
  Edit3, ListOrdered, AlertTriangle, CheckCircle2, Image as ImageIcon 
} from 'lucide-react';

export const ProductOwnerCard = ({ product, onEdit, onViewOrders }) => {
  if (!product) return null;

  const firstImage = (product.images && product.images.length > 0)
    ? product.images[0].imageUrl
    : null;

  const totalQty = product.totalQuantity != null ? product.totalQuantity : product.availableQuantity;
  const availQty = product.availableQuantity != null ? product.availableQuantity : 0;
  const rentedQty = product.rentedQuantity != null ? product.rentedQuantity : Math.max(0, totalQty - availQty);

  const getStatusBadge = (status, avail, rented) => {
    if (avail === 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
          FULLY RENTED
        </span>
      );
    }
    if (rented > 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          PARTIALLY RENTED
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        AVAILABLE
      </span>
    );
  };

  const conditionScore = product.conditionScan?.conditionScore || 85;
  const conditionStatus = product.conditionScan?.conditionStatus || 'GOOD';

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg group">
      
      {/* Product Image & Badges */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">No image</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          {getStatusBadge(product.status, availQty, rentedQty)}
        </div>

        {product.conditionScan && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-brand-300 border border-brand-500/30 backdrop-blur-sm">
            AI Condition: {conditionStatus} ({conditionScore}/100)
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider block">
              {product.category}
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
              {product.itemName}
            </h3>
          </div>
          
          <div className="text-right">
            <span className="text-lg font-black text-white font-mono">
              ₹{product.rentAmount}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              /{product.rentDurationUnit || 'day'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Quantities Table Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Total</span>
            <strong className="text-white font-mono text-sm">{totalQty}</strong>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase">Available</span>
            <strong className="text-emerald-300 font-mono text-sm">{availQty}</strong>
          </div>
          <div>
            <span className="text-[10px] text-amber-400 block uppercase">Rented</span>
            <strong className="text-amber-300 font-mono text-sm">{rentedQty}</strong>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => onEdit(product.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>EDIT PRODUCT</span>
        </button>

        <button
          type="button"
          onClick={() => onViewOrders(product.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 hover:text-white text-xs font-bold transition-all"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>VIEW ORDERS</span>
        </button>
      </div>

    </div>
  );
};
