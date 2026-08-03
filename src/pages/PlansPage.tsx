import React, { useState } from 'react';
import { SAVINGS_PLANS } from '../data/mockData';
import { stateStore } from '../store/StateStore';
import { ShieldCheck, CheckCircle2, Gift, ArrowRight, Sparkles } from 'lucide-react';

interface PlansPageProps {
  onNavigate: (path: string) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({ onNavigate }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-2000');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    onNavigate('/kyc');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <span className="bg-blue-50 text-blue-600 border border-blue-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Fixed 12-Month Micro-Savings Plans
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
          Choose Your Savings Commitment
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          100% principal protection held in RBI Escrow Custody Account with guaranteed cash bonus & luxury gift hampers
        </p>
      </div>

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SAVINGS_PLANS.map((plan) => {
          const isFeatured = plan.monthly_amount === 2000;

          return (
            <div
              key={plan.id}
              className={`nexora-card rounded-3xl p-7 sm:p-8 space-y-6 flex flex-col justify-between transition-all relative ${
                isFeatured
                  ? 'border-blue-600 ring-4 ring-blue-500/15 shadow-2xl scale-[1.02] bg-white'
                  : 'border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200'
              }`}
            >
              {isFeatured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md shadow-blue-500/30">
                  Most Popular Choice
                </span>
              )}

              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{plan.gift_hamper_tier}</span>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">{plan.name}</h3>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-4xl text-slate-900">
                      ₹{plan.monthly_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                </div>

                {/* Return Specs */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-900">12 Months Fixed</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Total Principal Saved:</span>
                    <span className="font-bold text-slate-900">₹{plan.total_principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Cash Bonus ({plan.cash_bonus_pct}% Rate):</span>
                    <span className="font-bold text-emerald-600">+₹{plan.bonus_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Gift Hamper Included:</span>
                    <span className="font-bold text-purple-600">₹4,500 Retail Value</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-extrabold text-blue-600 bg-blue-50/80 px-3.5 rounded-2xl border border-blue-200/60">
                    <span>Maturity Yield:</span>
                    <span>₹{plan.total_maturity_value.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 pt-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> RBI Escrow Custody Guarantee
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 5-Day Grace Period Safeguard
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Maker-Checker Maturity Disbursal
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-4 px-6 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2.5 group ${
                  isFeatured
                    ? 'nexora-pill-btn text-white'
                    : 'bg-slate-900 hover:bg-black text-white shadow-md'
                }`}
              >
                <span>Select {plan.name}</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

