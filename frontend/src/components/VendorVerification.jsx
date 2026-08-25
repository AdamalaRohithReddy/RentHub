import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare, Square, CheckCircle2, AlertCircle } from 'lucide-react';

export const VendorVerification = ({ onVerificationChange, isElectronic = false }) => {
  const [checklist, setChecklist] = useState({
    capturedLive: false,
    accurateImages: false,
    disclosedDefects: false,
    detailsAccurate: false,
    workingCondition: !isElectronic, // Default true if not electronic, otherwise required
  });

  // Re-sync when isElectronic changes
  useEffect(() => {
    setChecklist((prev) => ({
      ...prev,
      workingCondition: isElectronic ? prev.workingCondition : true,
    }));
  }, [isElectronic]);

  const allChecked = Object.values(checklist).every(Boolean);

  useEffect(() => {
    onVerificationChange(allChecked);
  }, [checklist, allChecked, onVerificationChange]);

  const handleToggle = (key) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allChecked;
    setChecklist({
      capturedLive: nextState,
      accurateImages: nextState,
      disclosedDefects: nextState,
      detailsAccurate: nextState,
      workingCondition: nextState,
    });
  };

  const items = [
    {
      key: 'capturedLive',
      label: 'The product photos were captured live with my device camera during this listing process.',
    },
    {
      key: 'accurateImages',
      label: 'The photos accurately represent the authentic, current physical state of the product.',
    },
    {
      key: 'disclosedDefects',
      label: 'I have disclosed any known cosmetic wear, scratches, or defects in the description.',
    },
    {
      key: 'detailsAccurate',
      label: 'The item details, quantity, and rental pricing entered are accurate.',
    },
  ];

  if (isElectronic) {
    items.push({
      key: 'workingCondition',
      label: 'I confirm that the electronic device powers on and all internal components (battery, sound, buttons, connectivity) work properly.',
    });
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 animate-fade-in">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vendor Verification Checklist</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Confirm Product Condition &amp; Live Capture
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            To ensure neighborhood trust, all affirmations must be verified prior to publishing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-900"
        >
          {allChecked ? 'Uncheck All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const checked = checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                checked
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                )}
              </div>
              <span className="text-xs font-medium leading-relaxed">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {!allChecked && (
        <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Please check all verification items above to enable the final listing submission button.</span>
        </div>
      )}
    </div>
  );
};
