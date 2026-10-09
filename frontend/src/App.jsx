import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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
import { Notifications } from './pages/Notifications';

// Helper component to extract :id param for ProductDetails
const ProductDetailsWrapper = ({ onNavigateBack, onNavigateToMyOrders, onNavigateToLogin }) => {
  const { id } = useParams();
  return (
    <ProductDetails
      productId={id ? Number(id) : null}
      onNavigateBack={onNavigateBack}
      onNavigateToMyOrders={onNavigateToMyOrders}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
};

// Helper component to extract :id param for EditProduct
const EditProductWrapper = ({ onBack, onSaved }) => {
  const { id } = useParams();
  return (
    <EditProduct
      productId={id ? Number(id) : null}
      onBack={onBack}
      onSaved={onSaved}
    />
  );
};

// Helper component to extract :orderId param for ReturnInspection
const ReturnInspectionWrapper = ({ onBack, onComplete }) => {
  const { orderId } = useParams();
  return (
    <ReturnInspection
      orderId={orderId ? Number(orderId) : null}
      onBack={onBack}
      onComplete={onComplete}
    />
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine currentView string from pathname for Navbar highlighting
  const getComputedCurrentView = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/register')) return 'register';
    if (path === '/profile') return 'profile';
    if (path === '/edit-profile') return 'edit-profile';
    if (path === '/my-products') return 'my-products';
    if (path.startsWith('/edit-product')) return 'edit-product';
    if (path.startsWith('/products') || path.startsWith('/product-details')) return 'product-details';
    if (path === '/give-for-rent') return 'give-for-rent';
    if (path === '/my-orders') return 'my-orders';
    if (path === '/received-requests') return 'received-requests';
    if (path === '/notifications') return 'notifications';
    if (path.startsWith('/return-inspect')) return 'return-inspect';
    return 'home';
  };

  const currentView = getComputedCurrentView();

  const handleNavigate = (view) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'edit-profile':
        navigate('/edit-profile');
        break;
      case 'my-products':
        navigate('/my-products');
        break;
      case 'give-for-rent':
        navigate('/give-for-rent');
        break;
      case 'my-orders':
        navigate('/my-orders');
        break;
      case 'received-requests':
        navigate('/received-requests');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      default:
        navigate('/');
    }
  };

  const handleSelectProduct = (productId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/products/${productId}`);
  };

  const handleNavigateToOrdersTab = (tabName = 'my-requests') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tabName === 'requests-received') {
      navigate('/received-requests');
    } else {
      navigate('/my-orders');
    }
  };

  const handleNavigateToEditProduct = (productId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/edit-product/${productId}`);
  };

  const handleNavigateToReturnInspect = (orderId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/return-inspect/${orderId}`);
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
        onNavigate={handleNavigate}
        onNavigateToOrdersTab={handleNavigateToOrdersTab}
      />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Home 
                onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                onSelectProduct={handleSelectProduct}
              />
            } 
          />
          <Route 
            path="/home" 
            element={
              <Home 
                onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                onSelectProduct={handleSelectProduct}
              />
            } 
          />

          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login
                  onNavigateToRegister={() => handleNavigate('register')}
                  onLoginSuccess={() => handleNavigate('home')}
                />
              )
            } 
          />

          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Register onNavigateToLogin={() => handleNavigate('login')} />
              )
            } 
          />

          <Route 
            path="/products/:id" 
            element={
              <ProductDetailsWrapper
                onNavigateBack={() => handleNavigate('home')}
                onNavigateToMyOrders={() => handleNavigateToOrdersTab('my-requests')}
                onNavigateToLogin={() => handleNavigate('login')}
              />
            } 
          />
          <Route 
            path="/product-details/:id" 
            element={
              <ProductDetailsWrapper
                onNavigateBack={() => handleNavigate('home')}
                onNavigateToMyOrders={() => handleNavigateToOrdersTab('my-requests')}
                onNavigateToLogin={() => handleNavigate('login')}
              />
            } 
          />

          {/* Protected Routes: Profile & Edit Profile */}
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <Profile
                  onNavigateToHome={() => handleNavigate('home')}
                  onNavigateToEdit={() => handleNavigate('edit-profile')}
                  onNavigateToMyProducts={() => handleNavigate('my-products')}
                  onNavigateToMyOrders={() => handleNavigateToOrdersTab('my-requests')}
                  onNavigateToRequestsReceived={() => handleNavigateToOrdersTab('requests-received')}
                  onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                  onNavigateToNotifications={() => handleNavigate('notifications')}
                  onNavigateToLogin={() => handleNavigate('login')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/edit-profile" 
            element={
              isAuthenticated ? (
                <EditProfile
                  onBack={() => handleNavigate('profile')}
                  onSaved={() => handleNavigate('profile')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Protected Routes: My Products & Edit Product */}
          <Route 
            path="/my-products" 
            element={
              isAuthenticated ? (
                <MyProducts
                  onNavigateToHome={() => handleNavigate('home')}
                  onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                  onNavigateToEdit={handleNavigateToEditProduct}
                  onNavigateToOrders={() => handleNavigateToOrdersTab('requests-received')}
                  onSelectProduct={handleSelectProduct}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/edit-product/:id" 
            element={
              isAuthenticated ? (
                <EditProductWrapper
                  onBack={() => handleNavigate('my-products')}
                  onSaved={() => handleNavigate('my-products')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Protected Routes: Give For Rent, Orders, and Return Inspection */}
          <Route 
            path="/give-for-rent" 
            element={
              isAuthenticated ? (
                <GiveForRent onNavigateToHome={() => handleNavigate('home')} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/my-orders" 
            element={
              isAuthenticated ? (
                <MyOrders
                  initialTab="my-requests"
                  onTabChange={(tab) => {
                    if (tab === 'requests-received') navigate('/received-requests');
                  }}
                  onNavigateToHome={() => handleNavigate('home')}
                  onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                  onNavigateToReturnInspect={handleNavigateToReturnInspect}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/received-requests" 
            element={
              isAuthenticated ? (
                <MyOrders
                  initialTab="requests-received"
                  onTabChange={(tab) => {
                    if (tab === 'my-requests') navigate('/my-orders');
                  }}
                  onNavigateToHome={() => handleNavigate('home')}
                  onNavigateToGiveForRent={() => handleNavigate('give-for-rent')}
                  onNavigateToReturnInspect={handleNavigateToReturnInspect}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/return-inspect/:orderId" 
            element={
              isAuthenticated ? (
                <ReturnInspectionWrapper
                  onBack={() => handleNavigateToOrdersTab('requests-received')}
                  onComplete={() => handleNavigateToOrdersTab('requests-received')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/notifications" 
            element={
              isAuthenticated ? (
                <Notifications
                  onNavigateToHome={() => handleNavigate('home')}
                  onNavigateToOrdersTab={handleNavigateToOrdersTab}
                  onNavigateToReturnInspect={handleNavigateToReturnInspect}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
