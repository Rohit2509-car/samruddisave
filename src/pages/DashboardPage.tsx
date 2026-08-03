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
  AlertCircle
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

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Top Banner / Welcome Row */}
      <div className="bg-gradient-to-r from-[#1F1F24] via-[#2D2E38] to-[#4F5DFF] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#4F5DFF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
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

        {/* Deposit Quick Action */}
        <div className="z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {!isKYCPending && (
            <button
              onClick={() => onNavigate('/pay')}
              className="w-full sm:w-auto bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#4F5DFF]/40 flex items-center justify-center gap-2 text-xs"
            >
              <CreditCard className="w-4 h-4" /> Make Monthly Deposit
            </button>
          )}
          <button
            onClick={() => onNavigate('/ledger')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-5 rounded-2xl border border-white/20 transition-colors text-xs text-center"
          >
            Escrow Ledger
          </button>
        </div>
      </div>

      {/* COMPLIANCE LOCK WARNING CARD (Step 4 & Section 3.1 PDF) */}
      {isKYCPending && (
        <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-200 text-amber-800 rounded-2xl flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Compliance Guard Active
                </span>
                <h3 className="font-heading font-extrabold text-xl text-amber-950 mt-0.5">
                  Pending Officer Sign-off
                </h3>
                <p className="text-xs text-amber-800">
                  Your PAN/Aadhaar OCR documents are pending manual review by an MRM Officer on <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">/employee</code> portal.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                stateStore.updateKYCStatus(user.id, 'approved', 'Demo MRM Officer');
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 hidden sm:block"
            >
              ⚡ Officer Approval Simulation
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>OCR Confidence: <strong className="text-emerald-600">99.8% Match Verified</strong></span>
            <span>Pipeline Stage: <strong className="text-amber-700">{user.pipeline_stage}</strong></span>
            <button
              onClick={() => onNavigate('/kyc')}
              className="text-[#4F5DFF] font-bold underline text-xs"
            >
              Review Uploaded KYC Files →
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
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
        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6C7285]">
            <span>Monthly Commitment</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#1F1F24]">
            ₹{membership?.monthly_amount.toLocaleString('en-IN') || 1000}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            Next Due: {membership?.next_due_date || '2026-08-05'}
          </p>
        </div>

        {/* Metric 3 */}
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

        {/* Metric 4 */}
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
              ? `Assigned by MRM Officer (${user.allocated_by_admin || 'Staff'}). Delivered at Month 12 maturity.`
              : 'Your MRM Officer will allocate a ₹4,500 luxury gift hamper before maturity.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/hampers')}
          className="bg-[#8A7BFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-purple-900/40 text-xs shrink-0 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" /> Browse Gift Catalogue
        </button>
      </div>

    </div>
  );
};
