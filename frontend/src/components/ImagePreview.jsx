import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export const ImagePreview = ({ previews, onRemoveImage, disabled = false }) => {
  if (!previews || previews.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {previews.map((previewUrl, idx) => (
        <div 
          key={idx} 
          className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-28 shadow-sm"
        >
          <img
            src={previewUrl}
            alt={`Preview ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          
          {idx === 0 && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-brand-500 text-white px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Main</span>
            </span>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
              title="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
