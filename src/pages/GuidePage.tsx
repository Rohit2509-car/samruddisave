import React, { useState } from 'react';
import {
  Activity,
  Calculator,
  CreditCard,
  Gift,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Building2,
  Sparkles,
  FileText,
  Award,
  BadgePercent
} from 'lucide-react';
import { SAVINGS_PLANS } from '../data/mockData';

interface GuidePageProps {
  onNavigate: (path: string) => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the RBI Escrow mechanism protect my deposits?',
      a: 'All member deposit payments are deposited directly into a designated HDFC Escrow Trustee Account (#9182374619). The funds are legally segregated from company balance sheets and can only be disbursed according to certified maturity payout schedules.'
    },
    {
      q: 'What happens if I miss a monthly deposit deadline?',
      a: 'We provide a 5-day grace period for every monthly installment. Notifications are sent via SMS, Email, and WhatsApp. If missed beyond the grace period, your streak is paused, but your accumulated principal remains 100% safe in Escrow.'
    },
    {
      q: 'When do I receive my Gift Hamper and Cash Bonus?',
      a: 'Tiered Gift Hampers (Silver, Gold, Diamond, Platinum) are assigned to your month 12 maturity payout package. Cash bonuses (up to 12.5% value boost) are calculated automatically and disbursed with your principal maturity pool.'
    },
    {
      q: 'Can I pay via cash or offline collection?',
      a: 'Yes! Authorized SamruddiSave field agents can record cash deposits. Every cash collection generates an instant 256-bit encrypted SMS receipt and updates your digital passbook in real time.'
    },
    {
      q: 'Is KYC verification mandatory?',
      a: 'Yes, as per RBI micro-savings guidelines, basic PAN and Aadhaar OCR verification is required prior to initiating your first monthly deposit or requesting maturity disbursals.'
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* 1. HERO GUIDE HEADER */}
      <div className="bg-gradient-to-br from-[#1F1F24] via-[#2D3142] to-[#12141D] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#4F5DFF]" /> Step-by-Step Member Guide
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            How SamruddiSave Works
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Discover how disciplined micro-savings combined with RBI Escrow protection and maturity gift hampers deliver unmatched security and value for your household financial goals.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('/plans')}
              className="bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#4F5DFF]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              Explore Savings Plans <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/security')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verify Security Credentials
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-STEP SAVINGS JOURNEY */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F1F24]">
            Your 4-Step Savings Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#6C7285]">
            Simple, automated, and 100% transparent micro-savings process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm relative space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#4F5DFF] text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Choose Your Plan</h3>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              Select from fixed 12-month savings tiers starting from ₹1,000/month up to ₹10,000/month tailored to your goal.
            </p>
            <button
              onClick={() => onNavigate('/plans')}
              className="text-xs font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 pt-1"
            >
              View Tiers <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm relative space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#4F5DFF] text-white font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Monthly Escrow Deposit</h3>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              Deposit on or before the 15th via Razorpay UPI, NetBanking, Cards, or doorstep agent cash collection.
            </p>
            <button
              onClick={() => onNavigate('/pay')}
              className="text-xs font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 pt-1"
            >
              Make Payment <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm relative space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#4F5DFF] text-white font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Real-Time Passbook</h3>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              Track your deposit streak, cycle completion metrics, and digital receipts in your member passbook.
            </p>
            <button
              onClick={() => onNavigate('/reports')}
              className="text-xs font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 pt-1"
            >
              View Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm relative space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#4F5DFF] text-white font-extrabold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Maturity Payout & Gifts</h3>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              At Month 12, receive 100% principal + cash bonus + your tier Gift Hamper delivered to your doorstep.
            </p>
            <button
              onClick={() => onNavigate('/hampers')}
              className="text-xs font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 pt-1"
            >
              View Gifts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PLAN COMPARISON QUICK SUMMARY */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF8] pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Available Micro-Savings Plans</h3>
            <p className="text-xs text-[#6C7285] mt-0.5">Fixed 12-month tenure with guaranteed maturity bonus & tier hamper</p>
          </div>
          <button
            onClick={() => onNavigate('/plans')}
            className="bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            Compare All Plans <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAVINGS_PLANS.map((plan) => (
            <div key={plan.id} className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-[#1F1F24]">{plan.name}</span>
                <span className="text-[10px] bg-blue-50 text-[#4F5DFF] font-extrabold px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                  {plan.gift_hamper_tier}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#4F5DFF]">₹{plan.monthly_amount.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
              <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-200/60 pt-2">
                <p>Total Principal: <span className="font-bold text-[#1F1F24]">₹{plan.total_principal.toLocaleString()}</span></p>
                <p>Maturity Bonus: <span className="font-bold text-emerald-600">₹{plan.bonus_amount.toLocaleString()}</span></p>
                <p>Total Value: <span className="font-bold text-[#4F5DFF]">₹{plan.total_maturity_value.toLocaleString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E8EAF8] pb-4">
          <div className="p-2.5 bg-blue-50 text-[#4F5DFF] rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">Frequently Asked Questions</h3>
            <p className="text-xs text-[#6C7285]">Everything you need to know about SamruddiSave deposits & security</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-[#E8EAF8] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 bg-[#F7F8FC] hover:bg-slate-100 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1F1F24] cursor-pointer transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#4F5DFF] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs text-[#6C7285] leading-relaxed border-t border-[#E8EAF8] animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
