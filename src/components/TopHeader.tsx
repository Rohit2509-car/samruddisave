import React, { useState, useEffect, useRef } from 'react';
import { stateStore } from '../store/StateStore';
import { UserRole, UserProfile } from '../types';
import {
  ShieldCheck,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  HelpCircle,
  FileCheck2,
  Menu,
  X,
  Home,
  Calculator,
  LayoutDashboard,
  CreditCard,
  Gift,
  Users,
  Lock,
  UserCheck,
  FileText,
  Activity,
  DollarSign,
  Settings,
  UserCog,
  Gavel
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { AuthModal } from './AuthModal';

interface TopHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [tappedLabel, setTappedLabel] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isKYCPending = user?.role === 'member' && user?.kyc_status !== 'approved';
  const isAdminPage = user?.role === 'admin' || currentPath.startsWith('/admin') || currentPath === '/console' || currentPath === '/admin-login' || user?.role === 'employee' || user?.role === 'finance_admin';
  const isDashboardPage = currentPath === '/dashboard';

  const memberNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Plans', path: '/plans', icon: Calculator },
    { label: 'Pay', path: '/pay', icon: CreditCard },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Gifts', path: '/hampers', icon: Gift },
    { label: 'Guide', path: '/#how-it-works', icon: Activity },
    { label: 'Security', path: '/#security', icon: ShieldCheck },
  ];

  const adminNavItems = [
    { label: 'KYC Queue', path: '/admin#kyc_queue', icon: UserCheck, badge: 'Queue' },
    { label: 'Members', path: '/admin#members', icon: Users },
    { label: 'Payments', path: '/admin#payments', icon: CreditCard },
    { label: 'Ledger', path: '/admin#ledger', icon: FileText },
    { label: 'Reports', path: '/admin#reports', icon: Activity },
    { label: 'Hampers', path: '/admin#hampers', icon: Gift },
    { label: 'Payouts', path: '/admin#payouts', icon: DollarSign },
    { label: 'Support', path: '/support', icon: HelpCircle },
    { label: 'Settings', path: '/admin#settings', icon: Settings },
  ];

  const currentNavItems = isAdminPage ? adminNavItems : memberNavItems;

  const checkIsActive = (item: { path: string }) => {
    if (isAdminPage) {
      if (item.path.includes('#')) {
        const itemHash = '#' + item.path.split('#')[1];
        return currentPath === '/admin' && activeHash === itemHash;
      }
      if (item.path === '/admin') {
        return currentPath === '/admin' && (!activeHash || activeHash === '#' || activeHash === '#overview');
      }
    }
    return currentPath === item.path;
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'member':
        return <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 px-2 py-0.5 rounded-full text-xs font-semibold">Member</span>;
      case 'admin':
        return <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Admin</span>;
      default:
        return <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 px-2 py-0.5 rounded-full text-xs font-semibold">Staff</span>;
    }
  };

  const handleNavClick = (path: string, label?: string, locked?: boolean) => {
    if (locked) return;

    if (label) {
      setTappedLabel(label);
      setTimeout(() => setTappedLabel(null), 2500);
    }

    // Auto-close mobile drawer and dropdowns
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      const targetHash = '#' + hash;
      
      if (currentPath !== basePath && basePath !== '') {
        onNavigate(basePath);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }, 150);
      } else {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setActiveHash(targetHash);
    } else {
      setActiveHash('');
      onNavigate(path);
      // Smoothly scroll to the top of the page for new route views
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleSwitchRole = (targetRole: UserRole) => {
    stateStore.switchRole(targetRole);
    if (targetRole === 'admin') {
      window.location.hash = '';
      setActiveHash('');
      onNavigate('/admin');
    } else {
      window.location.hash = '';
      setActiveHash('');
      onNavigate('/');
    }
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await stateStore.signOut();
    setUser(null);
    onNavigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAF8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Mobile Menu Toggle & Website Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-[#6C7285] hover:text-[#1F1F24] bg-[#F7F8FC] border border-[#E8EAF8] transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Website Logo (Positioned on the LEFT side) */}
          <div
            onClick={() => handleNavClick(isAdminPage ? '/admin' : '/', 'Overview')}
            className="flex items-center gap-2 cursor-pointer shrink-0 group/logo transition-all hover:scale-105 active:scale-95 pr-2 sm:border-r border-[#E8EAF8]"
            title="SamruddiSave - RBI Certified Escrow Platform"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-[#4F5DFF]/25 shrink-0 group-hover/logo:shadow-lg transition-all">
              S
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-[#1F1F24] leading-none">
                Samruddi<span className="text-[#4F5DFF]">Save</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 tracking-wider uppercase mt-0.5 whitespace-nowrap">
                RBI Escrow Certified
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Clean Navigation Bar with Section Names & Icons */}
        <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 mx-2">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0 bg-[#F7F8FC] p-1.5 rounded-full border border-[#E8EAF8] shadow-inner justify-center">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = checkIsActive(item);
              const isLocked = (item as any).locked;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.path, item.label, isLocked)}
                  disabled={isLocked}
                  className={`group/navitem relative flex items-center gap-2 justify-center transition-all duration-200 cursor-pointer shrink-0 rounded-full min-h-[40px] px-4 text-xs font-bold ${
                    isActive
                      ? 'bg-[#4F5DFF] text-white shadow-md'
                      : isLocked
                      ? 'text-slate-300 bg-transparent cursor-not-allowed'
                      : 'text-[#6C7285] hover:bg-white hover:text-[#1F1F24] hover:shadow-xs'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isActive ? 'text-white' : 'text-[#6C7285] group-hover/navitem:text-[#1F1F24]'
                  }`} />
                  <span className="whitespace-nowrap">
                    {item.label}
                  </span>

                  {item.badge && !isActive && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                  )}

                  {isLocked && (
                    <Lock className="w-3 h-3 text-slate-300 ml-1.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Far Right Corner: Notifications + User Profile + Website Logo (Placed at the Far Right) */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <NotificationsDropdown userId={user.id} />

              {/* User Account Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white hover:bg-[#F7F8FC] border border-[#E8EAF8] p-1.5 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-[#4F5DFF]/30 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6A6DFF] to-[#8A7BFF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {user.full_name?.charAt(0) || 'M'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left max-w-[100px] md:max-w-[120px] truncate">
                    <p className="text-xs font-semibold text-[#1F1F24] leading-tight truncate">{user.full_name}</p>
                    <p className="text-[10px] text-[#6C7285] leading-none truncate">{user.email}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6C7285] hidden sm:block shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E8EAF8] py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#E8EAF8]">
                      <p className="font-bold text-[#1F1F24] text-sm">{user.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {getRoleBadge(user.role)}
                        {user.role === 'member' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            user.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            KYC {user.kyc_status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleSwitchRole('member')}
                          className="w-full text-left px-4 py-3 hover:bg-[#F7F8FC] flex items-center gap-2.5 text-emerald-700 font-bold cursor-pointer min-h-[44px]"
                        >
                          <User className="w-4 h-4 text-emerald-600" /> Switch to Member Portal
                        </button>
                      )}

                      <div className="border-t border-[#E8EAF8] my-1" />

                      {user.role === 'member' && (
                        <>
                          <button
                            onClick={() => handleNavClick('/dashboard', 'Wallet Dashboard')}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24] cursor-pointer min-h-[44px]"
                          >
                            <User className="w-4 h-4 text-[#4F5DFF]" /> My Wallet Dashboard
                          </button>
                          <button
                            disabled
                            className="w-full text-left px-4 py-2.5 opacity-50 cursor-not-allowed flex items-center justify-between text-slate-400 font-semibold min-h-[44px]"
                            title="KYC Verification option is disabled"
                          >
                            <span className="flex items-center gap-2">
                              <FileCheck2 className="w-4 h-4 text-slate-400" /> KYC Verification Status
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">Disabled</span>
                          </button>
                        </>
                      )}

                      {(user.role === 'admin' || user.role === 'employee') && (
                        <button
                          onClick={() => handleNavClick('/employee', 'MRM Approval Queue')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24] cursor-pointer min-h-[44px]"
                        >
                          <UserCheck className="w-4 h-4 text-amber-600" /> MRM Approval Queue
                        </button>
                      )}

                      {(user.role === 'admin' || user.role === 'finance_admin') && (
                        <button
                          onClick={() => handleNavClick('/finance', 'Escrow Queue')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24] cursor-pointer min-h-[44px]"
                        >
                          <Building2 className="w-4 h-4 text-purple-600" /> Escrow Disbursal Queue
                        </button>
                      )}

                      <button
                        onClick={() => handleNavClick('/support', 'Help & Support')}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24] cursor-pointer min-h-[44px]"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600" /> Help & Support Desk
                      </button>
                    </div>

                    <div className="border-t border-[#E8EAF8] pt-1 px-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onNavigate('/login')}
                className="bg-white hover:bg-[#F7F8FC] text-[#1F1F24] border border-[#E8EAF8] px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px] shrink-0"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/register')}
                className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer min-h-[44px] shrink-0"
              >
                Start Saving
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile / Tablet Floating Overlay Menu */}
      {mobileMenuOpen && (
        <>
          {/* Semi-transparent Backdrop Overlay */}
          <div
            className="lg:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Floating Mobile Drawer Content Overlay (Does not push down page content) */}
          <div className="lg:hidden fixed top-16 left-0 right-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white/98 backdrop-blur-xl border-b border-[#E8EAF8] px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">

          {/* Consolidated Single Navigation Menu */}
          <div className="bg-white rounded-3xl p-4 border border-[#E8EAF8] shadow-sm space-y-3">
            <div className="px-2 pb-2.5 border-b border-[#E8EAF8] flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#6C7285] tracking-wider uppercase">
                {isAdminPage ? 'ADMIN NAVIGATION' : 'NAVIGATION MENU'}
              </span>
              <span className="text-[10px] font-semibold text-[#4F5DFF] bg-[#4F5DFF]/10 px-2 py-0.5 rounded-full border border-[#4F5DFF]/20">
                RBI Escrow Certified
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = checkIsActive(item);
                const isLocked = (item as any).locked;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.path, item.label, isLocked)}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-[#4F5DFF] text-white shadow-md shadow-[#4F5DFF]/30 font-bold'
                        : isLocked
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100'
                        : 'text-[#1F1F24] hover:bg-[#F7F8FC] hover:text-[#4F5DFF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : isLocked ? 'text-slate-300' : 'text-[#4F5DFF]'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLocked && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> KYC Required
                        </span>
                      )}
                      {item.badge && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${
                        isActive ? 'text-white' : isLocked ? 'text-slate-200' : 'text-[#6C7285]'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile Summary Card in Drawer */}
          {user ? (
            <div className="bg-[#F7F8FC] p-3 rounded-2xl border border-[#E8EAF8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6A6DFF] to-[#8A7BFF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.full_name?.charAt(0) || 'M'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#1F1F24] truncate">{user.full_name}</p>
                  <p className="text-[10px] text-[#6C7285] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 min-h-[44px] min-w-[44px] justify-center"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#F7F8FC] p-3 rounded-2xl border border-[#E8EAF8] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/login');
                }}
                className="w-1/2 bg-white text-[#1F1F24] border border-[#E8EAF8] py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer min-h-[44px]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/register');
                }}
                className="w-1/2 bg-[#4F5DFF] text-white py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer min-h-[44px]"
              >
                Start Saving
              </button>
            </div>
          )}

        </div>
        </>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setUser(stateStore.getCurrentUser())}
        />
      )}
    </header>
  );
};
