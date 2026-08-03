import React, { useState } from 'react';
import { SAVINGS_PLANS } from '../data/mockData';
import { Calculator, Sparkles, Gift, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MaturityCalculatorProps {
  onStartSaving?: (planId: string) => void;
}

export const MaturityCalculator: React.FC<MaturityCalculatorProps> = ({ onStartSaving }) => {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(2000);

  // Bonus rate calculation
  const getBonusPct = (amount: number) => {
    if (amount >= 4000) return 6.0;
    if (amount >= 2000) return 5.5;
    return 5.0;
  };

  const bonusPct = getBonusPct(monthlyContribution);
  const totalPrincipal = monthlyContribution * 12;
  const cashBonus = Math.round(totalPrincipal * (bonusPct / 100));
  const totalMaturityValue = totalPrincipal + cashBonus;
  const hamperValue = 4500;
  const grandTotalPerksValue = totalMaturityValue + hamperValue;

  return (
    <div className="bg-blue-50/60 rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="bg-blue-100/80 text-blue-700 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-blue-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          12-Month Micro-Savings Simulator
        </span>
        <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
          See How Much Maturity Cash You Could <span className="text-blue-600">Claim</span>
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Commit to fixed monthly contributions starting at ₹1,000/month under RBI Escrow custody.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Input Form (White Card matching reference UI) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <span>Fixed Micro-Savings Calculator</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              RBI Compliant
            </span>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Choose Monthly Contribution Amount:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1000, 2000, 4000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMonthlyContribution(amt)}
                  className={`py-3 px-3 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center justify-center ${
                    monthlyContribution === amt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-50 text-slate-900 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="text-base">₹{amt.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-medium opacity-85">per month</span>
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-semibold text-slate-500">Custom Monthly Deposit:</span>
              <span className="font-heading font-extrabold text-lg text-blue-600">
                ₹{monthlyContribution.toLocaleString('en-IN')} / mo
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>₹1,000 (Min)</span>
              <span>₹5,000</span>
              <span>₹10,000 (Max)</span>
            </div>
          </div>

          {/* Perk Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{bonusPct}% Cash Bonus</p>
                <p className="text-[10px] text-slate-500 font-medium">At 12-Month Maturity</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <Gift className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">₹4,500 Gift Hamper</p>
                <p className="text-[10px] text-slate-500 font-medium">Included Doorstep Perk</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Estimate Card (White Card with Glowing Blue Estimation Badge matching Fondo UI) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          
          <div className="text-center space-y-1">
            <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Target Payout
            </span>
            <h4 className="font-heading font-extrabold text-xl text-slate-900">
              Estimate Your Maturity Payout
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Earn principal refund + cash bonus up to 6% + luxury hamper.
            </p>
          </div>

          {/* Vibrant Glowing Blue Payout Estimate Badge matching reference UI */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl p-5 text-center shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-[1.02]">
            <p className="text-[11px] text-blue-100 font-extrabold uppercase tracking-wider">Your Estimated Maturity Target</p>
            <p className="font-heading font-extrabold text-3xl sm:text-4xl mt-1">
              ₹{totalMaturityValue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-blue-100 mt-1 font-medium">
              + ₹4,500 Luxury Gift Hamper Included
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Total Principal Saved (12 Mos):</span>
              <span className="font-bold text-slate-900">₹{totalPrincipal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Cash Bonus ({bonusPct}% Rate):</span>
              <span className="font-bold text-emerald-600">+₹{cashBonus.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Grand Perks Value:</span>
              <span className="font-extrabold text-purple-600">₹{grandTotalPerksValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => {
              const matchedPlan = SAVINGS_PLANS.find(p => p.monthly_amount === monthlyContribution) || SAVINGS_PLANS[0];
              if (onStartSaving) onStartSaving(matchedPlan.id);
            }}
            className="w-full nexora-pill-btn font-bold py-3.5 px-6 flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/25 group"
          >
            <span>Start Saving Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

      </div>

      {/* Bottom Callout Banner matching Fondo UI */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Get Started With SamruddiSave, Claim Maturity Perks Like Never Before</p>
            <p className="text-slate-500 font-medium text-[11px]">Automatically qualify, book retention, & unlock escrow reserve</p>
          </div>
        </div>

        <button
          onClick={() => {
            const matchedPlan = SAVINGS_PLANS.find(p => p.monthly_amount === monthlyContribution) || SAVINGS_PLANS[0];
            if (onStartSaving) onStartSaving(matchedPlan.id);
          }}
          className="nexora-pill-btn font-bold py-2.5 px-5 text-xs whitespace-nowrap shrink-0"
        >
          Get Started →
        </button>
      </div>

    </div>
  );
};


