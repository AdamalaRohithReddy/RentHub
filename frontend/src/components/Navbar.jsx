import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, PhoneCall, Sparkles, LogOut, RefreshCw, Server } from 'lucide-react';

export const Navbar = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logoutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(isAuthenticated ? 'home' : 'login')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
            <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">Rent<span className="text-brand-400">Hub</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">Spring Boot 3</span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide">Community Resource Sharing</p>
          </div>
        </div>

        {/* Right Section: Badges & Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              
              {/* Trust & Verification Badges */}
              <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC {user.kycStatus}</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-blue-400">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Phone Verified</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trust Score {user.trustScore || 100}%</span>
                </div>
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-teal-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logoutUser();
                  onNavigate('login');
                }}
                title="Log Out"
                className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentView !== 'login' && (
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Log In
                </button>
              )}
              {currentView !== 'register' && (
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-glow hover:shadow-glow-lg transition-all"
                >
                  Join RentHub
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
