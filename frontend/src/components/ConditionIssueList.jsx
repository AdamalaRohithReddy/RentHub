import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export const ConditionIssueList = ({ issues = [] }) => {
  if (!issues || issues.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>No visible physical damage or defects detected in uploaded photos.</span>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            High Severity
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Medium Severity
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Minor / Low
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-2">
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
            issue.severity === 'HIGH'
              ? 'bg-red-500/10 border-red-500/30 text-red-200'
              : issue.severity === 'MEDIUM'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : issue.severity === 'LOW'
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {issue.severity === 'HIGH' ? (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            ) : issue.severity === 'MEDIUM' || issue.severity === 'LOW' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-medium">{issue.description}</span>
          </div>

          <div>{getSeverityBadge(issue.severity)}</div>
        </div>
      ))}
    </div>
  );
};
