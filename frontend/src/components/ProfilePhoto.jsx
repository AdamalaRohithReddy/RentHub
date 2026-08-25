import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { CameraPreview } from './CameraPreview';
import { userService } from '../services/userService';

export const ProfilePhoto = ({ 
  profileImageUrl, 
  fullName = 'User', 
  size = 'lg', 
  editable = false, 
  onPhotoUpdated 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Size styling map
  const sizeMap = {
    sm: 'w-10 h-10 text-base',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl',
    xl: 'w-32 h-32 sm:w-36 sm:h-36 text-4xl sm:text-5xl',
  };

  const initial = (fullName && fullName.trim().length > 0)
    ? fullName.trim().charAt(0).toUpperCase()
    : 'U';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit.');
      return;
    }

    await uploadFile(file);
  };

  const handleCameraCapture = async (file, previewUrl) => {
    setIsCameraActive(false);
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const updatedUser = await userService.uploadProfilePhoto(file);
      setIsModalOpen(false);
      if (onPhotoUpdated) {
        onPhotoUpdated(updatedUser);
      }
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      
      {/* Avatar Container */}
      <div className={`relative rounded-full overflow-hidden border-2 border-brand-500/40 shadow-glow bg-gradient-to-br from-brand-600 via-teal-700 to-slate-900 flex items-center justify-center font-black text-white select-none ${sizeMap[size] || sizeMap.lg}`}>
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={fullName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initial if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* Editable Change Photo Button */}
      {editable && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg border-2 border-slate-950 transition-transform hover:scale-110"
          title="Change Profile Photo"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}

      {/* Photo Selection / Camera Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-brand-500/30 max-w-md w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Change Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsCameraActive(false);
                  setErrorMessage(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isUploading && (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-brand-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">Uploading profile photo to server...</p>
              </div>
            )}

            {!isUploading && !isCameraActive && (
              <div className="space-y-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Option 1: File Picker */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all"
                >
                  <Upload className="w-4 h-4 text-brand-400" />
                  <span>Choose from Device / Gallery</span>
                </button>

                {/* Option 2: Live Camera Capture */}
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-bold shadow-glow transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Live Camera Selfie / Photo</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center pt-1">
                  Supported formats: JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            )}

            {/* Live Camera Viewfinder */}
            {isCameraActive && !isUploading && (
              <div className="space-y-3">
                <CameraPreview
                  targetAngle="Profile Avatar"
                  onCapture={handleCameraCapture}
                  onClose={() => setIsCameraActive(false)}
                />
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
