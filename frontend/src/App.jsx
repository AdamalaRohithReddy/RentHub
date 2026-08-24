import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('register');

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setCurrentView('home');
      } else {
        setCurrentView('register');
      }
    }
  }, [isAuthenticated, isLoading]);

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
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

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

        {currentView === 'home' && <Home />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 RentHub • Spring Boot 3 &amp; React Platform</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>🔒 Aadhaar KYC Verified</span>
            <span>📱 Mandatory Phone OTP</span>
            <span>🌱 MySQL 8.0 Persistence</span>
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
