import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, AlertCircle, LogOut, ArrowLeft, ShieldCheck, 
  CheckCircle2, Sparkles, User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { ProfileHeader } from '../components/ProfileHeader';
import { KycStatusCard } from '../components/KycStatusCard';
import { ProfileStatistics } from '../components/ProfileStatistics';
import { AccountDetails } from '../components/AccountDetails';
import { ProfileQuickActions } from '../components/ProfileQuickActions';

export const Profile = ({ 
  onNavigateToHome, 
  onNavigateToEdit, 
  onNavigateToMyProducts, 
  onNavigateToMyOrders, 
  onNavigateToRequestsReceived, 
  onNavigateToGiveForRent,
  onNavigateToLogin 
}) => {
  const { user: authUser, logoutUser, updateUserInState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  const loadProfileAndStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [profileData, statsData] = await Promise.all([
        userService.getProfile(),
        userService.getProfileStatistics(),
      ]);

      setProfile(profileData);
      setStatistics(statsData);

      // Keep AuthContext in sync if needed
      if (updateUserInState && profileData) {
        updateUserInState(profileData);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load user profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
    if (updateUserInState && updatedProfile) {
      updateUserInState(updatedProfile);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of RentHub?')) {
      logoutUser();
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onNavigateToHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          type="button"
          onClick={loadProfileAndStats}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-all"
          title="Refresh Profile"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={loadProfileAndStats}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading user profile &amp; activity...</p>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          
          {/* 1. Profile Header with Photo & Quick Edit */}
          <ProfileHeader
            user={profile}
            onNavigateToEdit={onNavigateToEdit}
            onPhotoUpdated={handlePhotoUpdated}
          />

          {/* 2. KYC Verification Status Card */}
          <KycStatusCard
            kycStatus={profile.kycStatus}
            trustScore={profile.trustScore}
          />

          {/* 3. Live Resource & Activity Statistics */}
          <ProfileStatistics statistics={statistics} />

          {/* 4. Complete Account & Location Details */}
          <AccountDetails user={profile} />

          {/* 5. Quick Actions & Navigation Shortcuts */}
          <ProfileQuickActions
            onNavigateToMyProducts={onNavigateToMyProducts}
            onNavigateToMyOrders={onNavigateToMyOrders}
            onNavigateToRequestsReceived={onNavigateToRequestsReceived}
            onNavigateToGiveForRent={onNavigateToGiveForRent}
          />

          {/* 6. Logout Section */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Account Session</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <strong className="text-slate-300">{profile.email}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all self-stretch sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>[ 🚪 LOGOUT ]</span>
            </button>
          </div>

        </div>
      ) : null}

    </div>
  );
};
