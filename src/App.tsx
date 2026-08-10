import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { ReportsPage } from './pages/ReportsPage';

import { SupportPortalPage } from './pages/support/SupportPortalPage';
import { LoginPage } from './pages/LoginPage';
import { SecurityPage } from './pages/SecurityPage';
import { AccountSecurityPage } from './pages/AccountSecurityPage';
import { GuidePage } from './pages/GuidePage';

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

      case '/onboarding':
      case '/dashboard':
        return (
          <RoleGuard currentPath={currentPath} onNavigate={handleNavigate}>
            <DashboardPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/guide':
        return <GuidePage onNavigate={handleNavigate} />;

      case '/security':
        return <SecurityPage onNavigate={handleNavigate} />;

      case '/account-security':
        return <AccountSecurityPage onNavigate={handleNavigate} />;

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

  const isFullScreenApp = currentPath === '/dashboard' || currentPath === '/onboarding' || currentPath === '/admin' || currentPath === '/employee' || currentPath === '/finance';

  if (isFullScreenApp) {
    return (
      <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-600">
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F8FC] text-[#1F1F24] font-body flex flex-col justify-between selection:bg-[#4F5DFF]/20 selection:text-[#4F5DFF] relative">
      {/* Fixed Top Navigation Bar Stack */}
      <div className="sticky top-0 z-40 w-full bg-white border-b border-[#E8EAF8] shadow-xs">
        {/* Sticky Top Header */}
        <TopHeader currentPath={currentPath} onNavigate={handleNavigate} />

        {/* Navigation Navbar */}
        <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

      {/* Main Content Area - Fully Scrollable */}
      <main className="flex-1 w-full max-w-full animate-in fade-in duration-200">
        {renderCurrentView()}
      </main>

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
