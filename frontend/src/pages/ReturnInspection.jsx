import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, 
  Camera, ShieldCheck, AlertTriangle, Check, Layers, 
  User, Calendar, Clock, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { returnService } from '../services/returnService';
import { ProductCamera } from '../components/ProductCamera';
import { ConditionComparison } from '../components/ConditionComparison';
import { FinalConditionReport } from '../components/FinalConditionReport';

export const ReturnInspection = ({ orderId, onBack, onComplete }) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Return Inspection Camera State
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(null);

  // Damage Reporting Modal State
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await returnService.getReturnOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load return order:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load return details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run condition scan when >= 3 photos captured
  const handlePhotosUpdated = async (photos) => {
    setCapturedPhotos(photos);
    setErrorMessage(null);

    if (photos.length >= 3) {
      runReturnedScan(photos);
    } else {
      setInspectionResult(null);
    }
  };

  const runReturnedScan = async (photos) => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const res = await returnService.scanReturnedProduct(orderId, photos);
      setInspectionResult(res);
    } catch (err) {
      console.error('Returned scan error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to scan returned photos.');
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm Return Decision
  const handleConfirmReturn = async () => {
    if (!window.confirm('Confirm product return? This will restore the available quantity in the database.')) {
      return;
    }

    setIsSubmittingAction(true);
    setErrorMessage(null);

    try {
      const updated = await returnService.confirmReturn(orderId);
      setSuccessMessage('🎉 Return confirmed! Product quantity restored to inventory.');

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#3b82f6']
      });

      setTimeout(() => {
        if (onComplete) onComplete(updated);
      }, 1500);
    } catch (err) {
      console.error('Confirm return failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to confirm return.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Report Damage Decision
  const handleReportDamageSubmit = async (e) => {
    e.preventDefault();
    if (!damageDescription.trim()) {
      setErrorMessage('Please describe the detected damage.');
      return;
    }

    setIsSubmittingAction(true);
    setErrorMessage(null);

    try {
      const damagePayload = {
        description: damageDescription.trim(),
        returnedScore: inspectionResult?.returnedScan?.conditionScore || 70,
        detectedIssues: inspectionResult?.comparison?.newIssues?.map((i) => i.description) || [],
      };

      await returnService.reportDamage(orderId, damagePayload);
      setSuccessMessage('⚠️ Damage report submitted. Incident recorded for dispute review.');
      setShowDamageModal(false);

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } catch (err) {
      console.error('Damage report failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit damage report.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
          Order #{orderId}
        </span>
      </div>

      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Return Inspection &amp; Condition Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Inspect Returned Product
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Capture live camera photos of the returned item to run condition comparison before confirming inventory restoration.
        </p>
      </div>

      {/* Alerts */}
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
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading return order details...</p>
        </div>
      ) : order ? (
        <div className="space-y-6">
          
          {/* Order & Borrower Summary Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Product</span>
                <strong className="text-white text-sm block mt-0.5">{order.itemName}</strong>
                <span className="text-brand-400 text-[11px]">{order.category}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Borrower</span>
                <strong className="text-white text-sm block mt-0.5">{order.customerName}</strong>
                <span className="text-slate-400 text-[11px]">Phone: +91 {order.customerPhone}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Quantity Returned</span>
                <strong className="text-emerald-300 font-mono text-sm block mt-0.5">{order.quantity} unit(s)</strong>
                <span className="text-slate-400 text-[11px]">₹{order.rentAmount}/{order.rentDurationUnit}</span>
              </div>
            </div>

            {order.returnNote && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-200">Borrower's Return Note:</strong> "{order.returnNote}"
              </div>
            )}
          </div>

          {/* Section 2: Camera Capture of Returned Item */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Capture Returned Product Photos (3 to 5 Angles)
              </h2>
            </div>

            <ProductCamera
              itemName={order.itemName}
              category={order.category}
              capturedPhotos={capturedPhotos}
              onPhotosUpdated={handlePhotosUpdated}
              minPhotos={3}
              maxPhotos={5}
              disabled={isSubmittingAction}
            />
          </div>

          {/* Section 3: Condition Comparison Report */}
          {capturedPhotos.length >= 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Condition Comparison &amp; Surface Analysis
                </h2>
              </div>

              {isScanning ? (
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-white">Comparing returned condition with initial baseline...</p>
                </div>
              ) : inspectionResult ? (
                <div className="space-y-4">
                  {/* Side-by-Side Photo Comparison Gallery */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-400" />
                        <span>Side-by-Side Visual Comparison (Original vs Returned)</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">Comparing listing baseline with returned camera captures</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original Listing Photos Column */}
                      <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Original Listing Photos ({inspectionResult.originalImages?.length || 0})
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            Baseline
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {inspectionResult.originalImages && inspectionResult.originalImages.length > 0 ? (
                            inspectionResult.originalImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                                <img
                                  src={imgUrl}
                                  alt={`Original ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300';
                                  }}
                                />
                                <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-white px-1.5 py-0.5 rounded">
                                  Angle #{idx + 1}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-6 text-center text-xs text-slate-500 italic">
                              No original photos found on record
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Returned Product Photos Column */}
                      <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-brand-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Returned Photos ({inspectionResult.returnedImages?.length || capturedPhotos.length || 0})
                          </span>
                          <span className="text-[10px] text-brand-400 font-mono px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30">
                            Current Return
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {inspectionResult.returnedImages && inspectionResult.returnedImages.length > 0 ? (
                            inspectionResult.returnedImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-brand-500/30 bg-slate-950 group">
                                <img
                                  src={imgUrl}
                                  alt={`Returned ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    if (capturedPhotos[idx]?.previewUrl) {
                                      e.currentTarget.src = capturedPhotos[idx].previewUrl;
                                    }
                                  }}
                                />
                                <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-brand-300 px-1.5 py-0.5 rounded">
                                  Return #{idx + 1}
                                </span>
                              </div>
                            ))
                          ) : (
                            capturedPhotos.map((photo, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-brand-500/30 bg-slate-950 group">
                                <img
                                  src={photo.previewUrl}
                                  alt={`Captured ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-brand-300 px-1.5 py-0.5 rounded">
                                  {photo.angle || `Angle #${idx + 1}`}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ConditionComparison comparison={inspectionResult.comparison} />
                  
                  <FinalConditionReport
                    scanResult={inspectionResult.returnedScan}
                    itemName={order.itemName}
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Section 4: Owner Decision Actions */}
          {capturedPhotos.length >= 3 && inspectionResult && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Owner Return Decision</h2>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Confirming the return will update the order status to <strong>RETURN_CONFIRMED</strong> and restore <strong>{order.quantity} unit(s)</strong> back to your available inventory.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => setShowDamageModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>REPORT DAMAGE</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={handleConfirmReturn}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50"
                >
                  {isSubmittingAction ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>CONFIRM RETURN &amp; RESTORE QUANTITY (+{order.quantity})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      ) : null}

      {/* Damage Report Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Report Wear or Damage on Return</h3>
            </div>

            <p className="text-xs text-slate-300">
              Please describe the damage detected on <strong>{order?.itemName}</strong>. This will record a Damage Report and notify the borrower.
            </p>

            <form onSubmit={handleReportDamageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Damage Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe scratches, broken parts, dents, missing accessories, or operational failure..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDamageModal(false)}
                  disabled={isSubmittingAction}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAction || !damageDescription.trim()}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingAction ? 'Submitting...' : 'SUBMIT DAMAGE REPORT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
