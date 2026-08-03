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
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Fixed 12-Month Micro-Savings Plans
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1F1F24]">
          Choose Your Savings Commitment
        </h1>
        <p className="text-xs text-[#6C7285]">
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
              className={`bg-white rounded-3xl border p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all relative ${
                isFeatured
                  ? 'border-[#4F5DFF] ring-2 ring-[#4F5DFF]/30 shadow-2xl scale-[1.02]'
                  : 'border-[#E8EAF8] shadow-sm hover:shadow-xl'
              }`}
            >
              {isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4F5DFF] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Most Popular Choice
                </span>
              )}

              <div className="space-y-4">
                <div className="border-b border-[#E8EAF8] pb-4">
                  <span className="text-[10px] font-bold text-[#6C7285] uppercase tracking-wider">{plan.gift_hamper_tier}</span>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1F24] mt-0.5">{plan.name}</h3>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-4xl text-[#1F1F24]">
                      ₹{plan.monthly_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#6C7285]">/ month</span>
                  </div>
                </div>

                {/* Return Specs */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E8EAF8]">
                    <span className="text-[#6C7285]">Duration:</span>
                    <span className="font-bold text-[#1F1F24]">12 Months Fixed</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8EAF8]">
                    <span className="text-[#6C7285]">Total Principal Saved:</span>
                    <span className="font-bold text-[#1F1F24]">₹{plan.total_principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8EAF8]">
                    <span className="text-[#6C7285]">Cash Bonus ({plan.cash_bonus_pct}% Rate):</span>
                    <span className="font-bold text-emerald-600">+₹{plan.bonus_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8EAF8]">
                    <span className="text-[#6C7285]">Gift Hamper Included:</span>
                    <span className="font-bold text-purple-600">₹4,500 Retail Value</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-extrabold text-[#4F5DFF] bg-[#4F5DFF]/5 px-3 rounded-xl border border-[#4F5DFF]/10">
                    <span>Maturity Yield:</span>
                    <span>₹{plan.total_maturity_value.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#6C7285]">
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
                className={`w-full py-4 px-6 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isFeatured
                    ? 'bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white shadow-lg shadow-[#4F5DFF]/40'
                    : 'bg-[#1F1F24] hover:bg-black text-white'
                }`}
              >
                Select {plan.name} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
