import React from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, Cpu, 
  Sparkles, RefreshCw, AlertCircle 
} from 'lucide-react';
import { ConditionIssueList } from './ConditionIssueList';

export const FinalConditionReport = ({ scanResult, itemName = 'Product', onRescan }) => {
  if (!scanResult) return null;

  const {
    conditionScore = 85,
    conditionStatus = 'GOOD',
    confidenceScore = 90,
    hasDamage = false,
    scanResult: summaryText = '',
    positiveChecks = [],
    issues = [],
    limitations = [],
  } = scanResult;

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXCELLENT':
        return 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
      case 'GOOD':
        return 'from-brand-500 to-emerald-400 text-brand-300 border-brand-500/40 bg-brand-500/10';
      case 'FAIR':
        return 'from-amber-500 to-yellow-400 text-amber-300 border-amber-500/40 bg-amber-500/10';
      case 'POOR':
        return 'from-red-500 to-rose-400 text-red-300 border-red-500/40 bg-red-500/10';
      default:
        return 'from-slate-500 to-slate-400 text-slate-300 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 animate-fade-in shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>Multi-Angle Final Condition Report</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Condition Analysis for <span className="text-brand-400">{itemName}</span>
          </h2>
        </div>

        {onRescan && (
          <button
            type="button"
            onClick={onRescan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run Combined Scan</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Overall Condition Category */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getStatusColor(conditionStatus)}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
            Overall Condition
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight block">
              {conditionStatus}
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">
              {conditionStatus === 'EXCELLENT' && 'Score: 90-100 (Minimal wear)'}
              {conditionStatus === 'GOOD' && 'Score: 70-89 (Clean with minor use)'}
              {conditionStatus === 'FAIR' && 'Score: 40-69 (Noticeable wear)'}
              {conditionStatus === 'POOR' && 'Score: 0-39 (Heavy wear/defects)'}
            </span>
          </div>
        </div>

        {/* Condition Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Condition Score
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-brand-400 font-mono">
              {conditionScore}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        {/* Visual Confidence */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Scan Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {confidenceScore}%
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">Reliability</span>
          </div>
        </div>

      </div>

      {/* Summary Description */}
      {summaryText && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-1">AI Visual Summary:</strong>
          {summaryText}
        </div>
      )}

      {/* Positive Checks Grid */}
      {positiveChecks && positiveChecks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verified Physical Checks
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {positiveChecks.map((check, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{check.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Issues */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Detected Observations &amp; Surface Findings
        </h4>
        <ConditionIssueList issues={issues} />
      </div>

      {/* Limitations & Electronic Warning */}
      {limitations && limitations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs text-amber-200 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Important Assessment Limitations</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-[11px] text-amber-200/90 leading-relaxed">
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
