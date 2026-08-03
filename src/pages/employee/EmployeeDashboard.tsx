import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { UserProfile, MaturityPayout, GiftHamper } from '../../types';
import { GIFT_HAMPERS } from '../../data/mockData';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Gift,
  ShieldCheck,
  UserCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Search
} from 'lucide-react';

interface EmployeeDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [payouts, setPayouts] = useState<MaturityPayout[]>(stateStore.getPayouts());
  const [activeTab, setActiveTab] = useState<'kyc' | 'hampers' | 'maker_payouts' | 'grace_reminders'>('kyc');
  const [selectedHamperId, setSelectedHamperId] = useState<string>('hamper-1');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setProfiles(stateStore.getProfiles());
      setPayouts(stateStore.getPayouts());
    });
    return unsubscribe;
  }, []);

  const pendingKYC = profiles.filter((p) => p.role === 'member' && p.kyc_status === 'pending');
  const approvedMembers = profiles.filter((p) => p.role === 'member' && p.kyc_status === 'approved');
  const pendingMakerPayouts = payouts.filter((p) => p.maker_status === 'PENDING_MAKER');

  const handleApproveKYC = (userId: string) => {
    stateStore.updateKYCStatus(userId, 'approved', 'Karthikeyan (MRM Officer)');
  };

  const handleRejectKYC = (userId: string) => {
    stateStore.updateKYCStatus(userId, 'rejected', 'Karthikeyan (MRM Officer)');
  };

  const handleAllocateHamper = (userId: string) => {
    stateStore.allocateHamper(userId, selectedHamperId, 'Karthikeyan (MRM Officer)');
    alert(`Successfully allocated gift hamper to member.`);
  };

  const handleVerifyMakerStep = (payoutId: string) => {
    stateStore.verifyMakerPayout(payoutId, 'Karthikeyan (MRM Officer)');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1F1F24] to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            RBAC Access Tier: Employee (MRM Officer)
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-white mt-2">
            MRM Verification & Operations Portal
          </h1>
          <p className="text-xs text-slate-300">
            Audit AI OCR submissions, allocate gift hampers, & execute MAKER-step maturity payout verifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <p className="font-heading font-extrabold text-2xl text-amber-400">{pendingKYC.length}</p>
            <p className="text-[10px] text-slate-300">Pending KYC</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <p className="font-heading font-extrabold text-2xl text-emerald-400">{pendingMakerPayouts.length}</p>
            <p className="text-[10px] text-slate-300">MAKER Disbursals</p>
          </div>
        </div>
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex space-x-2 border-b border-[#E8EAF8] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`py-2.5 px-4 rounded-xl transition-all ${
            activeTab === 'kyc' ? 'bg-[#1F1F24] text-white shadow-sm' : 'text-[#6C7285] hover:bg-slate-100'
          }`}
        >
          Pending KYC Queue ({pendingKYC.length})
        </button>
        <button
          onClick={() => setActiveTab('hampers')}
          className={`py-2.5 px-4 rounded-xl transition-all ${
            activeTab === 'hampers' ? 'bg-[#1F1F24] text-white shadow-sm' : 'text-[#6C7285] hover:bg-slate-100'
          }`}
        >
          Maturity Gift Hamper Allocations
        </button>
        <button
          onClick={() => setActiveTab('maker_payouts')}
          className={`py-2.5 px-4 rounded-xl transition-all ${
            activeTab === 'maker_payouts' ? 'bg-[#1F1F24] text-white shadow-sm' : 'text-[#6C7285] hover:bg-slate-100'
          }`}
        >
          MAKER Step Payout Verification ({pendingMakerPayouts.length})
        </button>
      </div>

      {/* TAB 1: Pending KYC Queue */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg text-[#1F1F24]">Pending Member Applications</h3>
            <span className="text-xs text-[#6C7285]">99.8% AI OCR Confidence Threshold Enforced</span>
          </div>

          {pendingKYC.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#E8EAF8] text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-[#1F1F24]">No Pending KYC Applications in Queue</p>
              <p className="text-xs text-[#6C7285]">All submitted PAN & Aadhaar OCR records have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingKYC.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8EAF8] pb-3">
                    <div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {p.pipeline_stage}
                      </span>
                      <h4 className="font-heading font-extrabold text-lg text-[#1F1F24] mt-1">{p.full_name}</h4>
                      <p className="text-xs text-[#6C7285]">{p.email} • {p.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        OCR Confidence: {p.ocr_confidence}% Match
                      </span>
                    </div>
                  </div>

                  {/* Document & Bank Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
                    <div>
                      <p className="font-semibold text-[#6C7285] mb-1">Identity OCR Extraction:</p>
                      <p className="font-mono text-[#1F1F24]">PAN: {p.pan_number}</p>
                      <p className="font-mono text-[#1F1F24]">Aadhaar: {p.aadhaar_number}</p>
                      <p className="text-emerald-700 font-semibold mt-1">✓ Photo Identity & Name Match Confirmed</p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#6C7285] mb-1">Linked Bank & AutoPay Setup:</p>
                      <p className="font-mono text-[#1F1F24]">{p.bank_details?.bank_name} A/C {p.bank_details?.account_number}</p>
                      <p className="font-mono text-[#1F1F24]">IFSC: {p.bank_details?.ifsc}</p>
                      <p className="text-purple-700 font-semibold uppercase mt-1">AutoPay: {p.bank_details?.autopay_method}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRejectKYC(p.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-5 rounded-xl border border-rose-200 transition-colors text-xs flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Request Resubmission
                    </button>
                    <button
                      onClick={() => handleApproveKYC(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Account & KYC
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Gift Hamper Allocation */}
      {activeTab === 'hampers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#1F1F24]">Maturity Gift Hamper Allocation Module</h3>
            <p className="text-xs text-[#6C7285]">Assign curated luxury gift hampers to approved member wallets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#6C7285] uppercase tracking-wider">
                1. Select Member Profile:
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {approvedMembers.map((m) => {
                  const currentHamper = GIFT_HAMPERS.find(h => h.id === m.allocated_hamper_id);

                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#1F1F24]">{m.full_name}</p>
                        <p className="text-[11px] text-[#6C7285]">{m.email}</p>
                        {currentHamper && (
                          <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.2 rounded mt-1 inline-block">
                            Assigned: {currentHamper.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAllocateHamper(m.id)}
                        className="bg-[#4F5DFF] text-white font-bold py-1.5 px-3 rounded-xl hover:bg-[#6A6DFF] transition-colors"
                      >
                        Assign Gift
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#6C7285] uppercase tracking-wider">
                2. Select Gift Hamper to Assign:
              </label>
              <div className="space-y-2">
                {GIFT_HAMPERS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHamperId(h.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                      selectedHamperId === h.id
                        ? 'border-[#4F5DFF] bg-[#4F5DFF]/10 text-[#4F5DFF] font-bold'
                        : 'border-[#E8EAF8] bg-[#F7F8FC] text-[#1F1F24]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{h.name}</span>
                      <span className="font-mono font-bold">₹{h.retail_value.toLocaleString('en-IN')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAKER Step Payout Verification */}
      {activeTab === 'maker_payouts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg text-[#1F1F24]">MAKER Verification Queue</h3>
            <span className="text-xs text-[#6C7285]">Audit 12-Month Ledger Before Checker Disbursal</span>
          </div>

          {payouts.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8EAF8] pb-3">
                <div>
                  <h4 className="font-heading font-bold text-lg text-[#1F1F24]">{p.user_name}</h4>
                  <p className="text-xs text-[#6C7285]">Maturity Payout ID: {p.id} • {p.user_email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  p.maker_status === 'VERIFIED_BY_MAKER' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {p.maker_status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
                <div>
                  <p className="text-[#6C7285]">Principal Saved (12 Mos):</p>
                  <p className="font-mono font-bold text-[#1F1F24]">₹{p.principal_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[#6C7285]">Cash Bonus (5% Rate):</p>
                  <p className="font-mono font-bold text-emerald-600">+₹{p.bonus_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[#6C7285]">Total Wire Transfer:</p>
                  <p className="font-mono font-bold text-[#4F5DFF] text-base">₹{p.total_disbursal_amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {p.maker_status === 'PENDING_MAKER' ? (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleVerifyMakerStep(p.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify MAKER Step & Transmit to Escrow Admin
                  </button>
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold text-right">
                  ✓ Verified by Officer {p.maker_verified_by} on {new Date(p.maker_verified_at!).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
