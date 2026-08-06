import React, { useState, useEffect } from 'react';
import { stateStore } from './store/StateStore';
import { TopHeader } from './components/TopHeader';
import { Navbar } from './components/Navbar';
import { BottomNavDock } from './components/BottomNavDock';
import { RoleGuard } from './components/RoleGuard';

// Member Pages
import { LandingPage } from './pages/LandingPage';
import { PlansPage } from './pages/PlansPage';
import { KYCPage } from './pages/KYCPage';
import { DashboardPage } from './pages/DashboardPage';
import { MakePaymentPage } from './pages/MakePaymentPage';
import { PaymentSetupPage } from './pages/PaymentSetupPage';
import { LedgerPage } from './pages/LedgerPage';
import { HamperSelectionPage } from './pages/HamperSelectionPage';
import { SavingsCirclesPage } from './pages/SavingsCirclesPage';
import { AuctionsPage } from './pages/AuctionsPage';
import { ReportsPage } from './pages/ReportsPage';

import { SupportPortalPage } from './pages/support/SupportPortalPage';
import { LoginPage } from './pages/LoginPage';

// Admin Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Sync with browser history and scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  const renderCurrentView = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage onNavigate={handleNavigate} />;

      case '/plans':
        return <PlansPage onNavigate={handleNavigate} />;

      case '/kyc':
        return <KYCPage onNavigate={handleNavigate} />;

      case '/dashboard':
        return (
          <RoleGuard currentPath={currentPath} onNavigate={handleNavigate}>
            <DashboardPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/pay':
        return (
          <RoleGuard currentPath={currentPath} requiresApprovedKYC onNavigate={handleNavigate}>
            <MakePaymentPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/setup-payment':
        return (
          <RoleGuard currentPath={currentPath} requiresApprovedKYC onNavigate={handleNavigate}>
            <PaymentSetupPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/ledger':
        return (
          <RoleGuard currentPath={currentPath} onNavigate={handleNavigate}>
            <LedgerPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/hampers':
        return <HamperSelectionPage onNavigate={handleNavigate} />;

      case '/circles':
        return <SavingsCirclesPage onNavigate={handleNavigate} />;

      case '/auctions':
        return <AuctionsPage onNavigate={handleNavigate} />;

      case '/reports':
        return <ReportsPage onNavigate={handleNavigate} />;

      case '/support':
        return <SupportPortalPage onNavigate={handleNavigate} />;

      // Customer Login & Registration Routes
      case '/login':
        return <LoginPage defaultMode="login" onNavigate={handleNavigate} />;

      case '/register':
        return <LoginPage defaultMode="register" onNavigate={handleNavigate} />;

      // Admin Login Portal Route
      case '/console':
      case '/admin-login':
        return <AdminLoginPage onNavigate={handleNavigate} />;

      // Single Admin Operations Dashboard Route
      case '/admin':
      case '/employee':
      case '/finance':
        return (
          <RoleGuard currentPath={currentPath} allowedRoles={['admin', 'employee', 'finance_admin']} onNavigate={handleNavigate}>
            <AdminDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        );

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F7F8FC] text-[#1F1F24] font-body flex flex-col justify-between selection:bg-[#4F5DFF]/20 selection:text-[#4F5DFF] pb-6">
      <div>
        {/* Sticky Top Header */}
        <TopHeader currentPath={currentPath} onNavigate={handleNavigate} />

        {/* Navigation Navbar */}
        <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <main className="animate-in fade-in duration-200">
          {renderCurrentView()}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EAF8] py-8 px-4 mt-12 text-center text-xs text-[#6C7285] space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4F5DFF] text-white font-heading font-extrabold flex items-center justify-center text-xs">
              S
            </div>
            <span className="font-heading font-extrabold text-[#1F1F24]">SamruddiSave™</span>
            <span className="text-[10px] text-[#6C7285]">© 2026 All Rights Reserved</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] font-semibold">
            <button onClick={() => handleNavigate('/')} className="hover:text-[#4F5DFF]">RBI Escrow Disclosures</button>
            <button onClick={() => handleNavigate('/plans')} className="hover:text-[#4F5DFF]">Savings Plans</button>
            <button onClick={() => handleNavigate('/hampers')} className="hover:text-[#4F5DFF]">Gift Perks</button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 max-w-4xl mx-auto">
          SamruddiSave is an RBI Escrow certified fixed micro-savings & maturity perks platform. All member principal contributions are deposited directly into HDFC Escrow Trustee Account #9182374619 under 256-bit encrypted audit trails.
        </p>
      </footer>

      {/* Mobile Bottom Dock Navigation */}
      <BottomNavDock currentPath={currentPath} onNavigate={handleNavigate} />
    </div>
  );
}
