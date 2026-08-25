import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const KycStatusCard = ({ kycStatus = 'VERIFIED', trustScore = 100 }) => {
  const normalizedStatus = (kycStatus || 'VERIFIED').toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'VERIFIED':
        return {
          badge: 'KYC VERIFIED',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          title: 'Identity Verification Complete',
          description: 'Your Aadhaar document and Phone Number have been verified. You have full community borrowing & listing privileges.',
          borderClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'PENDING':
        return {
          badge: 'KYC PENDING',
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          title: 'Verification In Progress',
          description: 'Your uploaded identity documents are currently queued for verification. Some rental limits may apply.',
          borderClass: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'PROCESSING':
      case 'MANUAL_REVIEW':
        return {
          badge: 'UNDER REVIEW',
          icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
          title: 'Document Review Pending',
          description: 'Our verification engine is reviewing your details. We will notify you once completed.',
          borderClass: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'REJECTED':
        return {
          badge: 'KYC REJECTED',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'Verification Could Not Be Completed',
          description: 'Your document could not be validated. Please reach out to community support to resolve the issue.',
          borderClass: 'border-red-500/30 bg-red-500/10 text-red-200',
          badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
      default:
        return {
          badge: normalizedStatus,
          icon: <ShieldCheck className="w-5 h-5 text-brand-400" />,
          title: 'KYC Verification Status',
          description: 'Community identity verification status.',
          borderClass: 'border-slate-800 bg-slate-900/90 text-slate-300',
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-5 rounded-3xl border transition-all shadow-md ${config.borderClass}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-slate-950/60 border border-white/10 flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-tight">{config.title}</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${config.badgeClass}`}>
                {config.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
              {config.description}
            </p>
          </div>
        </div>

        {/* Community Trust Score pill */}
        <div className="self-end sm:self-center px-3.5 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center flex-shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trust Score</span>
          <span className="text-sm font-black text-amber-300 font-mono">{trustScore}%</span>
        </div>

      </div>
    </div>
  );
};
