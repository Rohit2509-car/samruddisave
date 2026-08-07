import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, Membership, ContributionRecord, GiftHamper } from '../types';
import { SAVINGS_PLANS, GIFT_HAMPERS } from '../data/mockData';
import {
  Home,
  Users,
  CreditCard,
  FileText,
  Gift,
  FileCheck2,
  HelpCircle,
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Activity,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Lock,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { UserProfileEditModal } from '../components/UserProfileEditModal';
import { PrintableReceiptModal } from '../components/PrintableReceiptModal';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(user ? stateStore.getUserMembership(user.id) : undefined);
  const [contributions, setContributions] = useState<ContributionRecord[]>(user ? stateStore.getUserContributions(user.id) : []);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewReceiptRecord, setViewReceiptRecord] = useState<ContributionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'circles' | 'pay' | 'hampers' | 'kyc'>('home');
  const [activeHamperTab, setActiveHamperTab] = useState<'upcoming' | 'claimed'>('upcoming');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hi, when is the next monthly deposit due?', sender: 'Member', time: '10:00 AM', isUser: false },
    { id: 2, text: 'The next deposit is due on the 15th of this month. Please check your Monthly Deposit tab to securely make the payment.', sender: 'Samruddi Admin', time: '10:05 AM', isUser: false },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: userMsg,
        sender: user?.full_name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      }
    ]);
    setChatInput('');

    // Simulate auto-reply from Admin
    setTimeout(() => {
      let replyText = "Thank you for reaching out! One of our admins will assist you shortly.";
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('due') || lowerMsg.includes('pay') || lowerMsg.includes('deposit')) {
        replyText = "Your next monthly deposit is due on the 15th. You can securely make your payment from the 'Monthly Deposit' tab.";
      } else if (lowerMsg.includes('gift') || lowerMsg.includes('hamper')) {
        replyText = "Gift hampers are allocated based on your plan tier and will be delivered during the upcoming festive season!";
      } else if (lowerMsg.includes('kyc')) {
        replyText = "You can check your KYC status in the 'KYC Verification' tab. Verification typically takes 24-48 hours.";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        replyText = `Hello ${user?.full_name?.split(' ')[0] || ''}! How can I help you today?`;
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: replyText,
          sender: 'Samruddi Admin',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false
        }
      ]);
    }, 1000);
  };

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      if (u) {
        setMembership(stateStore.getUserMembership(u.id));
        setContributions(stateStore.getUserContributions(u.id));
      } else {
        setMembership(undefined);
        setContributions([]);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <h2 className="font-heading font-extrabold text-2xl text-slate-900">Signed Out</h2>
        <p className="text-xs text-slate-500">Please sign in to view your micro-savings customer dashboard.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const plan = SAVINGS_PLANS.find((p) => p.id === membership?.plan_id) || SAVINGS_PLANS[0];
  const allocatedHamper = GIFT_HAMPERS.find((h) => h.id === user.allocated_hamper_id);

  const isKYCPending = user.kyc_status !== 'approved';
  const paidCount = contributions.filter((c) => c.status === 'PAID').length;
  const monthlyAmount = membership?.monthly_amount || plan.monthly_amount;
  const totalSavedSoFar = paidCount * monthlyAmount;
  const totalGoalTarget = monthlyAmount * 12;
  const remainingAmount = Math.max(0, totalGoalTarget - totalSavedSoFar);
  const goalProgressPct = Math.round((paidCount / 12) * 100);
  const accruedBonus = Math.round((totalSavedSoFar * plan.cash_bonus_pct) / 100);

  // Latest paid transaction
  const paidContribs = contributions.filter(c => c.status === 'PAID');
  const latestPaid = paidContribs.length > 0 ? paidContribs[paidContribs.length - 1] : null;

  // Direct Admin Dashboard Navigation handler
  const handleNavigateToAdminDashboard = () => {
    setSidebarOpen(false);
    const currentUser = stateStore.getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      stateStore.registerOrUpdateProfile({ ...currentUser, role: 'admin' });
    }
    onNavigate('/admin');
  };

  // Sign out handler
  const handleSignOut = async () => {
    await stateStore.signOut();
    onNavigate('/');
  };

  // Generate and Download Payment Receipt
  const handleDownloadReceipt = (contrib: ContributionRecord) => {
    const receiptContent = `================================================
SAMRUDDISAVE RBI ESCROW OFFICIAL RECEIPT
================================================
Receipt ID: ${contrib.id}
Date: ${contrib.paid_date ? new Date(contrib.paid_date).toLocaleString() : new Date().toLocaleString()}
Member Name: ${user.full_name}
Member Email: ${user.email}
Membership ID: ${contrib.membership_id}
Cycle Number: Month #${contrib.cycle_number} of 12
Deposit Amount: INR ${contrib.amount.toLocaleString('en-IN')}
Payment Method: ${(contrib.payment_method || 'razorpay').toUpperCase()}
Verification Status: ${contrib.is_offline || contrib.reconciled_by_admin ? `ADMIN VERIFIED (${contrib.reconciled_by_admin_name || 'Admin'})` : 'AUTOMATED ONLINE'}
Admin Notes: ${contrib.admin_notes || 'N/A'}
Transaction Ref: ${contrib.transaction_ref}
Escrow Batch ID: ${contrib.escrow_batch_id || 'ESC_TRUSTEE_91823'}
Escrow Bank: HDFC Escrow Trustee Account #9182374619
Status: VERIFIED & DEPOSITED
================================================
Thank you for saving with SamruddiSave Escrow!
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SamruddiSave_Receipt_${contrib.transaction_ref}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-[#F4F6F9] flex flex-col lg:flex-row text-slate-800 font-sans relative ${activeTab === 'circles' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION (Full Screen Authenticated Area) */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E2640] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand Header (Website Logo - Clicking redirects to Public Landing Page) */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-all"
            onClick={() => {
              setSidebarOpen(false);
              onNavigate('/');
            }}
            title="Click logo to return to Public Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-heading font-extrabold text-lg text-white tracking-tight">
              Samruddi<span className="text-blue-400">Save</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu Items (Internal Navigation strictly inside Dashboard) */}
        <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold overflow-y-auto">
          <button
            onClick={handleNavigateToAdminDashboard}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white group"
            title="Open Admin Operations Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Dashboard</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); setActiveTab('home'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home' ? 'bg-[#3B82F6] text-white shadow-md font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Home</span>
          </button>

          {/* Chit Groups (Disabled) */}
          <button
            disabled
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 opacity-50 cursor-not-allowed select-none"
            title="Chit Groups option is disabled"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 shrink-0" />
              <span>Chit Groups</span>
            </div>
            <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">Disabled</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); setActiveTab('pay'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'pay' ? 'bg-[#3B82F6] text-white shadow-md font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Monthly Deposit</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); setActiveTab('hampers'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hampers' ? 'bg-[#3B82F6] text-white shadow-md font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 shrink-0" />
            <span>Gift Hampers</span>
          </button>

          {/* KYC Verification (Disabled) */}
          <button
            disabled
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 opacity-50 cursor-not-allowed select-none"
            title="KYC Verification option is disabled"
          >
            <div className="flex items-center gap-3">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>KYC Verification</span>
            </div>
            <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">Disabled</span>
          </button>
        </nav>

        {/* Bottom Contact Support & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <button
            onClick={() => { setSidebarOpen(false); onNavigate('/support'); }}
            className="w-full text-left text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Contact Support
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP APP BAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0 cursor-pointer"
              aria-label="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Box Removed */}
            <div className="relative max-w-sm w-full hidden">
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SamruddiSave Escrow</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>

            <button onClick={() => setIsProfileModalOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-100 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); handleNavigateToAdminDashboard(); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /> Admin Operations Dashboard
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); setIsProfileModalOpen(true); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" /> Edit Profile Details
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); setActiveTab('kyc'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" /> KYC Status: {user.kyc_status.toUpperCase()}
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        {activeTab === 'home' && (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Welcome Greeting */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">
              Welcome {user.full_name}!
            </h1>
            <button onClick={() => setActiveTab('kyc')} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> KYC Status: {user.kyc_status.toUpperCase()}
            </button>
          </div>

          {/* PRIMARY CARD: Process Pay Run / Active Savings Plan Banner */}
          <div className="bg-white rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800">
                  Active Savings Plan ({plan.name}) 01/01/2026 to 31/12/2026
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {user.kyc_status === 'approved' ? 'APPROVED' : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SAVINGS VALUE</p>
                <p className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
                  ₹{totalGoalTarget.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT DUE DATE</p>
                <p className="font-heading font-extrabold text-base text-slate-900 mt-1">
                  {membership?.next_due_date || '15th of Every Month'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MONTHLY DEPOSIT</p>
                <p className="font-heading font-extrabold text-base text-slate-900 mt-1">
                  ₹{monthlyAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="md:text-right">
                <button
                  onClick={() => setActiveTab('pay')}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  View Details & Pay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Pay your monthly deposit on or before due date. Receipt is generated instantly into your escrow passbook.
            </p>
          </div>

          {/* MIDDLE GRID: Deduction Summary, Employee Summary & To Do Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Deduction & Contribution Summary */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Deduction / Deposit Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Deposit Summary</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">12-Month Plan</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">SAVED</p>
                      <p className="font-bold text-xs text-slate-900">₹{totalSavedSoFar.toLocaleString('en-IN')}</p>
                      <button onClick={() => setActiveTab('pay')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>

                    <div className="space-y-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">BONUS</p>
                      <p className="font-bold text-xs text-slate-900">₹{accruedBonus.toLocaleString('en-IN')}</p>
                      <button onClick={() => setActiveTab('pay')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>

                    <div className="space-y-1">
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Percent className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">LEFT</p>
                      <p className="font-bold text-xs text-slate-900">₹{remainingAmount.toLocaleString('en-IN')}</p>
                      <button onClick={() => setActiveTab('pay')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>
                  </div>
                </div>

                {/* Account Status / Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Account Summary</h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMPLIANCE & PROTECTION</p>
                    <p className="font-heading font-extrabold text-4xl text-emerald-600">
                      100%
                    </p>
                    <p className="text-xs font-semibold text-slate-600">RBI Escrow Guaranteed</p>
                  </div>

                  <div className="text-center pt-2">
                    <button onClick={() => setActiveTab('pay')} className="text-xs font-bold text-blue-600 hover:underline">
                      View Passbook →
                    </button>
                  </div>
                </div>

              </div>

              {/* Savings Growth & Transaction Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Savings Contribution Summary</h3>
                  <span className="text-xs text-slate-400 font-medium">This Year 2026</span>
                </div>

                {/* Visual Progress Bar Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Goal Completed: <strong className="text-blue-600">{goalProgressPct}%</strong></span>
                    <span>Cycles Paid: <strong className="text-emerald-600">{paidCount} / 12 Months</strong></span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(5, goalProgressPct)}%` }}
                    />
                  </div>
                </div>

                {/* Latest Paid Transaction Table */}
                {latestPaid && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Latest Verified Receipt:</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">Month #{latestPaid.cycle_number} Deposit - ₹{latestPaid.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-slate-400">Ref: {latestPaid.transaction_ref}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(latestPaid)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right 1 Column: To Do Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                To Do Tasks
              </h3>

              <div className="space-y-4">
                
                {/* Task 1: Monthly Deposit */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Monthly Deposit Payment</p>
                      <p className="text-[11px] text-slate-500">
                        {paidCount < 12 ? 'Pending cycle deposit due' : 'All 12 cycles completed!'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('pay')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 rounded-lg transition-all text-center cursor-pointer"
                  >
                    {paidCount < 12 ? 'Approve & Pay' : 'View Passbook'}
                  </button>
                </div>

                {/* Task 2: KYC Verification */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">KYC & Nominee Verification</p>
                      <p className="text-[11px] text-slate-500">
                        Status: <strong className="text-emerald-600">{user.kyc_status.toUpperCase()}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 rounded-lg transition-all text-center cursor-pointer"
                  >
                    View Status
                  </button>
                </div>

                {/* Task 3: Gift Hamper */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Gift Hamper Selection</p>
                      <p className="text-[11px] text-slate-500">
                        {allocatedHamper ? allocatedHamper.name : 'Eligible for maturity gift'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hampers')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 rounded-lg transition-all text-center cursor-pointer"
                  >
                    Select Now
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
        )}

        {/* CHIT GROUPS TAB (SamruddiSave Theme) */}
        {activeTab === 'circles' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-50 animate-in fade-in duration-300">
            <div className="bg-white px-4 py-3 flex items-center gap-4 shadow-sm z-10 shrink-0 border-b border-slate-200">
              <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm sm:text-base">{plan.name} Group</h2>
                <p className="text-xs text-slate-500">24 Members • Admin online</p>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
              <div className="flex justify-center mb-2">
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide shadow-xs">Today</span>
              </div>
              
              {chatMessages.map(msg => (
                <div key={msg.id} className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl shadow-sm text-sm text-slate-800 ${msg.isUser ? 'ml-auto bg-[#3B82F6] text-white rounded-br-none' : 'mr-auto bg-white border border-slate-200 rounded-bl-none'}`}>
                  {!msg.isUser && <p className="text-blue-600 font-bold text-xs mb-1">{msg.sender}</p>}
                  {msg.text}
                  <div className={`text-right text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.time} {msg.isUser && <CheckCircle2 className="w-3 h-3 text-blue-200" />}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-3 flex items-center gap-2 shrink-0 border-t border-slate-200">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" 
              />
              <button 
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:bg-blue-700 transition-all active:scale-95"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* MONTHLY DEPOSIT TAB */}
        {activeTab === 'pay' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 py-8">
            <h2 className="font-heading font-extrabold text-2xl text-slate-900">Monthly Deposit</h2>
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-6">Deposit Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Amount Due</p>
                  <p className="text-3xl font-heading font-extrabold text-slate-900">₹{monthlyAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Due Date</p>
                  <p className="text-2xl font-bold text-slate-900">{membership?.next_due_date || '15th of Month'}</p>
                </div>
              </div>
              <div className="mt-8">
                <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm py-4 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Pay Securely via Razorpay
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4">100% Secure & encrypted payment gateway. Automatically synced to your passbook.</p>
              </div>
            </div>
          </div>
        )}

        {/* GIFT HAMPERS TAB */}
        {activeTab === 'hampers' && (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 py-8">
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 mb-6 text-center">Gift Hampers</h2>
            
            {/* Custom Tabs */}
            <div className="flex bg-slate-200 p-1 rounded-2xl mx-auto max-w-md">
              <button 
                onClick={() => setActiveHamperTab('upcoming')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${activeHamperTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Recent / Upcoming
              </button>
              <button 
                onClick={() => setActiveHamperTab('claimed')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${activeHamperTab === 'claimed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Old / Claimed
              </button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-6">
              {activeHamperTab === 'upcoming' ? (
                <div>
                   <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80" alt="Gift Hamper" className="w-full h-48 object-cover" />
                   <div className="p-6 sm:p-8">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Allocated
                        </span>
                     </div>
                     <h3 className="font-heading font-bold text-2xl text-slate-900 mb-3">{allocatedHamper ? allocatedHamper.name : 'Festival Gold Coin (10g 24K)'}</h3>
                     <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                       {allocatedHamper ? allocatedHamper.description : 'A premium 10g 24K Gold coin awarded for successful completion of your savings cycle. Expected delivery upon plan maturity.'}
                     </p>
                     <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer">
                       View Delivery Status
                     </button>
                   </div>
                </div>
              ) : (
                <div>
                   <img src="https://images.unsplash.com/photo-1572916847055-680486016f49?w=800&q=80" alt="Old Gift Hamper" className="w-full h-48 object-cover" />
                   <div className="p-6 sm:p-8">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Claimed & Delivered</span>
                     </div>
                     <h3 className="font-heading font-bold text-2xl text-slate-900 mb-3">Diwali Sweets & Dry Fruits Box</h3>
                     <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                       Premium assortment of traditional sweets and assorted dry fruits. Delivered successfully on Oct 2025.
                     </p>
                     <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                       Already Claimed
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KYC VERIFICATION TAB */}
        {activeTab === 'kyc' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 py-8">
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 text-center mb-2">KYC Verification</h2>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center max-w-lg mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm ${user.kyc_status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                <FileCheck2 className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">Status: {user.kyc_status.toUpperCase()}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {user.kyc_status === 'approved' 
                  ? 'Your KYC documents (Aadhaar & PAN) have been successfully verified by our administrators. Your account is fully active and compliant with RBI regulations.' 
                  : 'Your KYC is currently pending review by our administrators. Please wait 24-48 hours for full account verification.'}
              </p>
              
              <div className="w-full text-left bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Aadhaar Card</span>
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">PAN Card</span>
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Bank Details</span>
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: Edit Profile */}
      {isProfileModalOpen && (
        <UserProfileEditModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onSuccess={() => {
            setUser(stateStore.getCurrentUser());
          }}
        />
      )}

    </div>
  );
};
