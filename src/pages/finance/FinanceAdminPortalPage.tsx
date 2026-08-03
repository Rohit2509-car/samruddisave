import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { MaturityPayout } from '../../types';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Send,
  Lock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface FinanceAdminPortalPageProps {
  onNavigate: (path: string) => void;
}

export const FinanceAdminPortalPage: React.FC<FinanceAdminPortalPageProps> = ({ onNavigate }) => {
  const [payouts, setPayouts] = useState<MaturityPayout[]>(stateStore.getPayouts());
  const [escrowBalance, setEscrowBalance] = useState<number>(stateStore.getEscrowBalance());
  const [bankRef, setBankRef] = useState<string>('HDFC99281726');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setPayouts(stateStore.getPayouts());
      setEscrowBalance(stateStore.getEscrowBalance());
    });
    return unsubscribe;
  }, []);

  const makerVerifiedPayouts = payouts.filter((p) => p.maker_status === 'VERIFIED_BY_MAKER');
  const disbursedPayouts = payouts.filter((p) => p.checker_status === 'DISBURSED');

  const handleExecuteDisbursal = (payoutId: string) => {
    if (!bankRef) {
      alert('Please enter a valid bank transfer reference ID (e.g. HDFC99281726).');
      return;
    }
    stateStore.disburseCheckerPayout(payoutId, bankRef, 'Vikram Sethi (Finance Escrow Admin)');
    alert(`CHECKER Final Disbursal executed! Bank Ref ${bankRef} logged to 256-bit encrypted audit trail.`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-[#1F1F24] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            RBAC Access Tier: Finance Escrow Admin (CHECKER)
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-white mt-2">
            Tripartite Bank Escrow Disbursal Desk
          </h1>
          <p className="text-xs text-slate-300">
            RBI Escrow Trustee Bank Account #9182374619 • NEFT / RTGS Wire Disbursals
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-right">
          <p className="text-xs text-slate-300">RBI Escrow Balance</p>
          <p className="font-heading font-extrabold text-3xl text-emerald-400">
            ₹{escrowBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1 justify-end mt-1">
            <ShieldCheck className="w-3 h-3" /> HDFC Trustee Custody
          </span>
        </div>
      </div>

      {/* Disbursal Queue */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-[#1F1F24] text-lg">
            CHECKER Disbursal Execution Queue ({makerVerifiedPayouts.length})
          </h3>
          <span className="text-xs text-[#6C7285]">Double-Sign Authorized Only</span>
        </div>

        {makerVerifiedPayouts.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#E8EAF8] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-[#1F1F24]">No Payouts Awaiting CHECKER Disbursal</p>
            <p className="text-xs text-[#6C7285]">MAKER-verified payouts will appear here for final bank transfer authorization.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {makerVerifiedPayouts.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-purple-200 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8EAF8] pb-3">
                  <div>
                    <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                      MAKER Verified by {p.maker_verified_by}
                    </span>
                    <h4 className="font-heading font-extrabold text-xl text-[#1F1F24] mt-1">{p.user_name}</h4>
                    <p className="text-xs text-[#6C7285]">{p.user_email} • Membership: {p.membership_id}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#6C7285]">Total Disbursal Amount</span>
                    <p className="font-heading font-extrabold text-2xl text-[#4F5DFF]">
                      ₹{p.total_disbursal_amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
                  <div>
                    <span className="text-[#6C7285]">Principal Saved (12 Mos):</span>
                    <p className="font-bold text-[#1F1F24] font-mono">₹{p.principal_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[#6C7285]">5% Cash Bonus Yield:</span>
                    <p className="font-bold text-emerald-600 font-mono">+₹{p.bonus_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[#6C7285]">Allocated Gift Hamper:</span>
                    <p className="font-bold text-purple-700">{p.hamper_name || 'Artisan Gift'}</p>
                  </div>
                </div>

                {/* Wire Transfer Inputs */}
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-end justify-between gap-4 text-xs">
                  <div className="w-full sm:w-80">
                    <label className="block text-xs font-semibold text-purple-950 mb-1">
                      Bank Wire Reference No (NEFT/RTGS):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC99281726"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 font-mono text-xs font-bold text-[#1F1F24] outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleExecuteDisbursal(p.id)}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Execute CHECKER Disbursal & Close
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disbursed Audit Records */}
      {disbursedPayouts.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-[#1F1F24] text-lg">Completed Disbursal Ledger</h3>
          <div className="space-y-3 text-xs">
            {disbursedPayouts.map((dp) => (
              <div key={dp.id} className="bg-[#F7F8FC] border border-[#E8EAF8] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1F1F24]">{dp.user_name}</p>
                  <p className="text-[11px] text-[#6C7285] font-mono">Bank Ref: {dp.bank_transaction_ref}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-600">₹{dp.total_disbursal_amount.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    DISBURSED & CLOSED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
