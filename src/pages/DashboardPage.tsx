import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, Membership, ContributionRecord, GiftHamper } from '../types';
import { SAVINGS_PLANS, GIFT_HAMPERS } from '../data/mockData';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  CreditCard,
  ArrowRight,
  Zap,
  Lock,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle,
  Activity,
  FileText,
  Check,
  Download,
  User,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import { UserProfileEditModal } from '../components/UserProfileEditModal';
import { PrintableReceiptModal } from '../components/PrintableReceiptModal';
import { MemberLedgerView } from '../components/MemberLedgerView';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(user ? stateStore.getUserMembership(user.id) : undefined);
  const [contributions, setContributions] = useState<ContributionRecord[]>(user ? stateStore.getUserContributions(user.id) : []);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewReceiptRecord, setViewReceiptRecord] = useState<ContributionRecord | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'ledger'>('dashboard');

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
        <p className="text-xs text-slate-500">Please sign in to view your micro-savings wallet dashboard.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer"
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
  const offlineContribs = contributions.filter((c) => c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer');

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
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* Top Banner / Welcome Row */}
      <div className="bg-gradient-to-r from-[#1F1F24] via-[#2D2E38] to-[#4F5DFF] text-white p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#4F5DFF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4 z-10 min-w-0 max-w-full">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-white/40 shadow-lg shrink-0"
            />
          )}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full">
              <span className="bg-white/10 text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-xs border border-white/20 truncate max-w-[220px] sm:max-w-none">
                Account ID: {user.id.length > 22 ? `${user.id.substring(0, 18)}...` : user.id}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border shrink-0 ${
                isKYCPending ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}>
                KYC {user.kyc_status.toUpperCase()}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white truncate leading-tight">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              RBI Escrow Custody Account • {plan.name} (₹{plan.monthly_amount.toLocaleString('en-IN')}/mo)
            </p>
          </div>
        </div>

        {/* Deposit & Profile Quick Actions */}
        <div className="z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isKYCPending && (
            <button
              onClick={() => onNavigate('/pay')}
              className="w-full sm:w-auto bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#4F5DFF]/40 flex items-center justify-center gap-2 text-xs cursor-pointer min-h-[44px]"
            >
              <CreditCard className="w-4 h-4" /> Make Monthly Deposit
            </button>
          )}
          
          <button
            onClick={() => setActiveSection(activeSection === 'dashboard' ? 'ledger' : 'dashboard')}
            className={`w-full sm:w-auto font-bold py-3.5 px-5 rounded-2xl transition-all border flex items-center justify-center gap-2 text-xs cursor-pointer min-h-[44px] ${
              activeSection === 'ledger'
                ? 'bg-white text-[#4F5DFF] border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> {activeSection === 'dashboard' ? 'View Passbook Statement' : 'View Main Dashboard'}
          </button>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-4 rounded-2xl transition-all border border-white/20 flex items-center justify-center gap-2 text-xs cursor-pointer min-h-[44px]"
            title="Edit Profile Details"
          >
            <User className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* COMPLIANCE LOCK WARNING CARD WITH 12-HOUR SLA */}
      {isKYCPending && (
        <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-200 text-amber-800 rounded-2xl flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  12-Hour SLA Auto-Verification Protection Active
                </span>
                <h3 className="font-heading font-extrabold text-xl text-amber-950 mt-0.5">
                  Pending Admin Approval
                </h3>
                <p className="text-xs text-amber-800 max-w-xl">
                  Your e-KYC identity documents are submitted. If the Admin does not review within 12 hours, our system automatically verifies and approves your account without delay.
                </p>
              </div>
            </div>
            
            <button
              onClick={async () => {
                await stateStore.fastForward12HourAutoApproval(user.id);
                alert(`⏱️ 12-Hour SLA Auto-Verification triggered! Your account has been verified without manual Admin delay.`);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              ⚡ Test: Fast-Forward 12h SLA Auto-Approve
            </button>
          </div>
        </div>
      )}

      {/* Renewal & Plan Continuation for Next 12 Months (Point 6) */}
      {(paidCount >= 11 || user.pipeline_stage === 'matured' || membership?.status === 'matured') && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              🎉 12-Month Plan Completion & Renewal Portal
            </span>
            <h3 className="font-heading font-extrabold text-xl">
              Ready to Continue Your Savings Plan for the Next 12 Months?
            </h3>
            <p className="text-xs text-teal-100 max-w-lg">
              You are approaching / have completed your 12-month micro-savings milestone. Continue saving to lock in your next guaranteed Gift Perk Hamper & ₹600 bonus!
            </p>
          </div>
          <button
            onClick={() => onNavigate('/plans')}
            className="bg-white text-emerald-900 hover:bg-teal-50 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            Re-Enroll for Next 12 Months <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* REALTIME GOAL SUMMARY & PROGRESS BAR CARD */}
      <div className="nexora-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border border-blue-200/70 inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Supabase Realtime Progress
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
              Goal Progress Summary ({goalProgressPct}% Achieved)
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Target 12-Month Goal:</p>
            <p className="font-heading font-extrabold text-xl text-slate-900">
              ₹{totalGoalTarget.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Supabase Realtime Animated Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Total Saved: <strong className="text-blue-600">₹{totalSavedSoFar.toLocaleString('en-IN')}</strong></span>
            <span>Remaining Target: <strong className="text-slate-500">₹{remainingAmount.toLocaleString('en-IN')}</strong></span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-md shadow-blue-500/20"
              style={{ width: `${Math.max(5, goalProgressPct)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
            <span>Month 1 Started</span>
            <span>{paidCount} of 12 Cycles Paid</span>
            <span>Month 12 Maturity</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6C7285]">
            <span>Total Escrow Saved</span>
            <TrendingUp className="w-4 h-4 text-[#4F5DFF]" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#1F1F24]">
            ₹{totalSavedSoFar.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6C7285]">
            {paidCount} of 12 Cycles Completed
          </p>
        </div>

        {/* Metric 2 */}
        <div className="nexora-card nexora-card-hover p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Next Due Date</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-2xl text-slate-900">
            {membership?.next_due_date || '2026-08-05'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            ₹{monthlyAmount.toLocaleString('en-IN')} Monthly AutoPay
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6C7285]">
            <span>Accrued Cash Bonus</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#4F5DFF]">
            +₹{accruedBonus.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6C7285]">
            {plan.cash_bonus_pct}% Rate at Month 12 Maturity
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6C7285]">
            <span>Savings Streak</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-amber-600">
            {membership?.current_streak || 0} Months
          </p>
          <p className="text-[11px] text-[#6C7285]">
            5-Day Grace Period Safeguard Active
          </p>
        </div>
      </div>

      {/* LATEST LEDGER ENTRY CARD */}
      <div className="nexora-card p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-heading font-extrabold text-base text-slate-900">Latest Ledger Payment Entry</h3>
          </div>
          <button
            onClick={() => onNavigate('/ledger')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View Complete Ledger →
          </button>
        </div>

        {latestPaid ? (
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Payment Date:</p>
              <p className="font-bold text-slate-900 mt-0.5">{latestPaid.payment_date || '2026-08-01'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Amount Paid:</p>
              <p className="font-heading font-extrabold text-base text-slate-900 mt-0.5">₹{latestPaid.amount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Payment Status:</p>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1">
                <Check className="w-3 h-3" /> PAID
              </span>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Transaction ID / Ref:</p>
              <p className="font-mono text-slate-700 text-[11px] font-semibold truncate mt-0.5">
                {latestPaid.escrow_ref || `TXN-${latestPaid.id.substring(0, 10)}`}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">No completed payment records found yet.</p>
        )}
      </div>

      {/* VISUAL GOAL JOURNEY (Month 1 to 12 Progress Grid) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF8] pb-4">
          <div>
            <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              12-Month Ledger Tracking
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
              Visual Goal Journey
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Paid ({paidCount})
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Remaining ({12 - paidCount})
            </span>
          </div>
        </div>

        {/* 12 Month Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, idx) => {
            const cycleNum = idx + 1;
            const contrib = contributions.find((c) => c.cycle_number === cycleNum);
            const isPaid = contrib?.status === 'PAID';
            const isGrace = contrib?.status === 'GRACE_PERIOD';
            const isNext = cycleNum === paidCount + 1;

            return (
              <div
                key={cycleNum}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isPaid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : isGrace
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400'
                    : isNext
                    ? 'bg-[#4F5DFF]/5 border-[#4F5DFF] text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                    : 'bg-[#F7F8FC] border-[#E8EAF8] text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold mb-2">
                  <span>MONTH {cycleNum}</span>
                  {isPaid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isGrace ? (
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>

                <p className="font-heading font-extrabold text-sm text-slate-900">
                  ₹{monthlyAmount.toLocaleString('en-IN')}
                </p>

                <p className="text-[10px] mt-1 font-semibold">
                  {isPaid
                    ? 'PAID'
                    : isGrace
                    ? 'GRACE PERIOD'
                    : isNext
                    ? 'DUE NEXT'
                    : 'UPCOMING'}
                </p>

                {isPaid && contrib && (
                  <button
                    onClick={() => handleDownloadReceipt(contrib)}
                    className="mt-2 text-[10px] font-bold text-[#4F5DFF] hover:underline flex items-center justify-center gap-1 w-full cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Receipt
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gift Hamper Allocation Status */}
      <div className="bg-gradient-to-r from-purple-900 to-[#1F1F24] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Maturity Gift Perk
          </span>
          <h3 className="font-heading font-extrabold text-2xl text-white">
            {allocatedHamper ? allocatedHamper.name : 'Maturity Gift Hamper Unassigned'}
          </h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed font-medium">
            {allocatedHamper
              ? `Assigned by Admin. Delivered at Month 12 maturity.`
              : 'Your Admin will allocate a luxury gift hamper before maturity.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/hampers')}
          className="bg-[#8A7BFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-purple-900/40 text-xs shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Gift className="w-4 h-4" /> Browse Gift Catalogue
        </button>
      </div>

      {/* MEMBER LEDGER VIEW (Toggled via header action) */}
      {activeSection === 'ledger' && (
        <MemberLedgerView userId={user.id} />
      )}

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

      {/* MODAL: Printable Receipt */}
      {viewReceiptRecord && (
        <PrintableReceiptModal
          record={viewReceiptRecord}
          member={user}
          onClose={() => setViewReceiptRecord(null)}
        />
      )}

    </div>
  );
};
