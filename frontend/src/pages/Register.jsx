import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, ShieldCheck, FileText, Upload, Sparkles,
  Smartphone, RefreshCw, KeyRound, Check, Database, FileCheck, Scan, AlertTriangle, RotateCcw
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

  // Step 3: Identity Verification (KYC) & Aadhaar OCR
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  // Real Aadhaar Document-to-Input Matching States
  const [isScanningAadhaar, setIsScanningAadhaar] = useState(false);
  const [aadhaarScanStepText, setAadhaarScanStepText] = useState('Scanning Aadhaar card...');
  const [aadhaarOcrResult, setAadhaarOcrResult] = useState(null);
  const [aadhaarNumberMatched, setAadhaarNumberMatched] = useState(false);

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
    // Reset OCR verification when number changes
    setAadhaarOcrResult(null);
    setAadhaarNumberMatched(false);
  };

  // Document File Previews & Trigger Aadhaar OCR
  const handleAadhaarFileUpload = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Aadhaar document exceeds 10MB size limit.');
      return;
    }
    setAadhaarFile(file);
    setAadhaarOcrResult(null);
    setAadhaarNumberMatched(false);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setAadhaarPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAadhaarPreview(null);
    }

    // If 12-digit number already typed, trigger OCR matching
    const cleanNum = aadhaarNumber.replace(/\s+/g, '');
    if (cleanNum.length === 12) {
      verifyAadhaarWithOcr(file, cleanNum);
    }
  };

  const handlePanFileUpload = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('PAN document exceeds 10MB size limit.');
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

  // Run Real Aadhaar Document-to-Input Matching
  const verifyAadhaarWithOcr = async (fileToScan, numberToMatch) => {
    const targetFile = fileToScan || aadhaarFile;
    const targetNumber = (numberToMatch || aadhaarNumber).replace(/\s+/g, '');

    if (!targetFile) {
      setErrorMessage('Please upload your Aadhaar card photo first.');
      return;
    }
    if (targetNumber.length !== 12) {
      setErrorMessage('Please enter a 12-digit Aadhaar number before verifying.');
      return;
    }

    setIsScanningAadhaar(true);
    setErrorMessage(null);
    setAadhaarScanStepText('Scanning Aadhaar card...');

    // Progress text simulation
    setTimeout(() => setAadhaarScanStepText('Reading document details...'), 350);
    setTimeout(() => setAadhaarScanStepText('Comparing Aadhaar number...'), 700);

    try {
      const formData = new FormData();
      formData.append('aadhaarNumber', targetNumber);
      formData.append('aadhaarDoc', targetFile);

      const res = await api.verifyAadhaarOcr(formData);
      const result = res.data;
      setAadhaarOcrResult(result);

      if (result.aadhaarNumberMatched) {
        setAadhaarNumberMatched(true);
        setSuccessMessage('✓ Aadhaar document verified! Number matches entered details.');
      } else {
        setAadhaarNumberMatched(false);
        setErrorMessage(result.message || 'Aadhaar verification failed. Please check the uploaded photo.');
      }
    } catch (err) {
      console.error('Aadhaar OCR verification error:', err);
      setAadhaarNumberMatched(false);
      setAadhaarOcrResult({
        documentDetected: false,
        ocrSuccess: false,
        aadhaarNumberDetected: false,
        aadhaarNumberMatched: false,
        verificationStatus: 'OCR_FAILED',
        message: err.response?.data?.message || 'Unable to read the Aadhaar card image. Please upload a clear photo.'
      });
      setErrorMessage(err.response?.data?.message || 'Unable to read the Aadhaar card image. Please upload a clear photo.');
    } finally {
      setIsScanningAadhaar(false);
    }
  };

  // ----------------------------------------------------------------
  // STEP 1 -> STEP 2 (Dispatch OTP)
  // ----------------------------------------------------------------
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fullName.trim().length < 3) {
      setErrorMessage('Please enter your full legal name (at least 3 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    await triggerSendOtp(cleanPhone, email.trim());
    setCurrentStep(2);
  };

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
      setErrorMessage('Please upload your Aadhaar document photo.');
      return;
    }

    if (!panFile) {
      setErrorMessage('Please upload your PAN card document photo.');
      return;
    }

    if (!aadhaarNumberMatched) {
      setErrorMessage('Aadhaar verification is required. Please click "Verify Aadhaar" to verify your document.');
      return;
    }

    setCurrentStep(4);
  };

  // ----------------------------------------------------------------
  // STEP 4: Submit Registration (Save in MySQL Database)
  // ----------------------------------------------------------------
  const handleFinalDatabaseSubmit = async () => {
    if (!aadhaarNumberMatched) {
      setErrorMessage('Cannot complete registration: Aadhaar number verification has not passed.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
      const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '');

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim());
      formData.append('phoneNumber', cleanPhone);
      formData.append('password', password);
      formData.append('aadhaarNumber', cleanAadhaar);
      formData.append('aadhaarDoc', aadhaarFile);
      formData.append('panDoc', panFile);

      const res = await api.register(formData);

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('renthub_token', res.data.token);
          localStorage.setItem('renthub_user', JSON.stringify(res.data.user));
        }

        setRegisteredUserSummary(res.data.user);
        setIsRegistrationComplete(true);
        setCurrentStep(5);

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#f59e0b']
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage(
        err.response?.data?.message ||
        'Registration failed. Please check your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Stepper Progress Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="grid grid-cols-4 text-center text-xs font-semibold">
            
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep === 1 ? 'text-brand-400' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 1 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : currentStep === 1 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span>1. Details</span>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep === 2 ? 'text-brand-400' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 2 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : currentStep === 2 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span>2. OTP</span>
            </div>

            {/* Step 3 */}
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${currentStep === 3 ? 'text-brand-400' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                currentStep > 3 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : currentStep === 3 
                  ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-2 ring-brand-500/30' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span>3. KYC &amp; OCR</span>
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
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-semibold text-sm">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-24 pr-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
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
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
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
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm tracking-wide mt-2"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Send OTP to Phone &amp; Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4"
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: PHONE & EMAIL OTP VERIFICATION */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Step 2 of 4</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Enter 6-Digit OTP Code</h2>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a 6-digit verification code to <span className="text-brand-300 font-mono">+91 {phoneNumber}</span> and <span className="text-brand-300">{email}</span>.
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
          {/* STEP 3: IDENTITY VERIFICATION (KYC & OCR MATCHING) */}
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
                  Enter your Aadhaar number and upload your card photo. The system will perform OCR document-to-input matching.
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
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG (Max 10MB)</span>
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
                        <span className="text-xs font-semibold text-slate-200">Upload PAN</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG (Max 10MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Real-Time Aadhaar OCR Verification Box */}
              {isScanningAadhaar && (
                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3 text-xs text-brand-300 animate-fade-in">
                  <RefreshCw className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{aadhaarScanStepText}</p>
                    <p className="text-slate-400">Verifying document clarity, UIDAI structure, and 12-digit number</p>
                  </div>
                </div>
              )}

              {/* Aadhaar Verification Result Card */}
              {aadhaarOcrResult && !isScanningAadhaar && (
                <div className={`p-4 rounded-2xl border transition-all animate-fade-in ${
                  aadhaarNumberMatched
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-500/10 border-red-500/40 text-red-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {aadhaarNumberMatched ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          {aadhaarNumberMatched ? '✓ Aadhaar Document Verified' : '✗ Aadhaar Number Mismatch'}
                        </h4>
                        <p className="text-[11px] mt-0.5 opacity-90">{aadhaarOcrResult.message}</p>
                      </div>
                    </div>

                    {!aadhaarNumberMatched && (
                      <button
                        type="button"
                        onClick={() => verifyAadhaarWithOcr(aadhaarFile, aadhaarNumber)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  {aadhaarOcrResult.passedChecks && aadhaarOcrResult.passedChecks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-500/20 space-y-1 text-[11px]">
                      {aadhaarOcrResult.passedChecks.map((chk, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-300 font-medium">
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Verify Aadhaar Button if not yet scanned */}
              {!aadhaarOcrResult && aadhaarFile && aadhaarNumber.replace(/\s+/g, '').length === 12 && !isScanningAadhaar && (
                <button
                  type="button"
                  onClick={() => verifyAadhaarWithOcr(aadhaarFile, aadhaarNumber)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-brand-500/40 text-brand-300 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
                >
                  <Scan className="w-4 h-4 text-brand-400" />
                  <span>[ 🔍 VERIFY AADHAAR CARD OCR ]</span>
                </button>
              )}

              {/* Action Buttons */}
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
                  disabled={!aadhaarNumberMatched || !panFile}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm tracking-wide"
                >
                  <span>Next: Review &amp; Database Save</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW & SAVE IN MYSQL */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                  <Database className="w-3.5 h-3.5" />
                  <span>Step 4: Final Confirmation</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Review &amp; Complete Registration</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Please review your details. Clicking complete will persist your profile into the MySQL database.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 text-sm">
                
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Full Name</span>
                  <span className="font-bold text-white">{fullName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-white">{email}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Phone Number</span>
                  <span className="font-mono text-emerald-400">✓ +91 {phoneNumber} (OTP Verified)</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Aadhaar Verification</span>
                  <span className="font-mono text-emerald-400">✓ {aadhaarNumber} (OCR Matched)</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-400">KYC Documents</span>
                  <span className="text-slate-300 font-medium">{aadhaarFile?.name} &bull; {panFile?.name}</span>
                </div>

              </div>

              {/* Final Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading || !aadhaarNumberMatched}
                  onClick={handleFinalDatabaseSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm tracking-wide"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile to MySQL Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>COMPLETE REGISTRATION</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: SUCCESS */}
          {/* ========================================================= */}
          {currentStep === 5 && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Registration Successful!</h2>
                <p className="text-sm text-slate-300">
                  Welcome to RentHub, <strong className="text-brand-400">{fullName}</strong>! Your account and KYC documents have been saved in the MySQL database.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 font-mono">
                Redirecting to Login in <span className="text-brand-400 font-bold">{redirectCountdown}</span> seconds...
              </div>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                Go to Login Now
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
