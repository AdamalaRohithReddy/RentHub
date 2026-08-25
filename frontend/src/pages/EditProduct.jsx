import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, 
  Save, Package, Tag, FileText, IndianRupee, Layers, 
  Clock, MapPin, Check 
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { ProductPhotoManager } from '../components/ProductPhotoManager';

const CATEGORIES = [
  'Power & Hand Tools',
  'Kitchen & Appliances',
  'Outdoor & Camping',
  'Electronics & AV',
  'Books & Learning',
  'Board Games & Sports',
  'Gardening & Lawn',
  'Baby & Kids Gear',
  'Event & Party Equipment',
  'Other'
];

const DURATION_UNITS = [
  { id: 'Per Hour', label: 'Per Hour (₹/hr)' },
  { id: 'Per Day', label: 'Per Day (₹/day)' },
  { id: 'Per Week', label: 'Per Week (₹/week)' },
];

export const EditProduct = ({ productId, onBack, onSaved }) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form Fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentDurationUnit, setRentDurationUnit] = useState('Per Day');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [status, setStatus] = useState('AVAILABLE');
  const [pickupMethod, setPickupMethod] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [returnInstructions, setReturnInstructions] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await resourceService.getResourceById(productId);
      setProduct(data);
      setItemName(data.itemName || '');
      setCategory(data.category || 'Power & Hand Tools');
      setDescription(data.description || '');
      setRentAmount(data.rentAmount ? String(data.rentAmount) : '0');
      setRentDurationUnit(data.rentDurationUnit || 'Per Day');
      setSecurityDeposit(data.securityDeposit ? String(data.securityDeposit) : '0');
      setTotalQuantity(data.totalQuantity ? String(data.totalQuantity) : (data.availableQuantity ? String(data.availableQuantity) : '1'));
      setStatus(data.status || 'AVAILABLE');
      setPickupMethod(data.pickupMethod || 'In-Person Handover');
      setPickupLocation(data.pickupLocation || '');
      setPickupInstructions(data.pickupInstructions || '');
      setReturnInstructions(data.returnInstructions || '');
      setImages(data.images || []);
    } catch (err) {
      console.error('Failed to load product:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesUpdated = (newImages) => {
    setImages(newImages);
    setSuccessMessage('✓ Photos updated successfully.');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const totalQtyNum = Number(totalQuantity);
    const rentedQty = product?.rentedQuantity || 0;

    if (totalQtyNum < rentedQty) {
      setErrorMessage(`Total quantity cannot be less than the quantity currently rented (${rentedQty}).`);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        itemName: itemName.trim(),
        category: category.trim(),
        description: description.trim(),
        rentAmount: Number(rentAmount),
        rentDurationUnit: rentDurationUnit.trim(),
        securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
        totalQuantity: totalQtyNum,
        status: status.trim(),
        pickupMethod: pickupMethod.trim(),
        pickupLocation: pickupLocation.trim(),
        pickupInstructions: pickupInstructions.trim(),
        returnInstructions: returnInstructions.trim(),
      };

      const updated = await resourceService.updateResource(productId, payload);
      setSuccessMessage('✓ Product details updated successfully!');
      setProduct(updated);

      if (onSaved) {
        setTimeout(() => onSaved(updated), 800);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const rentedQty = product?.rentedQuantity || 0;
  const currentTotal = Number(totalQuantity) || 1;
  const calculatedAvailable = Math.max(0, currentTotal - rentedQty);

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
          <span>Back to My Products</span>
        </button>

        <div className="text-xs text-slate-400 font-mono">
          Product ID: #{productId}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Edit Product: <span className="text-brand-400">{itemName || 'Loading...'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update rental pricing, quantity rules, instructions, and manage camera photos.
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
          <p className="text-sm font-semibold text-slate-300">Loading product...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveChanges} className="space-y-6">
          
          {/* Section 1: Basic Details */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              1. Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Item Name <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Category <span className="text-brand-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Description <span className="text-brand-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Quantities */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              2. Quantities &amp; Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Total Quantity <span className="text-brand-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={Math.max(1, rentedQty)}
                  step="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Cannot be less than currently rented ({rentedQty}).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Rent Amount (₹) <span className="text-brand-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* Live Quantity Breakdown Display */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Units</span>
                <strong className="text-white font-mono text-base">{currentTotal}</strong>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase block">Calculated Available</span>
                <strong className="text-emerald-300 font-mono text-base">{calculatedAvailable}</strong>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase block">Currently Rented</span>
                <strong className="text-amber-300 font-mono text-base">{rentedQty}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Photo Management */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
            <ProductPhotoManager
              productId={productId}
              images={images}
              onImagesUpdated={handleImagesUpdated}
              disabled={isSaving}
            />
          </div>

          {/* Section 4: Pickup & Return Instructions */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              3. Pickup &amp; Return Instructions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pickup Location <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pickup Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring doorbell at Gate B, ID required"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Return Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Clean the equipment before returning. Return to porch drop-box by 6 PM."
                value={returnInstructions}
                onChange={(e) => setReturnInstructions(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white"
              />
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
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
