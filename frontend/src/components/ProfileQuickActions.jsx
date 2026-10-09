import React from 'react';
import { Package, ShoppingBag, Inbox, PlusCircle, Bell, ArrowRight, Edit3 } from 'lucide-react';

export const ProfileQuickActions = ({ 
  onNavigateToMyProducts, 
  onNavigateToMyOrders, 
  onNavigateToRequestsReceived, 
  onNavigateToGiveForRent,
  onNavigateToEditProfile,
  onOpenNotifications 
}) => {
  const actions = [
    {
      title: 'My Products',
      subtitle: 'Manage listings, edit quantity & photos',
      icon: <Package className="w-5 h-5 text-emerald-400" />,
      onClick: onNavigateToMyProducts,
      gradient: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      badge: 'Owner',
    },
    {
      title: 'My Orders',
      subtitle: 'Track borrowed resources & return items',
      icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
      onClick: onNavigateToMyOrders,
      gradient: 'hover:border-blue-500/40 hover:bg-blue-500/5',
      badge: 'Borrower',
    },
    {
      title: 'Requests Received',
      subtitle: 'Accept incoming bookings & inspect returns',
      icon: <Inbox className="w-5 h-5 text-purple-400" />,
      onClick: onNavigateToRequestsReceived,
      gradient: 'hover:border-purple-500/40 hover:bg-purple-500/5',
      badge: 'Vendor',
    },
    {
      title: 'Give for Rent',
      subtitle: 'List a new tool or equipment with AI scan',
      icon: <PlusCircle className="w-5 h-5 text-brand-400" />,
      onClick: onNavigateToGiveForRent,
      gradient: 'hover:border-brand-500/40 hover:bg-brand-500/5',
      badge: '+ Earn',
    },
    {
      title: 'Edit Profile',
      subtitle: 'Update name, contact address & avatar photo',
      icon: <Edit3 className="w-5 h-5 text-teal-400" />,
      onClick: onNavigateToEditProfile,
      gradient: 'hover:border-teal-500/40 hover:bg-teal-500/5',
      badge: 'Account',
    },
    {
      title: 'Notifications',
      subtitle: 'View booking alerts, returns & system updates',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      onClick: onOpenNotifications,
      gradient: 'hover:border-amber-500/40 hover:bg-amber-500/5',
      badge: 'Alerts',
    },
  ];

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Quick Actions &amp; Navigation
        </h3>
        <span className="text-[11px] text-slate-500">Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-left flex flex-col justify-between space-y-3 transition-all group ${act.gradient}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                {act.badge}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors flex items-center justify-between">
                <span>{act.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-brand-400" />
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {act.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
