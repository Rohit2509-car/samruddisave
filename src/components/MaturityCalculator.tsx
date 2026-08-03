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
    <div className="bg-white rounded-3xl border border-[#E8EAF8] shadow-xl overflow-hidden p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#4F5DFF] text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            12-Month Micro-Savings Simulator
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24]">
            Calculate Your Maturity Yield
          </h3>
        </div>
        <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 text-xs font-bold px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> RBI Escrow Certified
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Sliders & Quick Buttons */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#6C7285] uppercase tracking-wider mb-3">
              Choose Monthly Contribution Amount:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1000, 2000, 4000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMonthlyContribution(amt)}
                  className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center justify-center ${
                    monthlyContribution === amt
                      ? 'bg-[#4F5DFF] text-white border-[#4F5DFF] shadow-lg shadow-[#4F5DFF]/30 scale-[1.02]'
                      : 'bg-[#F7F8FC] text-[#1F1F24] border-[#E8EAF8] hover:bg-[#E8EAF8]/50'
                  }`}
                >
                  <span className="text-base">₹{amt.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-normal opacity-90">per month</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#6C7285]">Custom Monthly Deposit:</span>
              <span className="font-heading font-bold text-lg text-[#4F5DFF]">
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4F5DFF]"
            />
            <div className="flex justify-between text-[11px] text-[#6C7285] mt-1 font-medium">
              <span>₹1,000 (Min)</span>
              <span>₹5,000</span>
              <span>₹10,000 (Max)</span>
            </div>
          </div>

          {/* Perk Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2 bg-[#F7F8FC] p-3 rounded-xl border border-[#E8EAF8]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1F1F24]">{bonusPct}% Year-End Cash Bonus</p>
                <p className="text-[11px] text-[#6C7285]">Paid directly into escrow payout</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-[#F7F8FC] p-3 rounded-xl border border-[#E8EAF8]">
              <Gift className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1F1F24]">₹4,500 Gift Hamper Included</p>
                <p className="text-[11px] text-[#6C7285]">Curated luxury items at Month 12</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Maturity Card Output */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1F1F24] to-[#2D2E38] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#4F5DFF]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">12-Month Maturity Target</p>
              <h4 className="font-heading font-extrabold text-3xl text-white mt-0.5">
                ₹{totalMaturityValue.toLocaleString('en-IN')}
              </h4>
            </div>
            <div className="bg-[#4F5DFF] text-white p-2.5 rounded-2xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Total Saved (12 Months):</span>
              <span className="font-semibold text-white">₹{totalPrincipal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Cash Bonus ({bonusPct}% Rate):</span>
              <span className="font-semibold text-emerald-400">+₹{cashBonus.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Luxury Gift Hamper Perks:</span>
              <span className="font-semibold text-purple-300">Included (₹4,500 Val)</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold text-emerald-300">
              <span>Total Value Delivered:</span>
              <span>₹{grandTotalPerksValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => {
              const matchedPlan = SAVINGS_PLANS.find(p => p.monthly_amount === monthlyContribution) || SAVINGS_PLANS[0];
              if (onStartSaving) onStartSaving(matchedPlan.id);
            }}
            className="w-full bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#4F5DFF]/40 flex items-center justify-center gap-2 text-sm"
          >
            Start Saving Now <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            Tripartite Bank Escrow Custody under RBI Regulations
          </p>

        </div>

      </div>
    </div>
  );
};
