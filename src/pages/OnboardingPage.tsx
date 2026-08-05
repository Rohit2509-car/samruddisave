import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { ShieldCheck, User, Phone, FileText, CheckCircle2, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface OnboardingPageProps {
  onNavigate: (path: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const currentUser = stateStore.getCurrentUser();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [panNumber, setPanNumber] = useState(currentUser?.pan_number || '');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !panNumber.trim()) {
      setErrorMsg('Please enter your Full Name, Phone Number, and valid PAN Number.');
      return;
    }

    if (panNumber.trim().length !== 10) {
      setErrorMsg('PAN Number must be exactly 10 characters (e.g. ABCDE1234F).');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms & Conditions to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await stateStore.createOnboardingProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        panNumber: panNumber.trim().toUpperCase()
      });

      if (res.success) {
        setSuccessMsg('Onboarding profile & KYC record created! Redirecting to Plan Selection...');
        setTimeout(() => {
          onNavigate('/plans');
        }, 800);
      } else {
        setErrorMsg('Failed to update onboarding record. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E8EAF8] shadow-2xl p-8 space-y-6">
        
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Step 1 of 3: Member Onboarding & Verification
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F1F24]">
            Complete Your Member Profile
          </h2>
          <p className="text-xs text-[#6C7285] max-w-md mx-auto">
            Provide your basic identity details to initialize your RBI Escrow Custody Account and unlock savings plans.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="bg-[#4F5DFF] text-white p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span> Onboarding
          </div>
          <div className="bg-[#F7F8FC] text-[#6C7285] p-2.5 rounded-xl text-center text-xs font-bold border border-[#E8EAF8] flex items-center justify-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#E8EAF8] flex items-center justify-center text-[10px]">2</span> Plan Select
          </div>
          <div className="bg-[#F7F8FC] text-[#6C7285] p-2.5 rounded-xl text-center text-xs font-bold border border-[#E8EAF8] flex items-center justify-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#E8EAF8] flex items-center justify-center text-[10px]">3</span> First Deposit
          </div>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1F1F24] font-bold mb-1.5">Full Name (As per PAN Card)</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rohit Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC] font-semibold text-[#1F1F24]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1F1F24] font-bold mb-1.5">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC] font-semibold text-[#1F1F24]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1F1F24] font-bold mb-1.5">PAN Card Number</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC] font-mono font-bold text-[#1F1F24] tracking-wider uppercase"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#4F5DFF]"
            />
            <span className="text-xs text-[#6C7285] leading-relaxed">
              I certify that the information provided is accurate and I accept the <a href="#terms" className="text-[#4F5DFF] font-semibold underline">Terms & Conditions</a> governing RBI Escrow tripartite accounts.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold rounded-2xl shadow-xl shadow-[#4F5DFF]/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {submitting ? 'Saving Profile & Registering KYC...' : 'Save & Continue to Plan Selection'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
