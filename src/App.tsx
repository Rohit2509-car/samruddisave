import React, { useState, useEffect } from 'react';
import { stateStore } from './store/StateStore';
import { UserRole } from './types';
import { TopHeader } from './components/TopHeader';
import { Navbar } from './components/Navbar';
import { BottomNavDock } from './components/BottomNavDock';
import { RoleGuard } from './components/RoleGuard';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PlansPage } from './pages/PlansPage';
import { KYCPage } from './pages/KYCPage';
import { DashboardPage } from './pages/DashboardPage';
import { MakePaymentPage } from './pages/MakePaymentPage';
import { PaymentSetupPage } from './pages/PaymentSetupPage';
import { LedgerPage } from './pages/LedgerPage';
import { HamperSelectionPage } from './pages/HamperSelectionPage';
import { SavingsCirclesPage } from './pages/SavingsCirclesPage';

// Staff & Admin Portals
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { FinanceAdminPortalPage } from './pages/finance/FinanceAdminPortalPage';
import { SupportPortalPage } from './pages/support/SupportPortalPage';
import { AdminPanelPage } from './pages/admin/AdminPanelPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  const handleNavigate = (path: string) => {
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

      case '/employee':
        return (
          <RoleGuard currentPath={currentPath} allowedRoles={['employee', 'super_admin']} onNavigate={handleNavigate}>
            <EmployeeDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/finance':
        return (
          <RoleGuard currentPath={currentPath} allowedRoles={['finance_admin', 'super_admin']} onNavigate={handleNavigate}>
            <FinanceAdminPortalPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/support':
        return (
          <RoleGuard currentPath={currentPath} allowedRoles={['member', 'support_agent', 'employee', 'super_admin']} onNavigate={handleNavigate}>
            <SupportPortalPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      case '/admin':
        return (
          <RoleGuard currentPath={currentPath} allowedRoles={['super_admin']} onNavigate={handleNavigate}>
            <AdminPanelPage onNavigate={handleNavigate} />
          </RoleGuard>
        );

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#1F1F24] font-body flex flex-col justify-between selection:bg-[#4F5DFF]/20 selection:text-[#4F5DFF] pb-24 md:pb-12">
      <div>
        {/* Sticky Top Header */}
        <TopHeader onNavigate={handleNavigate} />

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
            <button onClick={() => handleNavigate('/support')} className="hover:text-[#4F5DFF]">Help Desk</button>
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
