import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle2, 
  User, Mail, Phone, MapPin, Building, Globe, Hash, Lock, ShieldCheck 
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { ProfilePhoto } from '../components/ProfilePhoto';

export const EditProfile = ({ onBack, onSaved }) => {
  const { updateUserInState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form State
  const [profileData, setProfileData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await userService.getProfile();
      setProfileData(data);
      setFullName(data.fullName || '');
      setEmail(data.email || '');
      setPhoneNumber(data.phone || data.phoneNumber || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setPincode(data.pincode || '');
      setProfileImageUrl(data.profileImageUrl || '');
    } catch (err) {
      console.error('Failed to load profile for editing:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load profile information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpdated = (updated) => {
    setProfileImageUrl(updated.profileImageUrl || '');
    setProfileData(updated);
    if (updateUserInState) {
      updateUserInState(updated);
    }
    setSuccessMessage('✓ Profile photo updated successfully!');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      const updated = await userService.updateProfile(payload);
      setProfileData(updated);
      setSuccessMessage('✓ Profile details saved successfully!');

      if (updateUserInState) {
        updateUserInState(updated);
      }

      setTimeout(() => {
        if (onSaved) onSaved(updated);
      }, 700);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Edit Profile
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Edit Profile Information
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update your personal information, address, and profile photo.
        </p>
      </div>

      {/* Error & Success Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading profile data...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Section 1: Profile Photo */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
            <ProfilePhoto
              profileImageUrl={profileImageUrl}
              fullName={fullName}
              size="xl"
              editable={true}
              onPhotoUpdated={handlePhotoUpdated}
            />

            <div className="text-center sm:text-left space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Profile Photo
              </h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Click the camera button on your avatar to upload an image from your device or take a live photo.
              </p>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              1. Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohith Kumar"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number (Read-Only Safeguard) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phone Number (OTP Verified)
                </label>
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Non-Editable</span>
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  disabled
                  value={`+91 ${phoneNumber}`}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-emerald-400 font-mono cursor-not-allowed opacity-80"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Phone number is verified through SMS OTP during registration and cannot be modified directly.
              </p>
            </div>
          </div>

          {/* Section 3: Location & Address */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              2. Address &amp; Location
            </h2>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Street / Area Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Green Valley Apartments, Madhapur"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  City
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  State
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    maxLength={10}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 500081"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onBack}
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE PROFILE CHANGES</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
