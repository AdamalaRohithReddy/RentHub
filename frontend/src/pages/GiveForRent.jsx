import React, { useState } from 'react';
import { 
  PackagePlus, Upload, X, AlertCircle, CheckCircle2, 
  ArrowLeft, Tag, Calendar, MapPin, DollarSign, Clock, FileText, 
  Sparkles, RefreshCw, Image as ImageIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './GiveForRent.css';

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

const PICKUP_METHODS = [
  'In-Person Handover',
  'Contactless Porch Box',
  'Community Locker',
  'Flexible / Mutual Agreement'
];

export const GiveForRent = ({ onNavigateToHome }) => {
  const { user } = useAuth();

  // Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Power & Hand Tools');
  const [description, setDescription] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentDurationUnit, setRentDurationUnit] = useState('Per Day');
  const [securityDeposit, setSecurityDeposit] = useState('');
  
  // Default available from today to next 30 days
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [availableFrom, setAvailableFrom] = useState(todayStr);
  const [availableUntil, setAvailableUntil] = useState(nextMonthStr);
  
  const [pickupMethod, setPickupMethod] = useState('In-Person Handover');
  const [pickupLocation, setPickupLocation] = useState('');

  // Multiple Images State (Min 1, Max 5)
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle Multiple Image Selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check Total Images Constraint (Max 5)
    if (selectedImages.length + files.length > 5) {
      setErrorMessage('You can upload a maximum of 5 images per product.');
      return;
    }

    const validNewImages = [];
    const validNewPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" is not a valid image file. Please upload JPG, PNG, or WEBP images.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }

      validNewImages.push(file);
      validNewPreviews.push(URL.createObjectURL(file));
    }

    setSelectedImages((prev) => [...prev, ...validNewImages]);
    setImagePreviews((prev) => [...prev, ...validNewPreviews]);
    setErrorMessage(null);
  };

  // Remove a selected image
  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validations
    if (!itemName.trim()) {
      setErrorMessage('Item Name is required.');
      return;
    }
    if (!category.trim()) {
      setErrorMessage('Category is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (!rentAmount || Number(rentAmount) < 0) {
      setErrorMessage('Please enter a valid Rent Amount (>= 0).');
      return;
    }
    if (!availableFrom || !availableUntil) {
      setErrorMessage('Available From and Available Until dates are required.');
      return;
    }
    if (new Date(availableUntil) < new Date(availableFrom)) {
      setErrorMessage('Available Until date cannot be earlier than Available From date.');
      return;
    }
    if (!pickupLocation.trim()) {
      setErrorMessage('Pickup Location is required.');
      return;
    }
    if (selectedImages.length === 0) {
      setErrorMessage('Please upload at least 1 product image.');
      return;
    }
    if (selectedImages.length > 5) {
      setErrorMessage('Maximum 5 images allowed.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('itemName', itemName.trim());
      formData.append('category', category.trim());
      formData.append('description', description.trim());
      formData.append('rentAmount', rentAmount);
      formData.append('rentDurationUnit', rentDurationUnit);
      formData.append('securityDeposit', securityDeposit ? securityDeposit : '0');
      formData.append('availableFrom', availableFrom);
      formData.append('availableUntil', availableUntil);
      formData.append('pickupMethod', pickupMethod.trim());
      formData.append('pickupLocation', pickupLocation.trim());

      // Append all multiple images
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.createResource(formData);

      if (response.status === 201 || response.data) {
        setSuccessMessage(`🎉 "${itemName}" has been successfully listed for rent!`);
        
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#f59e0b']
        });

        // Redirect to Home page after short delay
        setTimeout(() => {
          onNavigateToHome();
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating resource:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to create resource listing. Please check your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Posting as:</span>
          <span className="font-bold text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
            {user?.fullName || 'Neighbor'}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-2">
              <PackagePlus className="w-3.5 h-3.5 text-brand-400" />
              <span>Community Resource Sharing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Give an Item for Rent
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              List underutilized tools, appliances, gear, or items to share with verified neighbors and earn rental income.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3 text-brand-300 text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Item Name & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Item Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bosch Cordless Hammer Drill 18V"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Category <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* 2. Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Description <span className="text-brand-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the condition, included accessories, battery life, usage instructions, or safety guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
              />
            </div>

            {/* 3. MULTIPLE IMAGE UPLOADS (Min 1, Max 5) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Product Images <span className="text-brand-400">*</span> (1 to 5 Images)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedImages.length}/5 Selected
                </span>
              </div>

              {/* Upload Dropzone / Button */}
              {selectedImages.length < 5 && (
                <label className="border-2 border-dashed border-slate-700 hover:border-brand-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 transition-all group mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drag &amp; drop product images
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload 1 to 5 images • JPG, PNG, WEBP (Max 5MB each)
                  </p>
                </label>
              )}

              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-28">
                      <img
                        src={previewUrl}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Main image badge for first image */}
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-brand-500 text-white px-1.5 py-0.5 rounded shadow">
                          Main
                        </span>
                      )}
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Pricing & Duration Unit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Rent Amount (₹) <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="100"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Duration Unit <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={rentDurationUnit}
                    onChange={(e) => setRentDurationUnit(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all cursor-pointer"
                  >
                    {DURATION_UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id} className="bg-slate-900 text-white">
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Security Deposit (₹) <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 500 (Refundable)"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* 5. Availability Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Available From Date <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Available Until Date <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    min={availableFrom || todayStr}
                    value={availableUntil}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* 6. Pickup Method & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pickup Method <span className="text-brand-400">*</span>
                </label>
                <select
                  value={pickupMethod}
                  onChange={(e) => setPickupMethod(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all cursor-pointer"
                >
                  {PICKUP_METHODS.map((method) => (
                    <option key={method} value={method} className="bg-slate-900 text-white">
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pickup Location / Area <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oakwood Heights, Block B or Sector 4"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onNavigateToHome}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing to MySQL...</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4" />
                    <span>Publish Listing for Rent</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
