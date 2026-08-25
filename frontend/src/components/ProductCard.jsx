import React, { useState } from 'react';
import { Tag, MapPin, Calendar, User, Image as ImageIcon, Layers, ArrowUpRight } from 'lucide-react';

export const ProductCard = ({ product, onClick }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[activeImageIndex]?.imageUrl || (images.length > 0 ? images[0].imageUrl : null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const isAvailable = product.status === 'AVAILABLE' && (product.availableQuantity > 0);

  return (
    <div 
      onClick={() => onClick && onClick(product.id)}
      className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 flex flex-col group transition-all duration-300 hover:border-brand-500/50 hover:shadow-glow cursor-pointer"
    >
      
      {/* Product Image Section */}
      <div className="relative h-56 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('flex-col', 'gap-2', 'text-slate-500');
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-600" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-brand-300 border border-brand-500/30 shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3 text-brand-400" />
            {product.category}
          </span>
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm ${
            isAvailable 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {product.status || (isAvailable ? 'AVAILABLE' : 'OUT OF STOCK')}
          </span>
        </div>

        {/* Multiple Images Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2 py-1 rounded-full z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === activeImageIndex ? 'w-4 bg-brand-400' : 'bg-slate-500 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Content & Bottom Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
              {product.itemName}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Quantity & Pricing Box */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Rent Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-brand-400">
                {formatCurrency(product.rentAmount)}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                / {product.rentDurationUnit || 'Day'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider flex items-center justify-end gap-1">
              <Layers className="w-3 h-3 text-slate-500" /> Quantity
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {product.availableQuantity ?? 1} Available
            </span>
          </div>
        </div>

        {/* Location & Owner Footer */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{product.pickupLocation}</span>
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              {product.ownerName || 'Verified Neighbor'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
