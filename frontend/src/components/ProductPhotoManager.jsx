import React, { useState } from 'react';
import { Camera, Trash2, Plus, AlertCircle, RefreshCw, X, Check } from 'lucide-react';
import { CameraPreview } from './CameraPreview';
import { resourceService } from '../services/resourceService';

export const ProductPhotoManager = ({ productId, images = [], onImagesUpdated, disabled = false }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCaptureNewPhoto = async (file, previewUrl) => {
    setIsCameraOpen(false);
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const updated = await resourceService.addProductImage(productId, file);
      if (updated && updated.images) {
        onImagesUpdated(updated.images);
      }
    } catch (err) {
      console.error('Failed to add photo:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to upload captured photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (imageId) => {
    if (images.length <= 1) {
      setErrorMessage('Your product must have at least 1 photo.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setIsDeletingId(imageId);
    setErrorMessage(null);

    try {
      const updated = await resourceService.deleteProductImage(productId, imageId);
      if (updated && updated.images) {
        onImagesUpdated(updated.images);
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to delete photo.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Photos ({images.length}/5)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Capture new photos via camera or delete existing photos (Min 1, Max 5).
          </p>
        </div>

        {images.length < 5 && !disabled && !isCameraOpen && (
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-bold shadow-glow transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📷 ADD NEW PHOTO</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300">Camera Live Capture</span>
            <button
              type="button"
              onClick={() => setIsCameraOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <CameraPreview
            targetAngle="New Angle"
            onCapture={handleCaptureNewPhoto}
            onClose={() => setIsCameraOpen(false)}
          />
        </div>
      )}

      {isUploading && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs text-brand-300">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
          <span>Saving camera photo to server &amp; updating MySQL database...</span>
        </div>
      )}

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-32 shadow-sm"
          >
            <img
              src={img.imageUrl}
              alt={`Product photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-slate-900/90 text-brand-300 border border-brand-500/30 px-1.5 py-0.5 rounded shadow">
              {idx === 0 ? 'Primary' : `Photo ${idx + 1}`}
            </span>

            {!disabled && images.length > 1 && (
              <button
                type="button"
                disabled={isDeletingId === img.id}
                onClick={() => handleDeletePhoto(img.id)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-md transition-transform group-hover:scale-110 disabled:opacity-50"
                title="Delete photo"
              >
                {isDeletingId === img.id ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
