import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles, SwitchCamera } from 'lucide-react';

export const CameraPreview = ({ onCapture, onClose, targetAngle = 'Front' }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back camera) or 'user' (front)
  const [hasPermission, setHasPermission] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use a modern browser with HTTPS/localhost.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings to capture product photos.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device found on this system.');
      } else {
        setErrorMessage(err.message || 'Could not start camera stream.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMessage('Failed to capture frame from camera stream.');
          return;
        }

        const fileName = `camera_photo_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);

        stopCamera();
        onCapture(file, previewUrl);
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl p-4 sm:p-6 space-y-4 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Camera Capture</h3>
            <p className="text-[11px] text-brand-300">
              Angle: <strong>{targetAngle}</strong> • Center the product in good lighting
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Camera"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Camera Access Failed</p>
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={startCamera}
              className="mt-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs font-semibold"
            >
              Retry Camera Access
            </button>
          </div>
        </div>
      )}

      {/* Video Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
        
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/90 z-20 text-xs text-slate-400">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
            <span>Connecting to camera hardware...</span>
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder Target Overlay Guide */}
        <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            Align {targetAngle} View Here
          </span>
        </div>

        {/* Switch Camera Button on Video */}
        <button
          type="button"
          onClick={handleSwitchCamera}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md z-10"
          title="Switch Camera (Front/Back)"
        >
          <SwitchCamera className="w-4 h-4" />
        </button>
      </div>

      {/* Capture Control Button */}
      <div className="flex items-center justify-center pt-2">
        <button
          type="button"
          disabled={!hasPermission || isInitializing}
          onClick={handleCaptureFrame}
          className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span>CAPTURE PHOTO</span>
        </button>
      </div>

    </div>
  );
};
