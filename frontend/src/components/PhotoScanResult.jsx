import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Check, RotateCcw, 
  ShieldCheck, AlertCircle, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { ConditionIssueList } from './ConditionIssueList';

export const PhotoScanResult = ({ scanResult, onRetake, onUsePhoto }) => {
  if (!scanResult) return null;

  const isUsable = scanResult.scanStatus === 'SUCCESS' && scanResult.imageQuality !== 'POOR';

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
      
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Per-Photo Scan Result</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Image Quality Badge */}
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            scanResult.imageQuality === 'GOOD'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : scanResult.imageQuality === 'FAIR'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            Quality: {scanResult.imageQuality || 'GOOD'} ({scanResult.qualityScore || 90}%)
          </span>

          {/* Condition Score Badge */}
          {isUsable && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
              Score: {scanResult.conditionScore || 85}/100
            </span>
          )}
        </div>
      </div>

      {/* Quality Feedback / Warnings */}
      {scanResult.qualityFeedback && scanResult.qualityFeedback.length > 0 && (
        <div className="space-y-1 text-xs">
          {scanResult.qualityFeedback.map((fb, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-300">
              {fb.startsWith('✓') ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              )}
              <span>{fb.replace(/^✓\s*/, '')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Poor Quality Rejection Box */}
      {!isUsable && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Photo is too blurry or low quality.</p>
            <p>Please retake the photo with better focus and lighting to continue condition scanning.</p>
          </div>
        </div>
      )}

      {/* Passed Checks & Issues */}
      {isUsable && (
        <div className="space-y-3 pt-1">
          {scanResult.passedChecks && scanResult.passedChecks.length > 0 && (
            <div className="space-y-1 text-xs">
              {scanResult.passedChecks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{chk.replace(/^✓\s*/, '')}</span>
                </div>
              ))}
            </div>
          )}

          {scanResult.issues && scanResult.issues.length > 0 && (
            <ConditionIssueList issues={scanResult.issues} />
          )}
        </div>
      )}

      {/* Decision Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RETAKE PHOTO</span>
        </button>

        {isUsable && (
          <button
            type="button"
            onClick={onUsePhoto}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-bold shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Check className="w-4 h-4" />
            <span>USE PHOTO</span>
          </button>
        )}
      </div>

    </div>
  );
};
