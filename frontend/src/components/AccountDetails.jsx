import React from 'react';
import { User, Mail, Phone, MapPin, Building, Globe, Hash, Calendar, ShieldCheck } from 'lucide-react';

export const AccountDetails = ({ user }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '25 August 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '25 August 2026';
    }
  };

  const fields = [
    {
      label: 'Full Name',
      value: user.fullName || 'Not Provided',
      icon: <User className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'Email Address',
      value: user.email || 'Not Provided',
      icon: <Mail className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'Phone Number',
      value: `+91 ${user.phone || user.phoneNumber || ''}`,
      badge: 'OTP VERIFIED ✓',
      icon: <Phone className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Address',
      value: user.address || 'Not Set (Click Edit Profile)',
      icon: <MapPin className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'City',
      value: user.city || 'Not Set',
      icon: <Building className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'State',
      value: user.state || 'Not Set',
      icon: <Globe className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'Pincode',
      value: user.pincode || 'Not Set',
      icon: <Hash className="w-4 h-4 text-brand-400" />,
    },
    {
      label: 'Member Since',
      value: formatDate(user.createdAt),
      icon: <Calendar className="w-4 h-4 text-brand-400" />,
    },
  ];

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Account &amp; Location Details
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">User ID: #{user.id}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {f.icon}
                <span>{f.label}</span>
              </div>
              {f.badge && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {f.badge}
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-white tracking-tight break-words pt-0.5">
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
