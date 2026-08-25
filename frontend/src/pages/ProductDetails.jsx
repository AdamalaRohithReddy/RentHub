import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Tag, Calendar, MapPin, DollarSign, Clock, ShieldCheck, 
  Layers, Package, CheckCircle2, AlertCircle, RefreshCw, User, ShoppingBag,
  Check, Image as ImageIcon, Sparkles, Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { QuantitySelector } from '../components/QuantitySelector';
import './ProductDetails.css';

export const ProductDetails = ({ productId, onNavigateBack, onNavigateToMyOrders, onNavigateToLogin }) => {
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantityRequired, setQuantityRequired] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getResourceById(id);
      if (res.data) {
        setProduct(res.data);
        setActiveImageIndex(0);
        setQuantityRequired(1);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderNow = async () => {
    if (!isAuthenticated) {
      if (onNavigateToLogin) onNavigateToLogin();
      return;
    }

    if (!product) return;

    // Validation: cannot order own product
    if (user && product.ownerId === user.id) {
      setErrorMessage('You cannot order or rent your own product.');
      return;
    }

    if (product.status !== 'AVAILABLE' || product.availableQuantity < 1) {
      setErrorMessage('This product is currently not available for rent.');
      return;
    }

    if (quantityRequired < 1 || quantityRequired > product.availableQuantity) {
      setErrorMessage(`Please select a valid quantity between 1 and ${product.availableQuantity}.`);
      return;
    }

    setIsOrdering(true);
    setErrorMessage(null);

    try {
      const res = await api.createOrder({
        resourceId: product.id,
        quantity: quantityRequired,
      });

      if (res.data) {
        setSuccessMessage(`🎉 Order request placed for ${quantityRequired} unit(s) of "${product.itemName}"!`);
        
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#3b82f6', '#f59e0b']
        });

        // Redirect to My Orders page after short delay
        setTimeout(() => {
          if (onNavigateToMyOrders) {
            onNavigateToMyOrders();
          }
        }, 1600);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to place order request. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-brand-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-slate-400">The requested resource could not be found or has been removed.</p>
        <button
          onClick={onNavigateBack}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[activeImageIndex]?.imageUrl || (images.length > 0 ? images[0].imageUrl : null);
  const isOwner = user && user.id === product.ownerId;
  const isAvailable = product.status === 'AVAILABLE' && product.availableQuantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <span className="text-xs font-bold text-brand-300 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            {product.category}
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Large Image Container */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 h-96 sm:h-[420px] flex items-center justify-center relative shadow-2xl">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.itemName}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <ImageIcon className="w-16 h-16" />
                <span className="text-xs">No image available</span>
              </div>
            )}

            {/* Status Pill on Image */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${
                isAvailable 
                  ? 'bg-emerald-500/90 text-white border border-emerald-400/40' 
                  : 'bg-red-500/90 text-white border border-red-400/40'
              }`}>
                {product.status || (isAvailable ? 'AVAILABLE' : 'OUT OF STOCK')}
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${
                    idx === activeImageIndex
                      ? 'border-brand-400 ring-2 ring-brand-400/30 scale-95'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Owner Trust & Verification Box */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white uppercase shadow-sm">
                {product.ownerName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xs text-slate-400">Listed By Verified Owner</p>
                <p className="text-sm font-bold text-white">{product.ownerName || 'Verified Neighbor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Verified</span>
            </div>
          </div>

        </div>

        {/* Right Column: Product Specs, Quantity, & Order Actions (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
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

          {/* Title & Description Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            
            <div>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {product.itemName}
              </h1>
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Rent Rate</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-brand-400">
                    {formatCurrency(product.rentAmount)}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    / {product.rentDurationUnit || 'Day'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Available Quantity</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {product.availableQuantity} {product.availableQuantity === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>

                {product.securityDeposit > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Security Deposit (Refundable)</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {formatCurrency(product.securityDeposit)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Pickup Method:</span>
                  <span className="text-white font-medium">{product.pickupMethod}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Pickup Location:</span>
                  <span className="text-white font-medium">{product.pickupLocation}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 sm:col-span-2">
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Rental Availability Window:</span>
                  <span className="text-white font-medium">
                    {product.availableFrom} &nbsp;➔&nbsp; {product.availableUntil}
                  </span>
                </div>
              </div>

            </div>

            {/* AI Physical Condition Report Box */}
            {product.conditionScan && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Verified Condition</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
                    Score: {product.conditionScan.conditionScore} / 100 ({product.conditionScan.conditionStatus})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <p className="leading-relaxed">
                    {product.conditionScan.scanResult}
                  </p>
                  {product.conditionScan.damageDetails && (
                    <p className="text-[11px] text-slate-400">
                      <strong>Observations:</strong> {product.conditionScan.damageDetails}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Order Action Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quantity Required</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select between 1 and {product.availableQuantity} unit(s)
                </p>
              </div>

              <QuantitySelector
                quantity={quantityRequired}
                maxQuantity={product.availableQuantity}
                onChange={setQuantityRequired}
                disabled={!isAvailable || isOwner}
              />
            </div>

            {/* Total Estimated Cost */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Rent per {product.rentDurationUnit || 'Day'}:</span>
              <span className="text-base font-extrabold text-brand-300">
                {formatCurrency((product.rentAmount || 0) * quantityRequired)}
              </span>
            </div>

            {/* Order Now Button */}
            {isOwner ? (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs text-center font-medium">
                🛡️ You are the owner of this listing. You can view incoming requests in <strong>My Orders ➔ Requests Received</strong>.
              </div>
            ) : !isAvailable ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
                ⚠️ This item is currently {product.status || 'OUT OF STOCK'} and cannot accept new rental requests.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOrderNow}
                disabled={isOrdering}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all text-base tracking-wide"
              >
                {isOrdering ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Placing Order Request...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>ORDER NOW ({quantityRequired} {quantityRequired === 1 ? 'Unit' : 'Units'})</span>
                  </>
                )}
              </button>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              🔒 The product owner will review your request before acceptance. Available quantity will be deducted upon owner acceptance.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};
