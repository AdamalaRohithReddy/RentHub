import React from 'react';
import { Package, Send, ShoppingBag, RotateCcw, Clock, TrendingUp } from 'lucide-react';

export const ProfileStatistics = ({ statistics }) => {
  const stats = statistics || {
    productsListed: 0,
    currentlyRentedOut: 0,
    ordersMade: 0,
    activeRentals: 0,
    pendingRequests: 0,
  };

  const statCards = [
    {
      label: 'Products Listed',
      value: stats.productsListed ?? 0,
      icon: <Package className="w-5 h-5 text-brand-400" />,
      color: 'from-brand-500/10 to-teal-500/5 border-brand-500/30 text-brand-300',
    },
    {
      label: 'Currently Rented Out',
      value: stats.currentlyRentedOut ?? 0,
      icon: <Send className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/10 to-orange-500/5 border-amber-500/30 text-amber-300',
    },
    {
      label: 'Orders Made',
      value: stats.ordersMade ?? 0,
      icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/30 text-blue-300',
    },
    {
      label: 'Active Rentals',
      value: stats.activeRentals ?? 0,
      icon: <RotateCcw className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-emerald-300',
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests ?? 0,
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/10 to-pink-500/5 border-purple-500/30 text-purple-300',
    },
  ];

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            My Activity &amp; Resource Statistics
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Live MySQL Data</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((c, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border bg-gradient-to-b ${c.color} flex flex-col justify-between space-y-2 hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {c.label}
              </span>
              <div className="p-1.5 rounded-xl bg-slate-950/60 border border-white/10">
                {c.icon}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {c.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
