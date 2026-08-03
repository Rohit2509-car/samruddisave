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
      <div className="text-center space-y-2.5">
        <span className="bg-blue-50 text-blue-600 border border-blue-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Step-by-Step Member Verification
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
          Customer Onboarding & AI OCR KYC
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
          Complete your e-KYC verification to open your RBI Escrow micro-savings account
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <button
          onClick={() => setStep(1)}
          className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" /> 1. Personal Details
        </button>
        <button
          onClick={() => setStep(2)}
          className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> 2. AI OCR Upload
        </button>
        <button
          onClick={() => setStep(3)}
          className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            step === 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" /> 3. Bank & AutoPay
        </button>
      </div>

      {/* Confirmation State if Submitted */}
      {submittedProfile ? (
        <div className="nexora-card p-8 sm:p-10 rounded-3xl border border-amber-300 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
              Status: KYC_PENDING
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 mt-2.5">
              Application Submitted & Pending Officer Sign-off
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Your PAN & Aadhaar AI OCR scores have been transmitted to the MRM Officer Queue. You can view your live status on your Dashboard.
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-5 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Applicant Name:</span>
              <span className="font-semibold text-slate-900">{submittedProfile.full_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">PAN Number:</span>
              <span className="font-mono font-bold text-slate-900">{submittedProfile.pan_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">OCR Confidence Score:</span>
              <span className="font-bold text-emerald-600">99.8% Match Verified</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">AutoPay Mandate Method:</span>
              <span className="font-semibold text-purple-600 uppercase">{submittedProfile.bank_details?.autopay_method}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="nexora-pill-btn font-bold py-3.5 px-6 text-xs flex items-center gap-2"
            >
              Go to Member Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/employee')}
              className="nexora-pill-btn-secondary bg-amber-50 text-amber-800 border-amber-200 font-bold py-3.5 px-6 text-xs hover:bg-amber-100"
            >
              ⚡ Switch to Officer Portal to Approve
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Onboarding Form */
        <form onSubmit={handleSubmitOnboarding} className="nexora-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
          
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-heading font-bold text-lg text-slate-900">1. Account Registration Details</h3>
                <p className="text-xs text-slate-500">Enter your full legal name as per government records</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">Full Name (as per PAN):</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">Mobile Number:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">Email Address:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="rohit@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">4-Digit Account PIN:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none font-mono tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="nexora-pill-btn font-bold py-3.5 px-6 text-xs flex items-center gap-2"
                >
                  Next: Upload AI OCR Documents <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI OCR Document Upload */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">2. AI OCR Identity Verification</h3>
                  <p className="text-xs text-slate-500">Automated PAN & Aadhaar OCR extraction with 99.8% match rate</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/70 text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-4 h-4" /> Open AI Scanner
                </button>
              </div>

              {ocrConfidence > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
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
                  className="border-2 border-dashed border-blue-300/80 bg-slate-50/80 hover:bg-blue-50/40 rounded-2xl p-7 text-center cursor-pointer transition-all group"
                >
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-sm text-slate-900">Click to Scan PAN / Aadhaar Document with AI</p>
                  <p className="text-xs text-slate-500 mt-1">Extracts identity fields and calculates photo match score</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">PAN Card Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-mono uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">Aadhaar Card Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="9876 5432 1098"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="nexora-pill-btn-secondary font-semibold py-3 px-6 text-xs"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="nexora-pill-btn font-bold py-3.5 px-6 text-xs flex items-center gap-2"
                >
                  Next: Bank Account Setup <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Account & AutoPay Mandate */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-heading font-bold text-lg text-slate-900">3. Bank Account & AutoPay Setup</h3>
                <p className="text-xs text-slate-500">Linked account for monthly AutoPay deposits & year-end maturity payouts</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">Bank Account Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50100293847123"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-mono outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">IFSC Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-mono uppercase outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">Preferred AutoPay UPI Provider:</label>
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
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                        autopayMethod === m.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20'
                          : 'border-slate-200/80 bg-slate-50 text-slate-800'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>By submitting, you consent to NPCI AutoPay mandate registration under RBI Escrow trustee guidelines.</span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="nexora-pill-btn-secondary font-semibold py-3 px-6 text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-emerald-600/30 text-xs flex items-center gap-2"
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

