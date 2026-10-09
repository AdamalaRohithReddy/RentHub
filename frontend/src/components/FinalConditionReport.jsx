import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, Cpu, 
  Sparkles, RefreshCw, AlertCircle, Edit3, Sliders, CheckSquare, MessageSquare
} from 'lucide-react';
import { ConditionIssueList } from './ConditionIssueList';

const ISSUE_OPTIONS = [
  { id: 'NO_MAJOR_DAMAGE', label: 'No Major Damage' },
  { id: 'MINOR_SCRATCH', label: 'Minor Scratches / Surface Wear' },
  { id: 'MAJOR_SCRATCH', label: 'Deep Scratches / Paint Chips' },
  { id: 'DENT_DETECTED', label: 'Body Dent / Bend' },
  { id: 'CRACK_DETECTED', label: 'Casing or Glass Crack' },
  { id: 'RUST_DETECTED', label: 'Surface Rust / Oxidation' },
  { id: 'STAIN_DETECTED', label: 'Fabric / Material Stain' },
  { id: 'BROKEN_PART', label: 'Loose or Broken Part' },
];

export const FinalConditionReport = ({ 
  scanResult, 
  itemName = 'Product', 
  onRescan,
  onConditionAdjusted 
}) => {
  if (!scanResult) return null;

  const {
    conditionScore: initialScore = 85,
    conditionStatus: initialStatus = 'GOOD',
    confidenceScore = 90,
    hasDamage = false,
    scanResult: summaryText = '',
    positiveChecks = [],
    issues = [],
    limitations = [],
  } = scanResult;

  // Owner Review & Override State
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedScore, setSelectedScore] = useState(initialScore);
  const [selectedIssues, setSelectedIssues] = useState(
    issues.length > 0 ? issues.map(i => i.issueType) : ['NO_MAJOR_DAMAGE']
  );
  const [ownerNotes, setOwnerNotes] = useState('');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setSelectedStatus(initialStatus);
    setSelectedScore(initialScore);
    const initialIssueList = issues.length > 0 ? issues.map(i => i.issueType) : ['NO_MAJOR_DAMAGE'];
    setSelectedIssues(initialIssueList);
    setIsModified(false);
    if (onConditionAdjusted) {
      onConditionAdjusted({
        conditionStatus: initialStatus,
        conditionScore: initialScore,
        detectedIssues: initialIssueList,
        ownerNotes: '',
        isOverridden: false
      });
    }
  }, [scanResult]);

  const notifyChange = (status, score, issuesList, notes, modified) => {
    if (onConditionAdjusted) {
      onConditionAdjusted({
        conditionStatus: status,
        conditionScore: score,
        detectedIssues: issuesList,
        ownerNotes: notes,
        isOverridden: modified
      });
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    let defaultScore = selectedScore;
    if (status === 'EXCELLENT' && selectedScore < 90) defaultScore = 95;
    else if (status === 'GOOD' && (selectedScore < 70 || selectedScore >= 90)) defaultScore = 80;
    else if (status === 'FAIR' && (selectedScore < 40 || selectedScore >= 70)) defaultScore = 55;
    else if (status === 'POOR' && selectedScore >= 40) defaultScore = 30;
    setSelectedScore(defaultScore);
    setIsModified(true);
    notifyChange(status, defaultScore, selectedIssues, ownerNotes, true);
  };

  const handleScoreChange = (score) => {
    const val = parseInt(score, 10);
    setSelectedScore(val);
    let status = selectedStatus;
    if (val >= 90) status = 'EXCELLENT';
    else if (val >= 70) status = 'GOOD';
    else if (val >= 40) status = 'FAIR';
    else status = 'POOR';
    setSelectedStatus(status);
    setIsModified(true);
    notifyChange(status, val, selectedIssues, ownerNotes, true);
  };

  const handleIssueToggle = (issueId) => {
    let updated;
    if (issueId === 'NO_MAJOR_DAMAGE') {
      updated = ['NO_MAJOR_DAMAGE'];
    } else {
      const filtered = selectedIssues.filter(i => i !== 'NO_MAJOR_DAMAGE');
      if (filtered.includes(issueId)) {
        updated = filtered.filter(i => i !== issueId);
        if (updated.length === 0) updated = ['NO_MAJOR_DAMAGE'];
      } else {
        updated = [...filtered, issueId];
      }
    }
    setSelectedIssues(updated);
    setIsModified(true);
    notifyChange(selectedStatus, selectedScore, updated, ownerNotes, true);
  };

  const handleNotesChange = (text) => {
    setOwnerNotes(text);
    setIsModified(true);
    notifyChange(selectedStatus, selectedScore, selectedIssues, text, true);
  };

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
            <span>Multi-Angle Condition Assessment</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Condition Analysis for <span className="text-brand-400">{itemName}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated heuristic baseline with owner verification and transparent review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRescan && (
            <button
              type="button"
              onClick={onRescan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-scan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setReviewMode(!reviewMode)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              reviewMode 
                ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/20' 
                : 'bg-slate-900 border-slate-700 text-brand-300 hover:text-brand-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{reviewMode ? 'Hide Review Panel' : 'Owner Review & Adjust'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Overall Condition Category */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getStatusColor(selectedStatus)}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
              Overall Condition
            </span>
            {isModified && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-200 text-[10px] font-semibold border border-brand-500/40">
                Owner Verified
              </span>
            )}
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight block">
              {selectedStatus}
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">
              {selectedStatus === 'EXCELLENT' && 'Score: 90-100 (Minimal to no wear)'}
              {selectedStatus === 'GOOD' && 'Score: 70-89 (Clean with minor use)'}
              {selectedStatus === 'FAIR' && 'Score: 40-69 (Noticeable surface wear)'}
              {selectedStatus === 'POOR' && 'Score: 0-39 (Heavy wear or defects)'}
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
              {selectedScore}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        {/* Visual Confidence */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Assessment Reliability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {confidenceScore}%
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">Photo Confidence</span>
          </div>
        </div>

      </div>

      {/* Owner Review & Correction Panel (Interactive) */}
      {reviewMode && (
        <div className="p-5 rounded-2xl bg-brand-950/20 border border-brand-500/30 space-y-4 animate-scale-in">
          <div className="flex items-center gap-2 text-brand-300 font-bold text-sm">
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>Owner Review &amp; Condition Calibration</span>
          </div>
          <p className="text-xs text-slate-300">
            As the product owner, verify or calibrate the automated assessment based on your physical inspection.
          </p>

          {/* Condition Category Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Condition Grade:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map(grade => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleStatusChange(grade)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedStatus === grade
                      ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/30'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Score Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <label className="font-semibold text-slate-300">Condition Score Rating:</label>
              <span className="font-mono text-brand-400 font-bold text-sm">{selectedScore} / 100</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={selectedScore}
              onChange={(e) => handleScoreChange(e.target.value)}
              className="w-full accent-brand-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Observed Issues Multi-Select */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Surface Wear &amp; Damage Findings:
            </label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_OPTIONS.map(opt => {
                const active = selectedIssues.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleIssueToggle(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? opt.id === 'NO_MAJOR_DAMAGE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owner Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Owner Physical Notes &amp; Specific Wear Disclosures:
            </label>
            <textarea
              rows="2"
              value={ownerNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g., Clean condition, lightly used on weekends. Includes original carrying case."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Summary Description */}
      {summaryText && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-1">Automated Visual Analysis:</strong>
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
