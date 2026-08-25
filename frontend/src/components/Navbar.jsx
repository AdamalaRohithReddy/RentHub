import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, PhoneCall, Sparkles, LogOut, RefreshCw, 
  PackagePlus, Home, ShoppingBag, Package, User 
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Navbar = ({ currentView, onNavigate, onNavigateToOrdersTab }) => {
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

        {/* Right Section: Badges, Notification Bell, Orders, Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Trust & Verification Badges */}
              <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC {user.kycStatus || 'VERIFIED'}</span>
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

              {/* My Products Button */}
              <button
                onClick={() => onNavigate('my-products')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  currentView === 'my-products' || currentView === 'edit-product'
                    ? 'bg-brand-500/20 border-brand-400 text-brand-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="View and edit products you have listed"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">My Products</span>
              </button>

              {/* My Orders Button */}
              <button
                onClick={() => onNavigate('my-orders')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  currentView === 'my-orders'
                    ? 'bg-brand-500/20 border-brand-400 text-brand-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="View your rental requests and received orders"
              >
                <ShoppingBag className="w-4 h-4 text-brand-400" />
                <span className="hidden md:inline">My Orders</span>
              </button>

              {/* + Give for Rent Button */}
              {currentView !== 'give-for-rent' ? (
                <button
                  onClick={() => onNavigate('give-for-rent')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow hover:shadow-glow-lg transition-all"
                  title="List a product or tool for rent"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span className="hidden sm:inline">+ Give for Rent</span>
                  <span className="sm:hidden">+ Rent</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Browse Items</span>
                </button>
              )}

              {/* In-App Notification Bell */}
              <NotificationBell onNavigateToOrdersTab={onNavigateToOrdersTab} />

              {/* User Profile Button / Chip */}
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                  currentView === 'profile' || currentView === 'edit-profile'
                    ? 'bg-brand-500/20 border-brand-400 text-brand-300 ring-1 ring-brand-400/40 shadow-glow'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
                }`}
                title="View and manage your profile"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-brand-500 to-teal-700 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{user.fullName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-semibold leading-tight truncate max-w-[110px]">
                    {user.fullName || 'My Profile'}
                  </p>
                  <p className="text-[10px] text-slate-400">👤 Profile</p>
                </div>
              </button>

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
