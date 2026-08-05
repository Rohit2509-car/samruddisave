import React from 'react';
import { MaturityCalculator } from '../components/MaturityCalculator';
import { GIFT_HAMPERS, SAVINGS_PLANS } from '../data/mockData';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Gift,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  Sparkles,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F7F8FC] pt-8 pb-12 border-b border-[#E8EAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#4F5DFF]" />
                RBI Escrow Certified Tripartite Bank Custody
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1F1F24] tracking-tight leading-[1.15]">
                Disciplined <span className="text-[#4F5DFF]">12-Month</span> Micro-Savings & Perks
              </h1>

              <p className="text-base text-[#6C7285] max-w-xl leading-relaxed">
                Commit to fixed monthly contributions starting at ₹1,000/month. Earn a year-end cash bonus up to 6% plus a curated luxury festival gift hamper delivered at Month 12 maturity.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/register')}
                  className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-[#4F5DFF]/35 flex items-center gap-2 text-sm scale-100 hover:scale-[1.02]"
                >
                  Start Saving Now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/plans')}
                  className="bg-white hover:bg-[#F7F8FC] text-[#1F1F24] font-semibold py-4 px-7 rounded-2xl border border-[#E8EAF8] transition-all shadow-xs text-sm"
                >
                  View Fixed Plans
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E8EAF8] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-heading font-extrabold text-xl text-[#1F1F24]">₹48.5 Lakhs+</p>
                  <p className="text-[11px] text-[#6C7285]">Held in Escrow Custody</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-xl text-emerald-600">5% - 6%</p>
                  <p className="text-[11px] text-[#6C7285]">Maturity Cash Bonus</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-xl text-purple-600">₹4,500</p>
                  <p className="text-[11px] text-[#6C7285]">Gift Hamper Value</p>
                </div>
              </div>
            </div>

            {/* Right Card Illustration */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#4F5DFF]/10 text-[#4F5DFF] flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5 text-[#4F5DFF]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#1F1F24]">Escrow Trustee Guarantee</h4>
                      <p className="text-[11px] text-[#6C7285]">HDFC Bank Custody A/C</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    RBI Compliant
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8] flex items-center justify-between">
                    <div>
                      <p className="text-[#6C7285]">Monthly Commitments:</p>
                      <p className="font-heading font-bold text-base text-[#1F1F24]">₹1,000 / ₹2,000 / ₹4,000</p>
                    </div>
                    <span className="bg-[#4F5DFF] text-white font-bold text-xs px-3 py-1 rounded-xl">12 Cycles</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6C7285]">5-Day Grace Period Safeguard:</span>
                      <span className="font-semibold text-emerald-600">Zero Penalty</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6C7285]">Maturity Disbursal:</span>
                      <span className="font-semibold text-[#1F1F24]">Maker-Checker Authorized</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6C7285]">Festival Gift Delivery:</span>
                      <span className="font-semibold text-purple-600">Doorstep Logistics</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8EAF8] flex items-center justify-between text-[11px] text-[#6C7285]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit Encrypted
                  </span>
                  <span>Version 2.6 HD Architecture</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Maturity Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MaturityCalculator onStartSaving={() => onNavigate('/login')} />
      </section>

      {/* 12-Month Roadmap Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E8EAF8] shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="bg-[#8A7BFF]/10 text-[#8A7BFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Operational Lifecycle
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">
              Your 12-Month Goal Journey
            </h2>
            <p className="text-xs text-[#6C7285] mt-1">
              Automated AutoPay, grace period safeguards, and double-verified maturity release
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] relative">
              <div className="w-8 h-8 bg-[#4F5DFF] text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1F1F24] mb-1">AI OCR KYC Setup</h3>
              <p className="text-xs text-[#6C7285] leading-relaxed">
                Register account, upload PAN/Aadhaar for 99.8% AI OCR extraction, & set up AutoPay.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] relative">
              <div className="w-8 h-8 bg-[#4F5DFF] text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1F1F24] mb-1">Monthly Deposits</h3>
              <p className="text-xs text-[#6C7285] leading-relaxed">
                12 fixed monthly contributions via UPI AutoPay. 5-day grace period keeps streak alive.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] relative">
              <div className="w-8 h-8 bg-[#4F5DFF] text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1F1F24] mb-1">Hamper Allocation</h3>
              <p className="text-xs text-[#6C7285] leading-relaxed">
                MRM Officer allocates luxury gift hamper (Smart Tech, Organic Wellness, Fashion, Decor).
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] relative">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1F1F24] mb-1">Maker-Checker Payout</h3>
              <p className="text-xs text-[#6C7285] leading-relaxed">
                MRM MAKER verifies &rarr; Escrow Finance CHECKER releases principal + 6% cash bonus + hamper.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Curated Gift Hampers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Maturity Rewards
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">
              Curated Luxury Gift Hampers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/hampers')}
            className="text-xs font-bold text-[#4F5DFF] hover:underline flex items-center gap-1"
          >
            Explore All Hampers <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GIFT_HAMPERS.map((hamper) => (
            <div
              key={hamper.id}
              onClick={() => onNavigate('/hampers')}
              className="bg-white rounded-2xl border border-[#E8EAF8] overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={hamper.image}
                  alt={hamper.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#1F1F24]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {hamper.tier}
                </span>
                <span className="absolute bottom-3 right-3 bg-emerald-500 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-xl shadow-md">
                  ₹{hamper.retail_value.toLocaleString('en-IN')} Value
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-heading font-bold text-base text-[#1F1F24]">{hamper.name}</h3>
                <p className="text-xs text-[#6C7285] line-clamp-2">{hamper.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#4F5DFF] font-semibold">
                  <span>{hamper.included_items.length} Curated Items</span>
                  <span>View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
