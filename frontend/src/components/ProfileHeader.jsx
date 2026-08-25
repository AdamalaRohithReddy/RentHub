import React from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit3, 
  ShieldCheck, Sparkles, CheckCircle2 
} from 'lucide-react';
import { ProfilePhoto } from './ProfilePhoto';

export const ProfileHeader = ({ user, onNavigateToEdit, onPhotoUpdated }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'August 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'August 2026';
    }
  };

  const locationText = [user.city, user.state].filter(Boolean).join(', ') || user.address || 'Location Not Specified';

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Background Subtle Gradient Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
        
        {/* Left Side: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          
          <ProfilePhoto
            profileImageUrl={user.profileImageUrl}
            fullName={user.fullName}
            size="lg"
            editable={true}
            onPhotoUpdated={onPhotoUpdated}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.fullName || 'RentHub Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Verified Neighbor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{user.email}</span>
              </div>

              <span className="hidden sm:inline text-slate-700">•</span>

              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 {user.phone || user.phoneNumber}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{locationText}</span>
              </div>

              <span className="hidden sm:inline text-slate-700">•</span>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Member Since {formatDate(user.createdAt)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Edit Profile Action */}
        <button
          type="button"
          onClick={onNavigateToEdit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold shadow-md transition-all self-stretch sm:self-auto justify-center"
        >
          <Edit3 className="w-4 h-4 text-brand-400" />
          <span>[ ✏️ EDIT PROFILE ]</span>
        </button>

      </div>

    </div>
  );
};
