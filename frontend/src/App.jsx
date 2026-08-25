import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { GiveForRent } from './pages/GiveForRent';
import { ProductDetails } from './pages/ProductDetails';
import { MyOrders } from './pages/MyOrders';
import { MyProducts } from './pages/MyProducts';
import { EditProduct } from './pages/EditProduct';
import { ReturnInspection } from './pages/ReturnInspection';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [inspectingOrderId, setInspectingOrderId] = useState(null);
  const [ordersInitialTab, setOrdersInitialTab] = useState('my-requests');

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (currentView === 'login' || currentView === 'register') {
          setCurrentView('home');
        }
      } else {
        if (currentView !== 'login' && currentView !== 'register' && currentView !== 'home' && currentView !== 'product-details') {
          setCurrentView('login');
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToOrdersTab = (tabName = 'my-requests') => {
    setOrdersInitialTab(tabName);
    setCurrentView('my-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToEditProduct = (productId) => {
    setEditingProductId(productId);
    setCurrentView('edit-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToReturnInspect = (orderId) => {
    setInspectingOrderId(orderId);
    setCurrentView('return-inspect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">Connecting to Spring Boot Backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToOrdersTab={handleNavigateToOrdersTab}
      />

      <main className="flex-1">
        {currentView === 'register' && (
          <Register onNavigateToLogin={() => setCurrentView('login')} />
        )}

        {currentView === 'login' && (
          <Login
            onNavigateToRegister={() => setCurrentView('register')}
            onLoginSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'home' && (
          <Home 
            onNavigateToGiveForRent={() => setCurrentView('give-for-rent')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-details' && (
          <ProductDetails
            productId={selectedProductId}
            onNavigateBack={() => setCurrentView('home')}
            onNavigateToMyOrders={() => handleNavigateToOrdersTab('my-requests')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'give-for-rent' && (
          <GiveForRent onNavigateToHome={() => setCurrentView('home')} />
        )}

        {currentView === 'my-products' && (
          <MyProducts
            onNavigateToHome={() => setCurrentView('home')}
            onNavigateToGiveForRent={() => setCurrentView('give-for-rent')}
            onNavigateToEdit={handleNavigateToEditProduct}
            onNavigateToOrders={() => handleNavigateToOrdersTab('requests-received')}
          />
        )}

        {currentView === 'edit-product' && (
          <EditProduct
            productId={editingProductId}
            onBack={() => setCurrentView('my-products')}
            onSaved={() => setCurrentView('my-products')}
          />
        )}

        {currentView === 'return-inspect' && (
          <ReturnInspection
            orderId={inspectingOrderId}
            onBack={() => handleNavigateToOrdersTab('requests-received')}
            onComplete={() => handleNavigateToOrdersTab('requests-received')}
          />
        )}

        {currentView === 'my-orders' && (
          <MyOrders
            initialTab={ordersInitialTab}
            onNavigateToHome={() => setCurrentView('home')}
            onNavigateToGiveForRent={() => setCurrentView('give-for-rent')}
            onNavigateToReturnInspect={handleNavigateToReturnInspect}
          />
        )}

        {currentView === 'profile' && (
          <Profile
            onNavigateToHome={() => setCurrentView('home')}
            onNavigateToEdit={() => setCurrentView('edit-profile')}
            onNavigateToMyProducts={() => setCurrentView('my-products')}
            onNavigateToMyOrders={() => handleNavigateToOrdersTab('my-requests')}
            onNavigateToRequestsReceived={() => handleNavigateToOrdersTab('requests-received')}
            onNavigateToGiveForRent={() => setCurrentView('give-for-rent')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'edit-profile' && (
          <EditProfile
            onBack={() => setCurrentView('profile')}
            onSaved={() => setCurrentView('profile')}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 RentHub • Spring Boot 3 &amp; React Platform</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>🔒 Aadhaar KYC Verified</span>
            <span>📱 Mandatory Phone OTP</span>
            <span>📦 Order &amp; Return System</span>
            <span>👤 User Profile Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
