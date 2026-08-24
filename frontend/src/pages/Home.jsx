import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Phone, Sparkles, Wrench, Tent, BookOpen, 
  Tv, Gamepad2, Search, ArrowRight, CheckCircle2,
  Share2, HeartHandshake, DollarSign, Leaf, Zap, Server,
  PackagePlus, RefreshCw, Layers, MapPin
} from 'lucide-react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import './Home.css';

const CATEGORY_FILTERS = [
  'All Items',
  'Power & Hand Tools',
  'Kitchen & Appliances',
  'Outdoor & Camping',
  'Electronics & AV',
  'Books & Learning',
  'Board Games & Sports',
  'Gardening & Lawn',
  'Baby & Kids Gear',
  'Other'
];

export const Home = ({ onNavigateToGiveForRent }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // Fetch all resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await api.getResources();
      if (res.data) {
        setResources(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products by search and category
  const filteredResources = resources.filter((item) => {
    const matchesSearch = 
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pickupLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All Items' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* 1. Verified User Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/70 to-slate-900 border border-brand-500/30 p-6 sm:p-10 shadow-glow">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Verified Community Resource Sharing</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to RentHub, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">{user?.fullName || 'Neighbor'}</span>!
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Share, lend, borrow, and rent tools, appliances, camping gear, and equipment with verified neighbors.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToGiveForRent}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold py-3 px-5 rounded-xl shadow-glow hover:shadow-glow-lg transition-all text-sm"
              >
                <PackagePlus className="w-4 h-4" />
                <span>+ Give for Rent</span>
              </button>
            </div>
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
                <span className="font-mono text-xs text-indigo-300">Spring Boot 3 &amp; MySQL 8</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Community Impact Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{resources.length > 0 ? `${resources.length}+` : '0'}</p>
            <p className="text-xs text-slate-400">Active Resources Listed</p>
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
            <p className="text-xs text-slate-400">CO₂ &amp; Waste Prevented</p>
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

      {/* 3. Search & Category Filters Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by item name, description, location, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
            />
          </div>

          <button
            onClick={fetchResources}
            className="p-3 bg-slate-900 border border-slate-700/80 hover:border-brand-500 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Refresh listings from MySQL"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNavigateToGiveForRent}
            className="hidden sm:flex items-center gap-1.5 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs shadow-glow transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ Give for Rent</span>
          </button>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 4. ALL PRODUCTS & RESOURCES GRID */}
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-400" />
              <span>Available Community Resources</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse products and tools listed by verified neighbors in your community.
            </p>
          </div>

          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
            {filteredResources.length} {filteredResources.length === 1 ? 'Item' : 'Items'} Found
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading resources from MySQL database...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredResources.length === 0 && (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
              <PackagePlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No items found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {resources.length === 0 
                  ? 'No resources have been listed yet. Be the first to list a tool or appliance for rent!'
                  : 'No items match your search filter. Try clearing the search or category filter.'}
              </p>
            </div>
            <button
              onClick={onNavigateToGiveForRent}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-xl shadow-glow transition-all text-xs"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Give an Item for Rent</span>
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
