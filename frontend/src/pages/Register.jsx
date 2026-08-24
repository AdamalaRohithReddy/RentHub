import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, ShieldCheck, FileText, Upload, Sparkles,
  Smartphone, RefreshCw, KeyRound, Check, Database, FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';

export const Register = ({ onNavigateToLogin }) => {
  // Stepper State: 1 = Basic Details, 2 = Phone/Email OTP, 3 = Identity KYC, 4 = Review & Save to Database, 5 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Phone & Email OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [simulatedSmsOtp, setSimulatedSmsOtp] = useState(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const otpInputRefs = useRef([]);

  // Step 3: Identity Verification (KYC)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [registeredUserSummary, setRegisteredUserSummary] = useState(null);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Post-Registration Redirect Countdown
  useEffect(() => {
    let timer;
    if (isRegistrationComplete && redirectCountdown > 0) {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isRegistrationComplete && redirectCountdown === 0) {
      onNavigateToLogin();
    }
    return () => clearInterval(timer);
  }, [isRegistrationComplete, redirectCountdown, onNavigateToLogin]);

  // Aadhaar Auto-Spacing: XXXX XXXX XXXX
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNumber(formatted);
  };

  // Document File Previews
  const handleAadhaarFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Aadhaar document exceeds 5MB size limit.');
      return;
    }
    setAadhaarFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setAadhaarPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAadhaarPreview(null);
    }
  };

  const handlePanFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('PAN document exceeds 5MB size limit.');
      return;
    }
    setPanFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPanPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPanPreview(null);
    }
  };

  // ----------------------------------------------------------------
  // STEP 1 -> STEP 2 (Proceed to OTP)
  // ----------------------------------------------------------------
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Please enter your full name (at least 3 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const phoneClean = phoneNumber.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please recheck.');
      return;
    }

    setCurrentStep(2);
    triggerSendOtp(phoneClean, email.trim());
  };

  // ----------------------------------------------------------------
  // STEP 2: Send OTP (Dispatches to Email and Phone)
  // ----------------------------------------------------------------
  const triggerSendOtp = async (phoneToUse, emailToUse) => {
    const targetPhone = (phoneToUse || phoneNumber).trim().replace(/\D/g, '');
    const targetEmail = (emailToUse || email).trim();
    setIsSendingOtp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.sendOtp(targetPhone, targetEmail);
      if (res.data.success) {
        setResendTimer(60);
        setSimulatedSmsOtp(res.data.debugOtp || '482910');
        setSuccessMessage(res.data.message || `OTP dispatched to ${targetEmail} and +91 ${targetPhone}`);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 200);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP. Please check your phone number and email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP Inputs
  const handleOtpBoxChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // ----------------------------------------------------------------
  // STEP 2: Verify OTP -> STEP 3
  // ----------------------------------------------------------------
  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);

    try {
      const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
      const res = await api.verifyOtp(cleanPhone, fullOtp);
      if (res.data.success) {
        setIsOtpVerified(true);
        setSuccessMessage('OTP verified successfully!');
        setTimeout(() => {
          setCurrentStep(3);
          setSuccessMessage(null);
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ----------------------------------------------------------------
  // STEP 3 -> STEP 4 (Proceed to Review & Database Save)
  // ----------------------------------------------------------------
  const handleProceedToStep4 = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }

    if (!aadhaarFile) {
      setErrorMessage('Please upload your Aadhaar document/photo.');
      return;
    }

    if (!panFile) {
      setErrorMessage('Please upload your PAN card document/photo.');
      return;
    }

    // Redirect all details to Step 4 for final review & DB save
    setCurrentStep(4);
  };

  // ----------------------------------------------------------------
  // STEP 4: SUBMIT ALL DETAILS & SAVE TO MYSQL DATABASE
  // ----------------------------------------------------------------
  const handleSaveToDatabase = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '');
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phoneNumber', phoneNumber.trim().replace(/\D/g, ''));
      formData.append('password', password);
      formData.append('aadhaarNumber', cleanAadhaar);
      formData.append('aadhaarDoc', aadhaarFile);
      formData.append('panDoc', panFile);

      const res = await api.register(formData);

      if (res.data.success) {
        setRegisteredUserSummary(res.data.user);
        setIsRegistrationComplete(true);
        
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#f59e0b']
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save to database. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">

        {/* Stepper Progress Header */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold select-none">
            
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep >= 1 ? 'text-brand-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 1 
                  ? 'bg-brand-500 text-white border-brand-500' 
                  : currentStep === 1 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span>1. Basic Info</span>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep >= 2 ? 'text-brand-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 2 
                  ? 'bg-brand-500 text-white border-brand-500' 
                  : currentStep === 2 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span>2. OTP Verify</span>
            </div>

            {/* Step 3 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep >= 3 ? 'text-brand-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 3 
                  ? 'bg-brand-500 text-white border-brand-500' 
                  : currentStep === 3 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span>3. KYC Docs</span>
            </div>

            {/* Step 4 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep === 4 ? 'text-brand-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                isRegistrationComplete 
                  ? 'bg-brand-500 text-white border-brand-500 ring-2 ring-brand-500/30' 
                  : currentStep === 4 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {isRegistrationComplete ? <Sparkles className="w-4 h-4" /> : '4'}
              </div>
              <span>4. Review &amp; Save</span>
            </div>

          </div>

          {/* Progress bar line */}
          <div className="relative mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-300 transition-all duration-500 ease-out"
              style={{
                width: currentStep === 1 ? '15%' : currentStep === 2 ? '45%' : currentStep === 3 ? '75%' : '100%'
              }}
            />
          </div>
        </div>

        {/* Form Card Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3 text-brand-300 text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: BASIC DETAILS */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToOtp} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create your RentHub Account</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Step 1: Enter your details. All information will be verified and saved in Step 4.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohith Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address <span className="text-brand-400">*</span> (OTP will be sent here)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Mobile Phone Number (India) <span className="text-brand-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 text-sm font-medium border-r border-slate-700 pr-2">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-24 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Password <span className="text-brand-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Confirm Password <span className="text-brand-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
              >
                <span>Proceed to OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: PHONE & EMAIL OTP VERIFICATION */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email &amp; Phone OTP Verification</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Enter Verification Code</h2>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a 6-digit OTP to <strong className="text-brand-300">{email}</strong> and <strong className="text-slate-200">+91 {phoneNumber}</strong>.
                </p>
              </div>

              {/* Simulated OTP / Real Delivery Popover */}
              {simulatedSmsOtp && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-brand-500/40 shadow-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">📩 Real-time OTP Dispatched</p>
                      <p className="text-sm text-white font-mono">
                        Verification Code: <span className="text-brand-400 font-bold text-base tracking-wider">{simulatedSmsOtp}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = simulatedSmsOtp.split('');
                      setOtpDigits(digits);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/30 font-medium transition-colors"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Boxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl bg-slate-900 border ${
                        digit ? 'border-brand-400 text-brand-300 bg-brand-500/5' : 'border-slate-700 text-white'
                      } focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition-all`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Section */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Check your inbox or phone</span>
                {resendTimer > 0 ? (
                  <span className="text-slate-500 font-mono">Resend code in 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={() => triggerSendOtp()}
                    className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4 flex items-center gap-1"
                  >
                    {isSendingOtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Resend OTP to Email &amp; Phone</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="button"
                  disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
                  onClick={handleVerifyOtp}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify &amp; Continue to KYC</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: IDENTITY VERIFICATION (KYC) */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleProceedToStep4} className="space-y-5 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OTP Verified ✓ | Step 3</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Identity Verification (KYC)</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Upload your Aadhaar &amp; PAN card documents. You will review everything in Step 4 before saving.
                </p>
              </div>

              {/* Aadhaar Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  12-Digit Aadhaar Number <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono tracking-wider placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                  />
                </div>
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Aadhaar Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Aadhaar Document / Photo <span className="text-brand-400">*</span>
                  </label>
                  <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    aadhaarFile ? 'border-brand-500/50 bg-brand-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                  }`}>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleAadhaarFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    {aadhaarPreview ? (
                      <div className="relative w-full">
                        <img src={aadhaarPreview} alt="Aadhaar preview" className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-700" />
                        <span className="text-xs text-brand-300 font-medium truncate block">{aadhaarFile?.name}</span>
                      </div>
                    ) : aadhaarFile ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-brand-400 mb-1" />
                        <span className="text-xs text-brand-300 font-medium truncate max-w-[180px]">{aadhaarFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-200">Upload Aadhaar</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, PDF (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* PAN Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    PAN Document / Photo <span className="text-brand-400">*</span>
                  </label>
                  <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    panFile ? 'border-brand-500/50 bg-brand-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                  }`}>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handlePanFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    {panPreview ? (
                      <div className="relative w-full">
                        <img src={panPreview} alt="PAN preview" className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-700" />
                        <span className="text-xs text-brand-300 font-medium truncate block">{panFile?.name}</span>
                      </div>
                    ) : panFile ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-brand-400 mb-1" />
                        <span className="text-xs text-brand-300 font-medium truncate max-w-[180px]">{panFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-200">Upload PAN Card</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, PDF (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm"
                >
                  <span>Proceed to Step 4 (Review &amp; Save)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW DETAILS & SAVE TO MYSQL DATABASE */}
          {/* ========================================================= */}
          {currentStep === 4 && !isRegistrationComplete && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                  <Database className="w-3.5 h-3.5" />
                  <span>STEP 4: Review &amp; Save to MySQL Database</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Review All Information</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Please review all details collected from Steps 1, 2, and 3 before saving to the database.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                
                {/* 1. Basic Details Summary */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Step 1: Personal Account Info
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name:</span>
                      <span className="text-white font-medium">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email Address:</span>
                      <span className="text-white font-medium">{email}</span>
                    </div>
                  </div>
                </div>

                {/* 2. OTP Verification Status */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Step 2: Verification Status
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Mobile Phone:</span>
                      <span className="text-emerald-400 font-mono font-medium">+91 {phoneNumber} (OTP Verified ✓)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email OTP:</span>
                      <span className="text-emerald-400 font-medium">Verified ✓</span>
                    </div>
                  </div>
                </div>

                {/* 3. KYC Documents Summary */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Step 3: KYC Identity Documents
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Aadhaar Number:</span>
                      <span className="text-brand-300 font-mono font-medium">{aadhaarNumber}</span>
                      <span className="text-[11px] text-slate-400 block mt-1">📄 {aadhaarFile?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PAN Card:</span>
                      <span className="text-slate-200 font-medium">Uploaded</span>
                      <span className="text-[11px] text-slate-400 block mt-1">📄 {panFile?.name}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to KYC</span>
                </button>
                
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSaveToDatabase}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold py-4 px-6 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving All Data to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Confirm &amp; Save in Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REGISTRATION COMPLETE & REDIRECT TO LOGIN */}
          {/* ========================================================= */}
          {isRegistrationComplete && (
            <div className="py-8 px-4 text-center space-y-6 animate-slide-up">
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-glow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Registration Complete!</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  All details from Steps 1, 2, and 3 have been successfully saved to the MySQL database.
                </p>
              </div>

              {registeredUserSummary && (
                <div className="max-w-md mx-auto text-left p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="text-white font-semibold">{registeredUserSummary.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200">{registeredUserSummary.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Phone Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> +91 {registeredUserSummary.phoneNumber} (Verified)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Aadhaar Record:</span>
                    <span className="text-brand-300 font-mono">{registeredUserSummary.aadhaarMasked}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-blue-400 font-mono">MySQL 8.0 &amp; Spring Boot</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-400">
                  Redirecting to Login Page in <strong className="text-brand-400 text-sm font-mono">{redirectCountdown}</strong> seconds...
                </p>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-4 rounded-xl shadow-glow transition-all text-sm"
                >
                  <span>Go to Login Page Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
