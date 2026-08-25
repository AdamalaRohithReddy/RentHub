import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export const ImageUploader = ({ onImagesSelected, maxImages = 5, currentCount = 0, disabled = false }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesSelected(files);
    }
    // reset input
    e.target.value = '';
  };

  const isFull = currentCount >= maxImages;

  return (
    <div>
      <label
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group ${
          isFull || disabled
            ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/30'
            : 'border-slate-700 hover:border-brand-400 bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={isFull || disabled}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          {isFull ? `Maximum ${maxImages} images uploaded` : 'Click to browse or drag & drop product photos'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Upload 1 to {maxImages} images • JPG, PNG, WEBP (Max 5MB each)
        </p>
      </label>
    </div>
  );
};
