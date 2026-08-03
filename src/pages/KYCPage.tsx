import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { AIOCRScannerModal } from '../components/AIOCRScannerModal';
import { UserProfile } from '../types';
import {
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Lock,
  CreditCard,
  QrCode
} from 'lucide-react';

interface KYCPageProps {
  onNavigate: (path: string) => void;
}

export const KYCPage: React.FC<KYCPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  // OCR Document States
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);
  const [ocrDetails, setOcrDetails] = useState<any>(null);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  // Bank & AutoPay States
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [autopayMethod, setAutopayMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'netbanking'>('gpay');

  const [submittedProfile, setSubmittedProfile] = useState<UserProfile | null>(null);

  const handleOCRExtracted = (data: any) => {
    setPanNumber(data.pan_number);
    setAadhaarNumber(data.aadhaar_number);
    if (!fullName) setFullName(data.full_name);
    setOcrConfidence(data.ocr_confidence);
    setOcrDetails(data.ocr_details);
  };

  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();

    const profile = stateStore.registerMember({
      full_name: fullName || 'Rohit Sharma',
      email: email || 'rohit.save@example.com',
      phone: phone || '+91 98765 43210',
      pan_number: panNumber || 'ABCDE1234F',
      aadhaar_number: aadhaarNumber || '9876 5432 1098',
      ocr_confidence: ocrConfidence || 99.8,
      ocr_details: ocrDetails || {
        pan_name_match: true,
        photo_match_pct: 99.8,
        extracted_pan: panNumber || 'ABCDE1234F',
        extracted_aadhaar: aadhaarNumber || '9876 5432 1098',
        document_type: 'PAN Card & Aadhaar OCR Verification',
      },
      bank_details: {
        account_number: accountNumber || '50100293847123',
        ifsc: ifsc || 'HDFC0001234',
        bank_name: bankName,
        autopay_method: autopayMethod,
        mandate_id: `MNDT_${bankName.slice(0, 4).toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`,
        account_holder: fullName || 'Rohit Sharma',
      },
    });

    setSubmittedProfile(profile);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Step-by-Step Member Verification
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
          Customer Onboarding & AI OCR KYC
        </h1>
        <p className="text-xs text-[#6C7285] max-w-md mx-auto">
          Complete your e-KYC verification to open your RBI Escrow micro-savings account
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-[#E8EAF8] shadow-xs text-xs">
        <button
          onClick={() => setStep(1)}
          className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 1 ? 'bg-[#4F5DFF] text-white shadow-sm' : 'text-[#6C7285] hover:bg-[#F7F8FC]'
          }`}
        >
          <User className="w-4 h-4" /> 1. Personal Details
        </button>
        <button
          onClick={() => setStep(2)}
          className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 2 ? 'bg-[#4F5DFF] text-white shadow-sm' : 'text-[#6C7285] hover:bg-[#F7F8FC]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> 2. AI OCR Upload
        </button>
        <button
          onClick={() => setStep(3)}
          className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 3 ? 'bg-[#4F5DFF] text-white shadow-sm' : 'text-[#6C7285] hover:bg-[#F7F8FC]'
          }`}
        >
          <Building className="w-4 h-4" /> 3. Bank & AutoPay
        </button>
      </div>

      {/* Confirmation State if Submitted */}
      {submittedProfile ? (
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
              Status: KYC_PENDING
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-2">
              Application Submitted & Pending Officer Sign-off
            </h2>
            <p className="text-xs text-[#6C7285] max-w-md mx-auto mt-1">
              Your PAN & Aadhaar AI OCR scores have been transmitted to the MRM Officer Queue. You can view your live status on your Dashboard.
            </p>
          </div>

          <div className="bg-[#F7F8FC] border border-[#E8EAF8] p-4 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6C7285]">Applicant Name:</span>
              <span className="font-semibold text-[#1F1F24]">{submittedProfile.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6C7285]">PAN Number:</span>
              <span className="font-mono font-bold text-[#1F1F24]">{submittedProfile.pan_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6C7285]">OCR Confidence Score:</span>
              <span className="font-bold text-emerald-600">99.8% Match Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6C7285]">AutoPay Mandate Method:</span>
              <span className="font-semibold text-purple-600 uppercase">{submittedProfile.bank_details?.autopay_method}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="bg-[#4F5DFF] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#6A6DFF] transition-all shadow-md text-xs flex items-center gap-2"
            >
              Go to Member Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/employee')}
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold py-3 px-6 rounded-xl transition-all text-xs"
            >
              ⚡ Switch to Officer Portal to Approve
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Onboarding Form */
        <form onSubmit={handleSubmitOnboarding} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-lg space-y-6">
          
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#E8EAF8] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#1F1F24]">1. Account Registration Details</h3>
                <p className="text-xs text-[#6C7285]">Enter your full legal name as per government records</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Full Name (as per PAN):</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7285]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F1F24] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Mobile Number:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7285]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F1F24] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Email Address:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7285]" />
                    <input
                      type="email"
                      required
                      placeholder="rohit@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F1F24] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-1">4-Digit Account PIN:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#6C7285]" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F1F24] outline-none font-mono tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-xs flex items-center gap-2"
                >
                  Next: Upload AI OCR Documents <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI OCR Document Upload */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#E8EAF8] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1F1F24]">2. AI OCR Identity Verification</h3>
                  <p className="text-xs text-[#6C7285]">Automated PAN & Aadhaar OCR extraction with 99.8% match rate</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(true)}
                  className="bg-[#8A7BFF]/10 text-[#8A7BFF] hover:bg-[#8A7BFF]/20 border border-[#8A7BFF]/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Open AI Scanner
                </button>
              </div>

              {ocrConfidence > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-950">AI OCR Verified ({ocrConfidence}% Match)</p>
                      <p className="text-emerald-800">Extracted PAN: {panNumber} | Aadhaar: {aadhaarNumber}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOcrModalOpen(true)}
                    className="text-xs font-bold text-emerald-700 underline"
                  >
                    Scan Again
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setOcrModalOpen(true)}
                  className="border-2 border-dashed border-[#4F5DFF]/40 bg-[#F7F8FC] hover:bg-[#4F5DFF]/5 rounded-2xl p-6 text-center cursor-pointer transition-all"
                >
                  <Sparkles className="w-8 h-8 text-[#4F5DFF] mx-auto mb-2 animate-bounce" />
                  <p className="font-bold text-sm text-[#1F1F24]">Click to Scan PAN / Aadhaar Document with AI</p>
                  <p className="text-xs text-[#6C7285] mt-1">Extracts identity fields and calculates photo match score</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">PAN Card Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1F1F24] font-mono uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Aadhaar Card Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="9876 5432 1098"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1F1F24] font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all text-xs"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-xs flex items-center gap-2"
                >
                  Next: Bank Account Setup <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Account & AutoPay Mandate */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#E8EAF8] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#1F1F24]">3. Bank Account & AutoPay Setup</h3>
                <p className="text-xs text-[#6C7285]">Linked account for monthly AutoPay deposits & year-end maturity payouts</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Bank Account Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50100293847123"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1F1F24] font-mono outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1F24] mb-1">IFSC Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1F1F24] font-mono uppercase outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-2">Preferred AutoPay UPI Provider:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'gpay', name: 'Google Pay' },
                    { id: 'phonepe', name: 'PhonePe' },
                    { id: 'paytm', name: 'Paytm' },
                    { id: 'netbanking', name: 'NetBanking' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAutopayMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        autopayMethod === m.id
                          ? 'border-[#4F5DFF] bg-[#4F5DFF]/10 text-[#4F5DFF]'
                          : 'border-[#E8EAF8] bg-[#F7F8FC] text-[#1F1F24]'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8] text-xs text-[#6C7285] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>By submitting, you consent to NPCI AutoPay mandate registration under RBI Escrow trustee guidelines.</span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-xs flex items-center gap-2"
                >
                  Submit KYC & Complete Setup <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </form>
      )}

      {/* AI OCR Scanner Modal */}
      <AIOCRScannerModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onExtracted={handleOCRExtracted}
      />

    </div>
  );
};
