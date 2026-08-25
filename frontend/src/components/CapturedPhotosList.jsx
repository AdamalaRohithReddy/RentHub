import React from 'react';
import { Camera, X, CheckCircle2, Eye, Plus, ShieldCheck } from 'lucide-react';

export const SUGGESTED_ANGLES = [
  'Photo 1: Front View',
  'Photo 2: Back View',
  'Photo 3: Side View',
  'Photo 4: Other Side View',
  'Photo 5: Close-up Details / Wear',
];

export const CapturedPhotosList = ({ 
  photos = [], 
  onRemovePhoto, 
  onTakeNextPhoto, 
  minPhotos = 3, 
  maxPhotos = 5,
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Progress & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Confirmed Camera Photos ({photos.length}/{maxPhotos})
            </span>
            {photos.length >= minPhotos && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Min requirement met</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Capture at least {minPhotos} photos from different angles (Front, Back, Sides, Close-up).
          </p>
        </div>

        {photos.length < maxPhotos && !disabled && (
          <button
            type="button"
            onClick={onTakeNextPhoto}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-xs shadow-glow transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TAKE NEXT PHOTO</span>
          </button>
        )}
      </div>

      {/* Suggested Angles Helper Badges */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_ANGLES.slice(0, maxPhotos).map((ang, idx) => {
          const isCaptured = idx < photos.length;
          return (
            <span
              key={idx}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                isCaptured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              {isCaptured ? `✓ ${ang}` : `○ ${ang}`}
            </span>
          );
        })}
      </div>

      {/* Thumbnails Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {photos.map((item, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-32 shadow-sm"
            >
              <img
                src={item.previewUrl}
                alt={`Angle ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Angle Tag */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-300 truncate">
                {item.angle || `Photo ${idx + 1}`}
              </div>

              {/* Score Tag */}
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded shadow">
                {idx === 0 ? 'Main' : `P${idx + 1}`}
              </span>

              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemovePhoto(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 text-center space-y-2">
          <Camera className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300">No photos captured yet</p>
          <p className="text-[11px] text-slate-500">
            Click <strong>[ 📷 OPEN CAMERA ]</strong> to begin capturing product photos.
          </p>
        </div>
      )}
    </div>
  );
};
