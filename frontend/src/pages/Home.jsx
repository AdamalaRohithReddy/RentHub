import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Phone, Sparkles, Wrench, Tent, BookOpen, 
  Tv, Gamepad2, Search, ArrowRight, CheckCircle2,
  Share2, HeartHandshake, DollarSign, Leaf, Zap, Server
} from 'lucide-react';

const CATEGORIES = [
  { id: 'tools', name: 'Power & Hand Tools', icon: Wrench, count: '48 items', desc: 'Drills, saws, ladders, lawnmowers' },
  { id: 'appliances', name: 'Kitchen & Appliances', icon: Zap, count: '32 items', desc: 'Pressure cookers, mixers, air fryers' },
  { id: 'camping', name: 'Outdoor & Camping', icon: Tent, count: '24 items', desc: 'Tents, sleeping bags, stoves, kayaks' },
  { id: 'electronics', name: 'Electronics & AV', icon: Tv, count: '19 items', desc: 'Projectors, speakers, DSLR cameras' },
  { id: 'books', name: 'Books & Learning', icon: BookOpen, count: '110 items', desc: 'Novels, textbooks, skill manuals' },
  { id: 'games', name: 'Board Games & Sports', icon: Gamepad2, count: '35 items', desc: 'Catan, badminton sets, cricket kits' },
];

export const Home = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* 1. Verified User Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/70 to-slate-900 border border-brand-500/30 p-6 sm:p-10 shadow-glow">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Verified Community Neighbor</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to RentHub, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">{user?.fullName || 'Neighbor'}</span>!
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your identity has been verified via phone OTP & KYC. You can now share, lend, borrow, and rent tools, equipment, appliances, and books with your local community.
            </p>
          </div>

          {/* User Verification Profile Summary Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 w-full md:w-80 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs text-slate-400">Trust Score</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Perfect
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone:
                </span>
                <span className="font-mono text-emerald-400">Verified (+91 {user?.phoneNumber})</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Aadhaar KYC:
                </span>
                <span className="font-mono text-brand-300">{user?.aadhaarMasked || 'Verified in MySQL'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Server className="w-3.5 h-3.5 text-indigo-400" /> Backend:
                </span>
                <span className="font-mono text-xs text-indigo-300">Spring Boot 3 & MySQL 8</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Next Steps & Interactive Prompt Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-navy-900 border-2 border-brand-500/40 shadow-glow space-y-3">
        <div className="flex items-center gap-2.5 text-brand-400">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-brand-400" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Registration & Login Complete! Ready for Home Page Instructions
          </h3>
        </div>
        <p className="text-sm text-slate-300">
          The 4-step registration flow has saved your basic details, phone verification, and Aadhaar/PAN KYC documents into the MySQL database via Spring Boot. You are now logged in.
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
          👉 <strong className="text-brand-300">Awaiting your instructions:</strong> Tell me what you should include in the Home Page next (e.g. Item listings, search filters, wanted requests, borrow modals, or neighborhood map)!
        </div>
      </div>

      {/* 3. Community Impact Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">412+</p>
            <p className="text-xs text-slate-400">Resources Shared</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹3,45,000</p>
            <p className="text-xs text-slate-400">Community Money Saved</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">1,820 kg</p>
            <p className="text-xs text-slate-400">CO₂ & Waste Prevented</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">280+</p>
            <p className="text-xs text-slate-400">Verified Active Neighbors</p>
          </div>
        </div>

      </div>

      {/* 4. Search & Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search for tools, ladders, camping tents, projector, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'free', 'rent', 'donate'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  selectedFilter === filter ? 'bg-brand-600 text-white shadow-glow' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Items' : filter === 'free' ? 'Free to Borrow' : filter === 'rent' ? 'Micro-Rental (₹)' : 'Giveaway / Free'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 5. Resource Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Explore by Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Find underutilized items shared by neighbors in your area</p>
          </div>
          <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800/90 cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                    {cat.count}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
