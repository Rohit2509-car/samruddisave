import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserRole, UserProfile } from '../types';
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
  HelpCircle,
  Building,
  Settings,
  Lock,
  ShieldCheck,
  User,
  ChevronDown,
  Building2,
  RotateCcw,
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
      setProfiles(stateStore.getProfiles());
    });
    return unsubscribe;
  }, []);

  const isKYCPending = user.role === 'member' && user.kyc_status !== 'approved';

  const handleSwitchPersona = (targetUser: UserProfile) => {
    stateStore.setCurrentUser(targetUser.id);
    setPersonaOpen(false);
    setDropdownOpen(false);

    if (targetUser.role === 'member') {
      onNavigate('/dashboard');
    } else if (targetUser.role === 'employee') {
      onNavigate('/employee');
    } else if (targetUser.role === 'support_agent') {
      onNavigate('/support');
    } else if (targetUser.role === 'finance_admin') {
      onNavigate('/finance');
    } else if (targetUser.role === 'super_admin') {
      onNavigate('/admin');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'member':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">Member</span>;
      case 'employee':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">MRM Officer</span>;
      case 'support_agent':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">Support Desk</span>;
      case 'finance_admin':
        return <span className="bg-purple-50 text-purple-600 border border-purple-200/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">Escrow Finance</span>;
      case 'super_admin':
        return <span className="bg-rose-50 text-rose-600 border border-rose-200/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">Super Admin</span>;
    }
  };

  const memberTabs = [
    { label: 'Overview', path: '/', icon: Home },
    { label: 'Maturity Plans', path: '/plans', icon: Calculator },
    { label: 'KYC Verification', path: '/kyc', icon: FileText, badge: isKYCPending ? 'Action Needed' : undefined },
    { label: 'Wallet Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Monthly Deposit', path: '/pay', icon: CreditCard, locked: isKYCPending },
    { label: 'AutoPay Setup', path: '/setup-payment', icon: Lock, locked: isKYCPending },
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* FAR-LEFT CORNER: WEBSITE LOGO */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group pr-3 border-r border-slate-200/80 shrink-0"
          title="SamruddiSave Home"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                Samruddi<span className="text-blue-600">Save</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.2 rounded-full border border-blue-200/70 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                RBI Escrow
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Animated Navigation Icons (Icon-Only by default, expanding text on hover/focus) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            const isLocked = tab.locked;

            return (
              <div key={tab.path} className="relative group">
                <button
                  onClick={() => {
                    if (!isLocked) {
                      onNavigate(tab.path);
                    }
                  }}
                  disabled={isLocked}
                  aria-label={tab.label}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.03]'
                      : isLocked
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 focus:bg-blue-50/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}`} />

                  {/* Smooth Animated Text Expansion on Hover / Focus / Active */}
                  <span className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap text-xs font-semibold ${
                    isActive
                      ? 'max-w-44 opacity-100 ml-1'
                      : 'max-w-0 opacity-0 group-hover:max-w-44 group-hover:opacity-100 group-hover:ml-1 group-focus:max-w-44 group-focus:opacity-100 group-focus:ml-1'
                  }`}>
                    {tab.label}
                  </span>

                  {/* Action Badge */}
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Quick Action Button (+) */}
          <button
            onClick={() => {
              if (isKYCPending) {
                onNavigate('/kyc');
              } else {
                onNavigate('/pay');
              }
            }}
            title={isKYCPending ? "Complete KYC First" : "Execute Monthly Deposit"}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-transform duration-300 hover:scale-110 active:scale-95 shrink-0 ml-1.5"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* FAR-RIGHT CORNER: Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Persona Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-2xs"
              title="Switch RBAC test roles"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline text-slate-500 font-medium">Test Role:</span>
              <span className="font-bold text-blue-600 text-[11px] sm:text-xs">
                {user.role === 'member' ? 'Customer' : user.role === 'employee' ? 'Officer' : user.role === 'support_agent' ? 'Support' : user.role === 'finance_admin' ? 'Finance' : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Switcher Dropdown */}
            {personaOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                  <p className="font-bold text-slate-900">Switch RBAC Access Tier</p>
                  <p className="text-[11px] text-slate-500">Simulate platform personas</p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                        user.id === p.id ? 'bg-blue-50/60 text-blue-600 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{p.full_name}</p>
                        <p className="text-[10px] text-slate-500">{p.email}</p>
                      </div>
                      {getRoleBadge(p.role)}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1.5 px-3">
                  <button
                    onClick={() => {
                      stateStore.resetToDefaults();
                      setPersonaOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 p-1 sm:px-2.5 sm:py-1 rounded-full transition-all shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.full_name.charAt(0)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <div className="py-1">
                  {user.role === 'member' && (
                    <>
                      <button
                        onClick={() => { onNavigate('/dashboard'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 font-medium"
                      >
                        <User className="w-4 h-4 text-blue-600" /> Wallet Dashboard
                      </button>
                      <button
                        onClick={() => { onNavigate('/kyc'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 font-medium"
                      >
                        <FileText className="w-4 h-4 text-blue-600" /> KYC Status
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { onNavigate('/support'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-600" /> Help Desk
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1.5 px-3">
                  <button
                    onClick={() => {
                      onNavigate('/');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer (Reveals Icon + Labels) */}
      {mobileMenuOpen && (
        <div className="lg:hidden py-3 px-4 space-y-1.5 border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
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
                    setMobileMenuOpen(false);
                  }
                }}
                disabled={isLocked}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : isLocked
                    ? 'text-slate-300 bg-slate-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </div>
                {isLocked && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    KYC Required
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

    </header>
  );
};




