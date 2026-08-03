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
  Zap,
  BarChart3,
  Percent,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Header Section */}
      <section className="relative overflow-hidden nexora-hero-bg pt-10 pb-20 border-b border-slate-200/60">
        
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 nexora-grid-pattern opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Category Pill Badge with Dot Indicator matching reference image */}
              <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-600 border border-blue-200/80 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>RBI Escrow Certified Tripartite Bank Custody</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.14]">
                Disciplined <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">12-Month</span> Micro-Savings & Perks
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed font-medium">
                Commit to fixed monthly contributions starting at ₹1,000/month. Earn a year-end cash bonus up to 6% plus a curated luxury festival gift hamper delivered at Month 12 maturity.
              </p>

              {/* Action Buttons matching reference image style */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/kyc')}
                  className="nexora-pill-btn font-bold py-4 px-8 flex items-center gap-3 text-sm group"
                >
                  <span>Start Saving Now</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('/plans')}
                  className="nexora-pill-btn-secondary font-bold py-4 px-7 text-sm flex items-center gap-2"
                >
                  View Fixed Plans
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-heading font-extrabold text-2xl text-slate-900">₹48.5 Lakhs+</p>
                  <p className="text-[11px] text-slate-500 font-medium">Held in Escrow Custody</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-2xl text-emerald-600">5% - 6%</p>
                  <p className="text-[11px] text-slate-500 font-medium">Maturity Cash Bonus</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-2xl text-purple-600">₹4,500</p>
                  <p className="text-[11px] text-slate-500 font-medium">Gift Hamper Value</p>
                </div>
              </div>

            </div>

            {/* Right Card Illustration (Nexora Dashboard Preview Style) */}
            <div className="lg:col-span-5 relative">
              
              {/* Background Glow Spheres */}
              <div className="w-64 h-64 bg-blue-500/15 rounded-full blur-3xl absolute -top-10 -right-10 pointer-events-none" />
              <div className="w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl absolute -bottom-10 -left-10 pointer-events-none" />

              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(37,99,235,0.12)] relative z-10 backdrop-blur-md">
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-2xs">
                      <Lock className="w-5.5 h-5.5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">Escrow Trustee Guarantee</h4>
                      <p className="text-[11px] text-slate-500 font-medium">HDFC Bank Custody A/C</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200/70 shadow-2xs">
                    RBI Compliant
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 font-medium">Monthly Commitments:</p>
                      <p className="font-heading font-bold text-base text-slate-900">₹1,000 / ₹2,000 / ₹4,000</p>
                    </div>
                    <span className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-xs">12 Cycles</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-500">5-Day Grace Period Safeguard:</span>
                      <span className="font-semibold text-emerald-600">Zero Penalty</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-500">Maturity Disbursal:</span>
                      <span className="font-semibold text-slate-900">Maker-Checker Authorized</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-slate-500">Festival Gift Delivery:</span>
                      <span className="font-semibold text-purple-600">Doorstep Logistics</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 256-Bit Encrypted
                  </span>
                  <span className="font-mono text-slate-400">Version 2.6 HD Architecture</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Maturity Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MaturityCalculator onStartSaving={() => onNavigate('/kyc')} />
      </section>

      {/* 12-Month Roadmap Visualizer (Operational Lifecycle) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="nexora-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border border-blue-200/70 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Operational Lifecycle
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2.5">
              Your 12-Month Goal Journey
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Automated AutoPay, grace period safeguards, and double-verified maturity release
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="nexora-card nexora-card-hover p-6 rounded-2xl border border-slate-200/80 relative">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4 shadow-md shadow-blue-500/25">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1.5">AI OCR KYC Setup</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Register account, upload PAN/Aadhaar for 99.8% AI OCR extraction, & set up AutoPay.
              </p>
            </div>

            {/* Step 2 */}
            <div className="nexora-card nexora-card-hover p-6 rounded-2xl border border-slate-200/80 relative">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4 shadow-md shadow-blue-500/25">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1.5">Monthly Deposits</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                12 fixed monthly contributions via UPI AutoPay. 5-day grace period keeps streak alive.
              </p>
            </div>

            {/* Step 3 */}
            <div className="nexora-card nexora-card-hover p-6 rounded-2xl border border-slate-200/80 relative">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4 shadow-md shadow-blue-500/25">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1.5">Hamper Allocation</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                MRM Officer allocates luxury gift hamper (Smart Tech, Organic Wellness, Fashion, Decor).
              </p>
            </div>

            {/* Step 4 */}
            <div className="nexora-card nexora-card-hover p-6 rounded-2xl border border-slate-200/80 relative">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4 shadow-md shadow-emerald-500/25">
                4
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1.5">Maker-Checker Payout</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                MRM MAKER verifies &rarr; Escrow Finance CHECKER releases principal + 6% cash bonus + hamper.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Curated Gift Hampers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="bg-purple-50 text-purple-600 border border-purple-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Maturity Rewards
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2.5">
              Curated Luxury Gift Hampers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/hampers')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group"
          >
            <span>Explore All Hampers</span> 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GIFT_HAMPERS.map((hamper) => (
            <div
              key={hamper.id}
              onClick={() => onNavigate('/hampers')}
              className="nexora-card nexora-card-hover rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  <img
                    src={hamper.image}
                    alt={hamper.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {hamper.tier}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-emerald-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-md">
                    ₹{hamper.retail_value.toLocaleString('en-IN')} Value
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  <h3 className="font-heading font-bold text-base text-slate-900">{hamper.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{hamper.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-2 flex items-center justify-between text-xs text-blue-600 font-bold border-t border-slate-100">
                  <span>{hamper.included_items.length} Curated Items</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};


