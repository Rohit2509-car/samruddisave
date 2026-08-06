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

      {/* About Company & RBI Escrow Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white rounded-3xl border border-[#E8EAF8] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              About SamruddiSave
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
              India's Most Trusted Certified Chit Fund & Micro-Savings Platform
            </h2>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              Founded with a mission to bring financial inclusion and disciplined savings to every household in India, SamruddiSave integrates traditional chit fund community savings with modern RBI-certified tripartite escrow security.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-[#F7F8FC] p-3 rounded-2xl border border-[#E8EAF8]">
                <p className="font-bold text-[#4F5DFF] text-lg">100% Legal</p>
                <p className="text-[11px] text-[#6C7285]">Compliant with Chit Funds Act 1982</p>
              </div>
              <div className="bg-[#F7F8FC] p-3 rounded-2xl border border-[#E8EAF8]">
                <p className="font-bold text-emerald-600 text-lg">RBI Escrow</p>
                <p className="text-[11px] text-[#6C7285]">Tripartite Bank Account Custody</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-tr from-[#1F1F24] to-[#4F5DFF] p-8 rounded-3xl text-white space-y-4 shadow-xl">
            <ShieldCheck className="w-12 h-12 text-emerald-400" />
            <h3 className="font-heading font-extrabold text-2xl">Bank-Grade Capital Safeguards</h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Every monthly contribution is automatically deposited into a designated tripartite RBI Escrow Custody Account with HDFC Bank Trustees. Your capital remains 100% bankruptcy-remote and ring-fenced.
            </p>
          </div>
        </div>
      </section>

      {/* How The Chit Fund Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
            How Samruddi Chit Fund Works
          </h2>
          <p className="text-xs text-[#6C7285]">
            Transparent community savings combined with monthly bidding auctions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8EAF8] shadow-xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold text-sm flex items-center justify-center mx-auto">1</div>
            <h4 className="font-extrabold text-sm text-[#1F1F24]">1. Register & KYC</h4>
            <p className="text-[11px] text-[#6C7285]">Verify your Aadhaar, PAN, and Bank details for instant RBI escrow onboarding.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E8EAF8] shadow-xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold text-sm flex items-center justify-center mx-auto">2</div>
            <h4 className="font-extrabold text-sm text-[#1F1F24]">2. Join Chit Group</h4>
            <p className="text-[11px] text-[#6C7285]">Choose a Chit Group (₹50K, ₹1L, ₹5L) matching your budget and savings goal.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E8EAF8] shadow-xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold text-sm flex items-center justify-center mx-auto">3</div>
            <h4 className="font-extrabold text-sm text-[#1F1F24]">3. Monthly Deposit & Auction</h4>
            <p className="text-[11px] text-[#6C7285]">Pay monthly installments via UPI or Cash & participate in monthly discount bidding.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E8EAF8] shadow-xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold text-sm flex items-center justify-center mx-auto">4</div>
            <h4 className="font-extrabold text-sm text-[#1F1F24]">4. Maturity & Disbursal</h4>
            <p className="text-[11px] text-[#6C7285]">Receive your full prize amount + accrued cash bonus + luxury gift hamper!</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Customer Feedback
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
            Trusted by 50,000+ Disciplined Savers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] space-y-3 shadow-xs">
            <div className="flex items-center gap-1 text-amber-500">★★★★★</div>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              "SamruddiSave made monthly chit deposits so easy! I won the 3rd month auction bid and received ₹91,000 directly into my bank account within 24 hours."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-xs text-[#1F1F24]">Karthickeyan M.</p>
              <p className="text-[10px] text-[#6C7285]">Chennai • Member since Jan 2026</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] space-y-3 shadow-xs">
            <div className="flex items-center gap-1 text-amber-500">★★★★★</div>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              "The automatic receipt generation and digital ledger update after offline cash payment at the branch gives total peace of mind."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-xs text-[#1F1F24]">Sneha Roy</p>
              <p className="text-[10px] text-[#6C7285]">Kolkata • Member since Feb 2026</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] space-y-3 shadow-xs">
            <div className="flex items-center gap-1 text-amber-500">★★★★★</div>
            <p className="text-xs text-[#6C7285] leading-relaxed">
              "Clear compliance, RBI escrow custody, and the luxury gift hamper at Month 12 maturity makes this the best savings plan in India."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-xs text-[#1F1F24]">Rajesh Kumar</p>
              <p className="text-[10px] text-[#6C7285]">Bengaluru • Member since Mar 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Us */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* FAQ */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24]">Frequently Asked Questions</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8]">
                <p className="font-bold text-[#1F1F24]">Is SamruddiSave registered under the Chit Funds Act?</p>
                <p className="text-[#6C7285] mt-1">Yes, all chit groups are 100% registered and compliant under the Chit Funds Act, 1982 with RBI Escrow bank custody.</p>
              </div>
              <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8]">
                <p className="font-bold text-[#1F1F24]">Can I pay offline cash at a branch office?</p>
                <p className="text-[#6C7285] mt-1">Yes! When paying cash to an Admin, the Admin records your payment in the Admin Cash Entry module and an official receipt is issued instantly.</p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div id="contact" className="bg-gradient-to-tr from-[#1F1F24] to-[#4F5DFF] p-6 rounded-3xl text-white space-y-4 shadow-xl">
            <h3 className="font-heading font-extrabold text-2xl">Contact Support & Branch Help Desk</h3>
            <p className="text-xs text-slate-200">Have questions about joining a Chit Group or verifying your KYC?</p>
            <div className="space-y-2 text-xs pt-2">
              <p>📍 <strong>Head Office:</strong> Samruddi Savings Tower, MG Road, Bengaluru - 560001</p>
              <p>📞 <strong>Phone:</strong> +91 1800 267 9000 (Toll Free)</p>
              <p>✉️ <strong>Email:</strong> support@samruddisave.com</p>
            </div>
            <button
              onClick={() => onNavigate('/support')}
              className="w-full py-3 bg-white text-[#4F5DFF] hover:bg-slate-100 font-bold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Open Support Ticket
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
