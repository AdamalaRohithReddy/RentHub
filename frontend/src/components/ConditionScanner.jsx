import React, { useState, useEffect } from 'react';
import { Sparkles, Scan, RefreshCw, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export const ConditionScanner = ({ isScanning, onStartScan, canScan }) => {
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const SCAN_STEPS = [
    'Initializing AI Vision scanner...',
    'Analyzing image resolution and color variance...',
    'Inspecting surface texture, seams, and edges...',
    'Checking for cracks, scratches, dents, and wear...',
    'Compiling visible condition report and confidence score...',
  ];

  useEffect(() => {
    let interval;
    if (isScanning) {
      setScanStepIndex(0);
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden space-y-6">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Physical Condition Scanner</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Scan &amp; Estimate Visible Product Condition
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Our vision analysis models inspect your uploaded photos to detect visible wear, scratches, cracks, or dents, generating a trusted condition report.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartScan}
          disabled={!canScan || isScanning}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all tracking-wide flex-shrink-0"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Photos...</span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              <span>SCAN PRODUCT CONDITION</span>
            </>
          )}
        </button>
      </div>

      {/* Scanning Active Radar Animation */}
      {isScanning && (
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-brand-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 animate-ping absolute" />
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-glow">
                  <Scan className="w-4 h-4 animate-spin-slow" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Vision Scanner Active</p>
                <p className="text-[11px] text-brand-300 font-mono">{SCAN_STEPS[scanStepIndex]}</p>
              </div>
            </div>

            <span className="text-xs font-bold text-brand-400 font-mono">
              {Math.min(100, Math.round(((scanStepIndex + 1) / SCAN_STEPS.length) * 100))}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
