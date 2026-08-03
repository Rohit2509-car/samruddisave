import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { RazorpayPaymentModal } from '../components/RazorpayPaymentModal';
import { UserProfile, Membership, ContributionRecord } from '../types';
import { SAVINGS_PLANS } from '../data/mockData';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  AlertTriangle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface MakePaymentPageProps {
  onNavigate: (path: string) => void;
}

export const MakePaymentPage: React.FC<MakePaymentPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(stateStore.getUserMembership(user.id));
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getUserContributions(user.id));
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
  const paidCount = contributions.filter((c) => c.status === 'PAID').length;
  const nextCycle = paidCount + 1;

  const handlePaymentSuccess = (paymentId: string) => {
    stateStore.processMonthlyDeposit(user.id, membership?.monthly_amount || plan.monthly_amount);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2.5">
        <span className="bg-blue-50 text-blue-600 border border-blue-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Monthly Micro-Deposit Execution
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
          Execute Month {nextCycle} Contribution
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
          Deposited directly into your Tripartite RBI Escrow Custody Account
        </p>
      </div>

      {/* Main Payment Card */}
      <div className="nexora-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        
        {/* Deposit Info */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cycle {nextCycle} of 12</span>
            <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
              ₹{(membership?.monthly_amount || plan.monthly_amount).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              {plan.name} • {plan.cash_bonus_pct}% Year-End Cash Bonus
            </p>
          </div>

          <button
            onClick={() => setPaymentModalOpen(true)}
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-slate-50 font-extrabold py-3.5 px-8 rounded-full transition-all shadow-lg text-xs flex items-center justify-center gap-2.5 group"
          >
            <span>Pay Now via Razorpay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 5-Day Grace Period Safeguard Note */}
        <div className="bg-emerald-50 border border-emerald-200 p-4.5 rounded-2xl space-y-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            5-Day Grace Window Safeguard Active
          </div>
          <p className="text-emerald-800 leading-relaxed">
            If a due date is missed, your account enters a penalty-free 5-day grace window. Paying within Days 1–5 preserves your savings streak (<strong className="text-emerald-950">current streak: {membership?.current_streak || 0} months</strong>).
          </p>
        </div>

        {/* Payment History */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-slate-900">Escrow Deposit Breakdown:</h4>
          <div className="space-y-2.5 text-xs">
            {contributions.map((c) => (
              <div key={c.id} className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Cycle {c.cycle_number}</span>
                  <span className="text-[11px] text-slate-500 ml-3 font-mono">Ref: {c.transaction_ref}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      <RazorpayPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={membership?.monthly_amount || plan.monthly_amount}
        planName={plan.name}
        cycleNumber={nextCycle}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
};

