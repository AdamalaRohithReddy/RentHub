import React from 'react';
import { 
  ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, 
  TrendingDown, TrendingUp, Sparkles 
} from 'lucide-react';
import { ConditionIssueList } from './ConditionIssueList';

export const ConditionComparison = ({ comparison }) => {
  if (!comparison) return null;

  const {
    previousCondition = 'EXCELLENT',
    previousScore = 95,
    currentCondition = 'GOOD',
    currentScore = 82,
    scoreDifference = -13,
    newIssuesDetected = false,
    newIssues = [],
    existingIssues = [],
    summary = ''
  } = comparison;

  const isDegraded = scoreDifference < 0;

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 animate-fade-in shadow-xl">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Return Condition Comparison
        </h3>
        
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1 ${
          isDegraded
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {isDegraded ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          <span>{scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference} points</span>
        </span>
      </div>

      {/* Comparison Score Boards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Previous Condition */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Previous Condition (Listing/Pre-Rental)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-200">{previousCondition}</span>
            <span className="text-sm font-mono text-slate-400">({previousScore}/100)</span>
          </div>
        </div>

        {/* Returned Condition */}
        <div className={`p-4 rounded-2xl border space-y-1 ${
          isDegraded
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            Returned Condition (Inspected)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{currentCondition}</span>
            <span className="text-sm font-mono opacity-90 font-bold">({currentScore}/100)</span>
          </div>
        </div>

      </div>

      {/* Summary Note */}
      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong>Observation:</strong> {summary}
        </div>
      )}

      {/* New Issues Detected Warning */}
      {newIssuesDetected && newIssues.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>New Surface Changes / Issues Detected on Return</span>
          </div>
          <ConditionIssueList issues={newIssues} />
        </div>
      )}

      {/* Existing Issues */}
      {existingIssues.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Pre-Existing Wear (Previously Disclosed)
          </span>
          <ConditionIssueList issues={existingIssues} />
        </div>
      )}

    </div>
  );
};
