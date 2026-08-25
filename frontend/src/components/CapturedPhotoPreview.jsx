import React from 'react';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export const CapturedPhotoPreview = ({ previewUrl, isProcessing, angle = 'Front' }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-72 sm:h-80 flex items-center justify-center shadow-lg">
      <img
        src={previewUrl}
        alt={`Captured ${angle}`}
        className="w-full h-full object-cover"
      />

      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur-md text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-full shadow">
        Angle: {angle}
      </span>

      {isProcessing && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-center p-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Checking Image Quality &amp; Scanning Condition...</p>
          <p className="text-[11px] text-brand-300 font-mono">Analyzing clarity, lighting, and surface integrity</p>
        </div>
      )}
    </div>
  );
};
