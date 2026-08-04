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
  Download,
  FileText
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(stateStore.getUserMembership(user.id));
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getUserContributions(user.id));

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      setMembership(stateStore.getUserMembership(u.id));
      setContributions(stateStore.getUserContributions(u.id));
    });
    return unsubscribe;
  }, []);

  const plan = SAVINGS_PLANS.find((p) => p.id === membership?.plan_id) || SAVINGS_PLANS[0];
  const allocatedHamper = GIFT_HAMPERS.find((h) => h.id === user.allocated_hamper_id);

  const isKYCPending = user.kyc_status !== 'approved';
  const paidCount = contributions.filter((c) => c.status === 'PAID').length;
  const totalSavedSoFar = paidCount * (membership?.monthly_amount || 1000);
  const accruedBonus = Math.round((totalSavedSoFar * plan.cash_bonus_pct) / 100);
  const offlineContribs = contributions.filter((c) => c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer');

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
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Top Banner / Welcome Row */}
      <div className="bg-gradient-to-r from-[#1F1F24] via-[#2D2E38] to-[#4F5DFF] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#4F5DFF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-white/40 shadow-lg shrink-0"
            />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                Account ID: {user.id}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isKYCPending ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}>
                KYC {user.kyc_status.toUpperCase()}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-xs text-slate-300">
              RBI Escrow Custody Account • {plan.name} (₹{plan.monthly_amount.toLocaleString('en-IN')}/mo)
            </p>
          </div>
        </div>

        {/* Deposit Quick Action */}
        <div className="z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {!isKYCPending && (
            <button
              onClick={() => onNavigate('/pay')}
              className="w-full sm:w-auto bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#4F5DFF]/40 flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Make Monthly Deposit
            </button>
          )}
          <button
            onClick={() => onNavigate('/ledger')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-5 rounded-2xl transition-all border border-white/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <History className="w-4 h-4" /> View Ledger
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

        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6C7285]">
            <span>Monthly Commitment</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#1F1F24]">
            ₹{membership?.monthly_amount.toLocaleString('en-IN') || 1000}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            Next Due Date: {membership?.next_due_date || '2026-08-05'}
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

      {/* OFFLINE PAYMENT RECORDING STATUS FOR CUSTOMER */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAF8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Backend Offline Payment Sync
              </span>
              <h3 className="font-heading font-extrabold text-lg text-[#1F1F24] mt-0.5">
                Offline Payments Status
              </h3>
            </div>
          </div>

          <span className="text-xs text-[#6C7285] font-semibold">
            {offlineContribs.length > 0 ? `${offlineContribs.length} Offline Payment(s) Verified` : 'No Offline Payments Recorded'}
          </span>
        </div>

        {offlineContribs.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              The Admin has manually entered and verified the following offline cash/UPI payments for your account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {offlineContribs.map((c) => (
                <div key={c.id} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Month #{c.cycle_number} • {c.payment_method === 'offline_cash' ? '💵 Offline Cash' : '📱 Offline UPI'}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-950">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-700 font-semibold">
                      Ref: <span className="font-mono text-purple-900 font-bold">{c.transaction_ref}</span>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Reconciled By Admin: <span className="font-bold text-slate-900">{c.reconciled_by_admin_name || 'Admin'}</span>
                    </p>
                    {c.admin_notes && (
                      <p className="text-[11px] text-emerald-900 italic bg-emerald-100/70 p-2 rounded-xl">
                        "{c.admin_notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex justify-between items-center border-t border-emerald-200 text-[10px]">
                    <span className="text-emerald-700 font-medium">
                      Verified Date: {c.paid_date ? new Date(c.paid_date).toLocaleDateString() : 'Recorded'}
                    </span>
                    <button
                      onClick={() => handleDownloadReceipt(c)}
                      className="font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>
              Paid in offline cash or via branch QR code? Once your Branch Admin enters your offline payment manually into the backend, it will automatically reflect here as <strong>Verified by Admin</strong>.
            </p>
            <button
              onClick={() => onNavigate('/ledger')}
              className="bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold px-4 py-2 rounded-xl text-xs shrink-0 cursor-pointer"
            >
              View Full Ledger &rarr;
            </button>
          </div>
        )}
      </div>

      {/* VISUAL GOAL JOURNEY & RECENT RECEIPTS */}
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

                <p className="font-heading font-extrabold text-sm text-[#1F1F24]">
                  ₹{plan.monthly_amount.toLocaleString('en-IN')}
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
          <p className="text-xs text-slate-300 max-w-md">
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

    </div>
  );
};
