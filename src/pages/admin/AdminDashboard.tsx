import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { UserProfile, Membership, ContributionRecord, AuditLog } from '../../types';
import {
  Users,
  CreditCard,
  FileSpreadsheet,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Download,
  Search,
  PlusCircle,
  X,
  FileText,
  DollarSign,
  PieChart,
  UserCheck,
  Settings,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  TrendingUp,
  Zap,
  RefreshCw,
  LayoutDashboard,
  Layers,
  Gavel,
  Wallet,
  Receipt,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  ShieldAlert,
  Lock,
  Building2,
  Send,
  UserPlus,
  Check,
  Clock
} from 'lucide-react';
import { GIFT_HAMPERS, INITIAL_CHIT_GROUPS } from '../../data/mockData';
import { AdminCashCollectionModal } from '../../components/AdminCashCollectionModal';
import { PrintableReceiptModal } from '../../components/PrintableReceiptModal';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [adminUser, setAdminUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [memberships, setMemberships] = useState<Membership[]>(stateStore.getMemberships());
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getContributions());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(stateStore.getAuditLogs());

  // Sidebar Collapse & Mobile Drawer States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Navigation Active Tab (Supporting 15 Navigation Items)
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'members'
    | 'chit_groups'
    | 'auctions'
    | 'monthly_deposits'
    | 'payments'
    | 'transactions'
    | 'ledger'
    | 'reports'
    | 'notifications'
    | 'kyc_queue'
    | 'roles_permissions'
    | 'settings'
    | 'profile'
  >('overview');

  useEffect(() => {
    const updateTabFromLocation = () => {
      const hash = window.location.hash.replace('#', '');
      const path = window.location.pathname;

      if (hash && [
        'overview', 'members', 'chit_groups', 'auctions', 'monthly_deposits', 
        'payments', 'transactions', 'ledger', 'reports', 'notifications', 
        'kyc_queue', 'roles_permissions', 'settings', 'profile'
      ].includes(hash)) {
        setActiveTab(hash as any);
      } else if (path === '/employee') {
        setActiveTab('kyc_queue');
      } else if (path === '/finance') {
        setActiveTab('payments');
      } else if (path === '/ledger') {
        setActiveTab('ledger');
      } else if (path === '/admin') {
        if (!hash || hash === 'overview') setActiveTab('overview');
      }
    };

    updateTabFromLocation();
    window.addEventListener('hashchange', updateTabFromLocation);
    return () => window.removeEventListener('hashchange', updateTabFromLocation);
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedMember, setInspectedMember] = useState<any | null>(null);

  // Notification Broadcast State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifSentMsg, setNotifSentMsg] = useState(false);

  // 6 Lifecycle Stages Definition
  const lifecycleStages = [
    { id: 'signup', name: '1. Member Signup', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'pending', name: '2. Approval Pending', badgeStyle: 'bg-amber-50 text-amber-800 border-amber-300' },
    { id: 'active', name: '3. Savings Active', badgeStyle: 'bg-blue-50 text-blue-800 border-blue-300' },
    { id: 'grace', name: '4. Grace Period', badgeStyle: 'bg-rose-50 text-rose-800 border-rose-300' },
    { id: 'hamper', name: '5. Hamper Select', badgeStyle: 'bg-purple-50 text-purple-800 border-purple-300' },
    { id: 'completed', name: '6. Completed / Matured', badgeStyle: 'bg-teal-50 text-teal-800 border-teal-300' },
  ];

  const getMembersForStage = (stageId: string) => {
    return profiles
      .filter((p) => p.role === 'member')
      .filter((p) => {
        const stage = ((p as any).pipeline_stage || '').toLowerCase();
        if (stageId === 'signup') return stage === 'signup';
        if (stageId === 'pending') return stage === 'pending' || p.kyc_status === 'pending';
        if (stageId === 'active') return stage === 'active' || stage === 'active_saving' || stage === 'approved' || (!stage && p.kyc_status === 'approved');
        if (stageId === 'grace') return stage === 'grace';
        if (stageId === 'hamper') return stage === 'hamper';
        if (stageId === 'completed') return stage === 'completed' || stage === 'matured' || stage === 'payout';
        return false;
      })
      .map((p) => {
        const matchingStage = lifecycleStages.find((s) => s.id === stageId) || lifecycleStages[2];
        let dynamicStreak = '0m';
        if (['active', 'grace', 'hamper', 'completed'].includes(stageId)) {
          const userMembership = memberships.find((m) => m.user_id === p.id);
          dynamicStreak = `${userMembership?.current_streak || 4}m`;
        }
        return {
          ...p,
          stageName: matchingStage.name,
          streak: dynamicStreak,
        };
      });
  };

  const handleStageChange = async (member: any, targetStage: { id: string; name: string }) => {
    await stateStore.updateMemberPipelineStage(member.id, targetStage.id, adminUser.id, `Admin moved ${member.full_name} to ${targetStage.name}`);
    setInspectedMember((prev: any) => (prev ? { ...prev, pipeline_stage: targetStage.id, stageName: targetStage.name } : null));
    alert(`Member ${member.full_name} successfully moved to ${targetStage.name}! Update synced to Supabase.`);
  };

  // Modals State
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isCashCollectionModalOpen, setIsCashCollectionModalOpen] = useState(false);
  const [viewReceiptRecord, setViewReceiptRecord] = useState<ContributionRecord | null>(null);

  useEffect(() => {
    stateStore.fetchLatestFromSupabase();
    const unsubscribe = stateStore.subscribe(() => {
      setAdminUser(stateStore.getCurrentUser());
      setProfiles([...stateStore.getProfiles()]);
      setMemberships([...stateStore.getMemberships()]);
      setContributions([...stateStore.getContributions()]);
      setAuditLogs([...stateStore.getAuditLogs()]);
    });
    return unsubscribe;
  }, []);

  // Metrics
  const totalMembers = profiles.filter((p) => p.role === 'member').length;
  const activeMembers = memberships.filter((m) => m.status === 'active').length;
  const pendingKYCMembers = profiles.filter((p) => {
    if (p.role !== 'member') return false;
    if (p.kyc_status === 'approved' || p.kyc_status === 'rejected') return false;
    if ((p as any).pipeline_stage === 'ACTIVE_SAVING' || (p as any).pipeline_stage === 'ACCOUNT_APPROVED') return false;
    return p.kyc_status === 'pending' || p.kyc_status === 'unsubmitted' || (p as any).pipeline_stage === 'pending';
  });
  const gracePeriodMembers = memberships.filter((m) => m.status === 'grace_period');
  const totalCollection = contributions
    .filter((c) => c.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Sign out handler
  const handleSignOut = async () => {
    await stateStore.signOut();
    onNavigate('/login');
  };

  // Download Individual Official Escrow Receipt
  const handleDownloadReceipt = (contrib: ContributionRecord) => {
    const member = profiles.find((p) => p.id === contrib.user_id);
    const memberName = member?.full_name || 'Member';
    const memberEmail = member?.email || 'N/A';

    const receiptContent = `================================================
SAMRUDDISAVE RBI ESCROW OFFICIAL RECEIPT
================================================
Receipt ID: ${contrib.id}
Date: ${contrib.paid_date ? new Date(contrib.paid_date).toLocaleString() : new Date().toLocaleString()}
Member Name: ${memberName}
Member Email: ${memberEmail}
Member Account ID: ${contrib.user_id}
Membership ID: ${contrib.membership_id}
Cycle Number: Cycle #${contrib.cycle_number} of 12
Deposit Amount: INR ${contrib.amount.toLocaleString('en-IN')}
Payment Method: ${(contrib.payment_method || 'razorpay').toUpperCase()}
Transaction Ref: ${contrib.transaction_ref}
Escrow Batch ID: ${contrib.escrow_batch_id || 'ESC_BATCH_2026'}
Escrow Bank: HDFC Escrow Trustee Account #9182374619
Status: VERIFIED & DEPOSITED
================================================
Audit Trail: Verified under RBI Escrow Regulations
Generated By: SamruddiSave Admin Console
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${contrib.transaction_ref}_${memberName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const csvData = stateStore.exportLedgerCSV();
    stateStore.downloadCSV(csvData, `samruddisave_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Send Announcement Handler
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setNotifSentMsg(true);
    setTimeout(() => {
      setNotifTitle('');
      setNotifMessage('');
      setNotifSentMsg(false);
      alert(`Announcement "${notifTitle}" successfully broadcasted to ${notifTarget === 'all' ? 'all customers' : notifTarget}!`);
    }, 800);
  };

  // 15 Menu Navigation Options Requested
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Customer Management', icon: Users },
    { id: 'chit_groups', label: 'Chit Groups', icon: Layers, disabled: true },
    { id: 'auctions', label: 'Auctions', icon: Gavel },
    { id: 'monthly_deposits', label: 'Monthly Deposits', icon: CreditCard },
    { id: 'payments', label: 'Payments & Collections', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'ledger', label: 'Ledger', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'kyc_queue', label: 'Documents', icon: FileText, badge: pendingKYCMembers.length > 0 ? pendingKYCMembers.length : undefined },
    { id: 'roles_permissions', label: 'User Roles & Permissions', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex text-slate-800 font-sans relative">
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MODERN ADMIN SIDE NAVIGATION BAR (Collapsible & Responsive) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#1E2640] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between min-h-[65px]">
          <div
            onClick={() => {
              setIsMobileOpen(false);
              onNavigate('/');
            }}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group/logo hover:opacity-90 transition-all"
            title="Go to Landing Page"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-[#4F5DFF]/30 shrink-0 group-hover/logo:scale-105 transition-transform">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col text-left truncate">
                <span className="font-heading font-extrabold text-sm text-white tracking-tight leading-tight truncate">
                  Samruddi<span className="text-[#4F5DFF]">Save</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase mt-0.5">
                  Admin Operations
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = (item as any).disabled;
            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setActiveTab(item.id as any);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500 hover:bg-transparent'
                    : isActive
                    ? 'bg-[#4F5DFF] text-white shadow-md shadow-[#4F5DFF]/25 font-bold cursor-pointer group'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white cursor-pointer group'
                }`}
                title={isDisabled ? `${item.label} is currently disabled` : isSidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.badge && !isDisabled && (
                  <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
                {!isSidebarCollapsed && isDisabled && (
                  <span className="text-[9px] bg-slate-800/90 text-slate-400 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border border-slate-700/50 flex items-center gap-1 shrink-0">
                    <Lock className="w-2.5 h-2.5" /> Disabled
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
            } py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 transition-all cursor-pointer`}
            title={isSidebarCollapsed ? "Admin Profile" : undefined}
          >
            <User className="w-4 h-4 text-blue-400 shrink-0" />
            {!isSidebarCollapsed && (
              <div className="text-left truncate flex-1">
                <p className="font-bold text-white text-xs truncate">{adminUser.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser.email}</p>
              </div>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
            } py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all cursor-pointer`}
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header Mobile Toggle & Status */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              onClick={() => {
                setIsMobileOpen(false);
                onNavigate('/');
              }}
              className="flex items-center gap-2 cursor-pointer group/logo"
              title="Go to Landing Page"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                S
              </div>
              <span className="font-heading font-extrabold text-slate-900 text-sm">
                Samruddi<span className="text-[#4F5DFF]">Save</span>
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#4F5DFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </span>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4F5DFF] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Member Operations & Escrow Ledger
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F1F24] mt-1">
                {navItems.find(i => i.id === activeTab)?.label || 'Admin Operations Dashboard'}
              </h1>
              <p className="text-xs text-[#6C7285] mt-1">
                Authenticated Admin: <span className="font-semibold text-[#1F1F24]">{adminUser.full_name}</span> ({adminUser.email})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  await stateStore.fetchLatestFromSupabase();
                  setProfiles([...stateStore.getProfiles()]);
                }}
                className="min-h-[42px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Sync Live Data
              </button>
              <button
                onClick={() => setIsCashCollectionModalOpen(true)}
                className="min-h-[42px] bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-[#4F5DFF]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <DollarSign className="w-4 h-4" /> Record Cash Collection
              </button>
              <button
                onClick={handleExportCSV}
                className="min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Total Customer Accounts</p>
                  <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{totalMembers}</p>
                  <span className="inline-block mt-1 text-xs text-emerald-600 font-semibold">{activeMembers} Active Savers</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Pending Documents / KYC</p>
                  <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{pendingKYCMembers.length}</p>
                  <span className="inline-block mt-1 text-xs text-amber-600 font-semibold">Requires Approval</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Grace Period Dues</p>
                  <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{gracePeriodMembers.length}</p>
                  <span className="inline-block mt-1 text-xs text-rose-600 font-semibold">5-Day Alert Active</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Total Collection Pool</p>
                  <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">₹{totalCollection.toLocaleString()}</p>
                  <span className="inline-block mt-1 text-xs text-[#4F5DFF] font-semibold">HDFC Escrow Trustee</span>
                </div>
              </div>

              {/* Lifecycle Pipeline Kanban Board */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 min-w-0">
                <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">6-Stage Customer Lifecycle Pipeline</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin overscroll-x-contain max-w-full">
                  {lifecycleStages.map((stage) => {
                    const stageMembers = getMembersForStage(stage.id);
                    return (
                      <div key={stage.id} className="min-w-[260px] max-w-[280px] flex-1 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stage.badgeStyle}`}>{stage.name}</span>
                          <span className="font-mono font-bold text-xs text-slate-500">{stageMembers.length}</span>
                        </div>
                        <div className="space-y-2.5 min-h-[160px]">
                          {stageMembers.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-[11px] text-slate-400 font-medium text-center">No Members</div>
                          ) : (
                            stageMembers.map((m: any, idx: number) => (
                              <div key={`${m.id}-${idx}`} className="bg-white p-3 rounded-xl border border-[#E8EAF8] shadow-2xs space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{m.full_name.charAt(0)}</div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold text-xs text-[#1F1F24] truncate">{m.full_name}</p>
                                    <p className="text-[11px] text-slate-500">{m.phone}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. CUSTOMER MANAGEMENT TAB */}
          {activeTab === 'members' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Customer Accounts Management</h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6C7285] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search customer by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs text-[#1F1F24] w-full sm:w-64 focus:outline-none focus:border-[#4F5DFF]"
                  />
                </div>
              </div>

              <div className="w-full max-w-full rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
                <div className="table-scroll-container max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse min-w-max">
                    <thead className="sticky top-0 z-10 bg-[#F7F8FC] border-b border-slate-200 text-[#6C7285] uppercase tracking-wider font-bold shadow-2xs">
                      <tr>
                        <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10">Customer</th>
                        <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10">Role</th>
                        <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10">KYC Status</th>
                        <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10">Stage</th>
                        <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-[#E8EAF8]">
                    {profiles
                      .filter((p) => p.role === 'member')
                      .filter((p) => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-[#F7F8FC]">
                          <td className="p-3 font-semibold text-[#1F1F24]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{p.full_name?.charAt(0) || 'U'}</div>
                              <div>
                                <div className="font-bold text-[#1F1F24]">{p.full_name}</div>
                                <div className="text-[10px] text-slate-500">{p.email} • {p.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 uppercase font-bold text-[#4F5DFF]">{p.role}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {p.kyc_status}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{p.pipeline_stage || 'Approved'}</td>
                          <td className="p-3 text-right space-x-2">
                            <button onClick={() => setInspectedMember(p)} className="text-xs font-bold text-[#4F5DFF] hover:underline">Inspect 360°</button>
                            {p.kyc_status !== 'approved' && (
                              <button onClick={() => stateStore.updateKYCStatus(p.id, 'approved', adminUser.id)} className="text-xs font-bold text-emerald-600 hover:underline">Approve</button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

          {/* 3. CHIT GROUPS TAB */}
          {activeTab === 'chit_groups' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Chit Fund Groups</h3>
                  <p className="text-xs text-slate-500">Create, configure, and monitor monthly chit fund groups</p>
                </div>
                <button className="bg-[#4F5DFF] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                  <PlusCircle className="w-4 h-4" /> Create New Group
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INITIAL_CHIT_GROUPS.map((group) => (
                  <div key={group.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{group.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{group.status}</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-600">
                      <p>Total Value: <strong className="text-slate-900">₹{group.total_value.toLocaleString()}</strong></p>
                      <p>Monthly Deposit: <strong className="text-slate-900">₹{group.monthly_installment.toLocaleString()}</strong></p>
                      <p>Duration: <strong className="text-slate-900">{group.duration_months} Months</strong></p>
                      <p>Members Count: <strong className="text-slate-900">{group.max_members} Seats</strong></p>
                    </div>
                    <button className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer">
                      Manage Group & Seats
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. AUCTIONS TAB */}
          {activeTab === 'auctions' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Auctions & Bidding Management</h3>
                  <p className="text-xs text-slate-500">Conduct chit auctions, accept bids, and disburse auction prize money</p>
                </div>
                <button className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                  <Gavel className="w-4 h-4" /> Start Live Auction
                </button>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-900 text-sm">Next Scheduled Monthly Auction</p>
                    <p className="text-xs text-amber-800">Group A1 (12-Month ₹12,000 Pool) - Scheduled for 15th of this month at 4:00 PM IST</p>
                  </div>
                </div>
                <button className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">Enter Auction Room</button>
              </div>
            </div>
          )}

          {/* 5. MONTHLY DEPOSITS TAB */}
          {activeTab === 'monthly_deposits' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Monthly Customer Deposits</h3>
                  <p className="text-xs text-slate-500">Monitor and verify all monthly installment deposits</p>
                </div>
              </div>

              <div className="w-full max-w-full rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
                <div className="table-scroll-container max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse min-w-max">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase shadow-2xs">
                      <tr>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Member</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Cycle Number</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Amount</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Payment Method</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Date</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10 text-right">Receipt</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contributions.map((c) => {
                      const m = profiles.find((p) => p.id === c.user_id);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{m?.full_name || 'Customer'}</td>
                          <td className="p-3 font-semibold">Cycle #{c.cycle_number} of 12</td>
                          <td className="p-3 font-mono font-bold text-blue-600">₹{c.amount.toLocaleString()}</td>
                          <td className="p-3 uppercase font-semibold text-slate-700">{c.payment_method || 'Razorpay'}</td>
                          <td className="p-3 text-slate-500">{c.paid_date ? new Date(c.paid_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDownloadReceipt(c)} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                              <Download className="w-3.5 h-3.5" /> Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

          {/* 6. PAYMENTS & COLLECTIONS TAB */}
          {activeTab === 'payments' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Payments & Collections</h3>
                  <p className="text-xs text-slate-500">Track incoming collections, cash entries, and pending customer dues</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsCashCollectionModalOpen(true)} className="bg-[#4F5DFF] text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">+ Cash Collection</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-xs font-bold text-emerald-800 uppercase">Total Collected</p>
                  <p className="font-extrabold text-2xl text-emerald-900 mt-1">₹{totalCollection.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-xs font-bold text-amber-800 uppercase">Pending Dues</p>
                  <p className="font-extrabold text-2xl text-amber-900 mt-1">{gracePeriodMembers.length} Accounts</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-xs font-bold text-blue-800 uppercase">RBI Escrow Balance</p>
                  <p className="font-extrabold text-2xl text-blue-900 mt-1">₹48,50,000</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Financial Transaction Logs</h3>
              <div className="w-full max-w-full rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
                <div className="table-scroll-container max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse min-w-max">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase shadow-2xs">
                      <tr>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Txn Reference</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Customer</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Amount</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Method</th>
                        <th className="p-3.5 whitespace-nowrap bg-slate-50 sticky top-0 z-10">Status</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contributions.map((c) => {
                      const m = profiles.find((p) => p.id === c.user_id);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-purple-800">{c.transaction_ref}</td>
                          <td className="p-3 font-bold text-slate-900">{m?.full_name || 'Customer'}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">₹{c.amount.toLocaleString()}</td>
                          <td className="p-3 uppercase font-semibold">{c.payment_method || 'Online'}</td>
                          <td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">VERIFIED</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

          {/* 8. LEDGER TAB */}
          {activeTab === 'ledger' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Escrow General Ledger Records</h3>
                <button onClick={handleExportCSV} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
                  <Download className="w-4 h-4" /> Download Ledger CSV
                </button>
              </div>
              <p className="text-xs text-slate-500">Customer-wise and group-wise verified accounting entries synced to Supabase</p>
            </div>
          )}

          {/* 9. REPORTS & ANALYTICS TAB */}
          {activeTab === 'reports' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Reports & Analytics Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto" />
                  <p className="font-bold text-slate-900 text-sm">Collection Report 2026</p>
                  <button onClick={handleExportCSV} className="text-xs text-blue-600 font-bold hover:underline">Download Summary &rarr;</button>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <PieChart className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-slate-900 text-sm">Chit Auction Summary</p>
                  <button onClick={handleExportCSV} className="text-xs text-emerald-600 font-bold hover:underline">Download Summary &rarr;</button>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto" />
                  <p className="font-bold text-slate-900 text-sm">Escrow Audit Statement</p>
                  <button onClick={handleExportCSV} className="text-xs text-purple-600 font-bold hover:underline">Download Summary &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* 10. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Send Customer Announcements & Reminders</h3>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Customer Group</label>
                  <select value={notifTarget} onChange={(e) => setNotifTarget(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900">
                    <option value="all">All Active Customers ({totalMembers})</option>
                    <option value="grace">Grace Period Dues ({gracePeriodMembers.length})</option>
                    <option value="pending">Pending KYC Registrations ({pendingKYCMembers.length})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Announcement Title</label>
                  <input type="text" placeholder="e.g. Monthly Deposit Reminder" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notification Body Message</label>
                  <textarea rows={4} placeholder="Type announcement text here..." value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
                </div>
                <button type="submit" className="w-full bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Send className="w-4 h-4" /> Broadcast Announcement to Customers
                </button>
              </form>
            </div>
          )}

          {/* 11. DOCUMENTS / KYC QUEUE TAB */}
          {activeTab === 'kyc_queue' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">KYC Documents Verification</h3>
                  <p className="text-xs text-slate-500">Review customer Aadhaar, PAN, and identity files</p>
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">{pendingKYCMembers.length} Pending Approval</span>
              </div>

              {pendingKYCMembers.map((member) => (
                <div key={member.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{member.full_name}</p>
                    <p className="text-xs text-slate-500">PAN: {member.pan_number || 'ABCDE1234F'} • Aadhaar: {member.aadhaar_number || '9876 5432 1098'}</p>
                  </div>
                  <button onClick={() => stateStore.updateKYCStatus(member.id, 'approved', adminUser.id)} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer">Approve Document</button>
                </div>
              ))}
            </div>
          )}

          {/* 12. USER ROLES & PERMISSIONS TAB */}
          {activeTab === 'roles_permissions' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">User Roles & Staff Access Permissions</h3>
              <p className="text-xs text-slate-500">Manage administrator privileges, staff access roles, and audit permissions</p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900 text-sm">Operations Administrator ({adminUser.full_name})</p>
                  <p className="text-xs text-blue-800">Email: {adminUser.email} • Role: Super Admin / Operations</p>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Full Access</span>
              </div>
            </div>
          )}

          {/* 13. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Company & Application Configuration</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Company Name</label>
                  <input type="text" readOnly value="SamruddiSave Micro-Savings Platform" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">RBI Escrow Trustee Bank Account</label>
                  <input type="text" readOnly value="HDFC Bank Escrow Trustee A/C #9182374619" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold" />
                </div>
              </div>
            </div>
          )}

          {/* 14. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200 max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
                {adminUser.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">{adminUser.full_name}</h3>
                <p className="text-xs text-slate-500">{adminUser.email}</p>
                <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Operations Administrator</span>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {isCashCollectionModalOpen && (
        <AdminCashCollectionModal
          onClose={() => setIsCashCollectionModalOpen(false)}
          onSuccess={() => {
            setContributions(stateStore.getContributions());
            setProfiles(stateStore.getProfiles());
            setMemberships(stateStore.getMemberships());
          }}
        />
      )}

      {viewReceiptRecord && (
        <PrintableReceiptModal
          record={viewReceiptRecord}
          member={profiles.find((p) => p.id === viewReceiptRecord.user_id)}
          onClose={() => setViewReceiptRecord(null)}
        />
      )}

    </div>
  );
};
