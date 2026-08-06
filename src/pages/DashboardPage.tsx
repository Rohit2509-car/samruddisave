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
  FileSpreadsheet
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
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col lg:flex-row text-slate-800 font-sans">
      
      {/* LEFT SIDEBAR NAVIGATION (Matching Reference Dark Sidebar) */}
      <aside className="w-full lg:w-64 bg-[#1E2640] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
              S
            </div>
            <span className="font-heading font-extrabold text-lg text-white tracking-tight">
              Samruddi<span className="text-blue-400">Save</span>
            </span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3B82F6] text-white shadow-md font-bold transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('/circles')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Chit Groups</span>
          </button>

          <button
            onClick={() => onNavigate('/pay')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Monthly Deposit</span>
          </button>

          <button
            onClick={() => onNavigate('/reports')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Passbook & Ledger</span>
          </button>

          <button
            onClick={() => onNavigate('/hampers')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4 shrink-0" />
            <span>Gift Hampers</span>
          </button>

          <button
            onClick={() => onNavigate('/kyc')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>KYC Verification</span>
          </button>
        </nav>

        {/* Bottom Contact Support */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => onNavigate('/support')}
            className="w-full text-left text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Contact Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP APP BAR (Matching Reference Top Header) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deposits, receipts, plans..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {user.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Welcome Greeting */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">
              Welcome {user.full_name}!
            </h1>
            <button onClick={() => onNavigate('/kyc')} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> KYC Status: {user.kyc_status.toUpperCase()}
            </button>
          </div>

          {/* PRIMARY CARD: Process Pay Run / Active Savings Plan Banner (Matching Reference Layout) */}
          <div className="bg-white rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 p-6 shadow-sm space-y-4">
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
                  onClick={() => onNavigate('/pay')}
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

          {/* MIDDLE GRID: Deduction Summary, Employee Summary & To Do Tasks (Matching Reference) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Deduction & Contribution Summary */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Deduction / Deposit Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
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
                      <button onClick={() => onNavigate('/reports')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>

                    <div className="space-y-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">BONUS</p>
                      <p className="font-bold text-xs text-slate-900">₹{accruedBonus.toLocaleString('en-IN')}</p>
                      <button onClick={() => onNavigate('/reports')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>

                    <div className="space-y-1">
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Percent className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">LEFT</p>
                      <p className="font-bold text-xs text-slate-900">₹{remainingAmount.toLocaleString('en-IN')}</p>
                      <button onClick={() => onNavigate('/reports')} className="text-[10px] text-blue-600 font-bold hover:underline">View Details</button>
                    </div>
                  </div>
                </div>

                {/* Account Status / Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
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
                    <button onClick={() => onNavigate('/reports')} className="text-xs font-bold text-blue-600 hover:underline">
                      View Passbook →
                    </button>
                  </div>
                </div>

              </div>

              {/* Savings Growth & Transaction Summary (Matching Reference Bottom Chart Card) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
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

            {/* Right 1 Column: To Do Tasks (Matching Reference Right Column) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
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
                    onClick={() => onNavigate('/pay')}
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
                    onClick={() => onNavigate('/kyc')}
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
                    onClick={() => onNavigate('/hampers')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 rounded-lg transition-all text-center cursor-pointer"
                  >
                    Select Now
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

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
