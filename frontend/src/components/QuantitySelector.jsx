import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantitySelector = ({ quantity, maxQuantity = 1, onChange, disabled = false }) => {
  const handleDecrement = () => {
    if (quantity > 1 && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity && !disabled) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= 1}
        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-400 disabled:opacity-30 disabled:border-slate-800 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
        title="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-12 text-center text-xl font-bold font-mono text-brand-300">
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= maxQuantity}
        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-400 disabled:opacity-30 disabled:border-slate-800 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
        title="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
