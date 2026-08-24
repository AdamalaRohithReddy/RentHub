import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onNavigateToRegister, onLoginSuccess }) => {
  const { loginUser } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your registered Email/Phone and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.login(identifier.trim(), password);
      if (res.data.success && res.data.token && res.data.user) {
        loginUser(res.data.token, res.data.user);
        setSuccessMessage('Login successful! Redirecting to Home page...');
        setTimeout(() => {
          onLoginSuccess();
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">

        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3 shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back to RentHub</h2>
            <p className="text-sm text-slate-400 mt-1">Log in to borrow, lend, and manage your resources.</p>
          </div>

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

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email or Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="name@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For password reset assistance, please contact support or re-register.')}
                  className="text-xs text-brand-400 hover:text-brand-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In with Spring Boot...</span>
                </>
              ) : (
                <>
                  <span>Sign In to RentHub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-3 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                New to the community?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4"
                >
                  Register Now (4-Step Verification)
                </button>
              </p>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
