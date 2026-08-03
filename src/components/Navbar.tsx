import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile } from '../types';
import {
  Home,
  Calculator,
  FileText,
  LayoutDashboard,
  CreditCard,
  History,
  Gift,
  Users,
  UserCheck,
  ShieldAlert,
  HelpCircle,
  Building,
  Settings,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const isKYCPending = user.role === 'member' && user.kyc_status !== 'approved';

  const memberTabs = [
    { label: 'Overview', path: '/', icon: Home },
    { label: 'Maturity Plans', path: '/plans', icon: Calculator },
    { label: 'KYC Verification', path: '/kyc', icon: FileText, badge: isKYCPending ? 'Action Needed' : undefined },
    { label: 'Wallet Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Monthly Deposit', path: '/pay', icon: CreditCard, locked: isKYCPending },
    { label: 'AutoPay Setup', path: '/payment-setup', icon: Lock, locked: isKYCPending },
    { label: 'Escrow Ledger', path: '/ledger', icon: History },
    { label: 'Gift Hampers', path: '/hampers', icon: Gift },
    { label: 'Savings Circles', path: '/circles', icon: Users },
  ];

  const employeeTabs = [
    { label: 'MRM Verification Queue', path: '/employee', icon: UserCheck },
    { label: 'Customer Support Desk', path: '/support', icon: HelpCircle },
  ];

  const supportTabs = [
    { label: 'Support Ticket Portal', path: '/support', icon: HelpCircle },
  ];

  const financeTabs = [
    { label: 'Escrow Trustee Disbursals', path: '/finance', icon: Building },
  ];

  const superAdminTabs = [
    { label: 'Platform Governance', path: '/admin', icon: Settings },
    { label: 'MRM Verification Queue', path: '/employee', icon: UserCheck },
    { label: 'Escrow Trustee Portal', path: '/finance', icon: Building },
    { label: 'Support Desk Queue', path: '/support', icon: HelpCircle },
  ];

  let currentTabs = memberTabs;
  if (user.role === 'employee') currentTabs = employeeTabs;
  else if (user.role === 'support_agent') currentTabs = supportTabs;
  else if (user.role === 'finance_admin') currentTabs = financeTabs;
  else if (user.role === 'super_admin') currentTabs = superAdminTabs;

  return (
    <nav className="bg-white border-b border-[#E8EAF8] shadow-2xs sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            const isLocked = tab.locked;

            return (
              <button
                key={tab.path}
                onClick={() => {
                  if (!isLocked) {
                    onNavigate(tab.path);
                  }
                }}
                disabled={isLocked}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#4F5DFF] text-white shadow-sm shadow-[#4F5DFF]/25'
                    : isLocked
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'text-[#6C7285] hover:text-[#1F1F24] hover:bg-[#F7F8FC]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isLocked ? 'text-slate-300' : 'text-[#6C7285]'}`} />
                <span>{tab.label}</span>
                {isLocked && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.2 rounded font-medium border border-amber-200">
                    KYC Required
                  </span>
                )}
                {tab.badge && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
