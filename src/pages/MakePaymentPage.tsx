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
    if (membership) {
      stateStore.recordPaymentWithMembership(
        membership.id,
        paymentId,
        'razorpay',
        undefined,
        `Razorpay order payment processed for membership ${membership.id}`
      );
    } else {
      stateStore.processMonthlyDeposit(user.id, plan.monthly_amount);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Monthly Micro-Deposit Execution
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
          Execute Month {nextCycle} Contribution
        </h1>
        <p className="text-xs text-[#6C7285] max-w-md mx-auto">
          Deposited directly into your Tripartite RBI Escrow Custody Account
        </p>
      </div>

      {/* Main Payment Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-xl space-y-6">
        
        {/* Deposit Info */}
        <div className="bg-gradient-to-r from-[#1F1F24] to-[#4F5DFF] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-slate-300">Cycle {nextCycle} of 12</span>
            <h3 className="font-heading font-extrabold text-3xl text-white mt-0.5">
              ₹{(membership?.monthly_amount || plan.monthly_amount).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-blue-200 mt-1">
              {plan.name} • {plan.cash_bonus_pct}% Year-End Cash Bonus
            </p>
          </div>

          <button
            onClick={() => setPaymentModalOpen(true)}
            className="w-full sm:w-auto bg-white text-[#4F5DFF] hover:bg-slate-100 font-extrabold py-3.5 px-8 rounded-2xl transition-all shadow-lg text-xs flex items-center justify-center gap-2"
          >
            Pay Now via Razorpay <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Day Grace Period Safeguard Note */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            5-Day Grace Window Safeguard Active
          </div>
          <p className="text-emerald-800 leading-relaxed">
            If a due date is missed, your account enters a penalty-free 5-day grace window. Paying within Days 1–5 preserves your savings streak (<strong className="text-emerald-900">current streak: {membership?.current_streak || 0} months</strong>).
          </p>
        </div>

        {/* Offline Payment Information Notice */}
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-2 text-xs text-purple-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              Paying via Offline Cash or Branch UPI?
            </div>
            <span className="bg-purple-200 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Admin Manual Reconciliation
            </span>
          </div>
          <p className="text-purple-800 leading-relaxed">
            If you pay cash at a branch office or scan a local branch QR code, give your <strong>Membership ID ({membership?.id || user.id})</strong> to the Admin. Once the Admin records your offline deposit in the backend system, it will instantly show in your Dashboard and Ledger with <strong>Verified by Admin</strong> status.
          </p>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="font-heading font-bold text-sm text-[#1F1F24] mb-3">Escrow Deposit Breakdown:</h4>
          <div className="space-y-2 text-xs">
            {contributions.map((c) => {
              const isOffline = c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer';
              return (
                <div key={c.id} className="bg-[#F7F8FC] border border-[#E8EAF8] p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1F1F24]">Cycle {c.cycle_number}</span>
                    <span className="text-[11px] text-[#6C7285] ml-2 font-mono">Ref: {c.transaction_ref}</span>
                    {isOffline && (
                      <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Offline ({c.payment_method === 'offline_cash' ? 'Cash' : 'UPI'}) • Verified by {c.reconciled_by_admin_name || 'Admin'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#1F1F24]">₹{c.amount.toLocaleString('en-IN')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })}
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
