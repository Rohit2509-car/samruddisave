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
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-7 sm:p-9 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            RBAC Access Tier: Finance Escrow Admin (CHECKER)
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2.5">
            Tripartite Bank Escrow Disbursal Desk
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            RBI Escrow Trustee Bank Account #9182374619 • NEFT / RTGS Wire Disbursals
          </p>
        </div>

        <div className="bg-white/10 p-4 px-5 rounded-2xl border border-white/15 text-right backdrop-blur-md">
          <p className="text-xs text-slate-300 font-medium">RBI Escrow Balance</p>
          <p className="font-heading font-extrabold text-3xl text-emerald-400 mt-0.5">
            ₹{escrowBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1 justify-end mt-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> HDFC Trustee Custody
          </span>
        </div>
      </div>

      {/* Disbursal Queue */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-slate-900 text-lg">
            CHECKER Disbursal Execution Queue ({makerVerifiedPayouts.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Double-Sign Authorized Only</span>
        </div>

        {makerVerifiedPayouts.length === 0 ? (
          <div className="nexora-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-slate-900">No Payouts Awaiting CHECKER Disbursal</p>
            <p className="text-xs text-slate-500 font-medium">MAKER-verified payouts will appear here for final bank transfer authorization.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {makerVerifiedPayouts.map((p) => (
              <div key={p.id} className="nexora-card p-6 sm:p-7 rounded-3xl border border-purple-300/80 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      MAKER Verified by {p.maker_verified_by}
                    </span>
                    <h4 className="font-heading font-extrabold text-xl text-slate-900 mt-1">{p.user_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{p.user_email} • Membership: {p.membership_id}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium">Total Disbursal Amount</span>
                    <p className="font-heading font-extrabold text-2xl text-blue-600">
                      ₹{p.total_disbursal_amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70">
                  <div>
                    <span className="text-slate-500 font-medium">Principal Saved (12 Mos):</span>
                    <p className="font-bold text-slate-900 font-mono mt-0.5">₹{p.principal_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">5% Cash Bonus Yield:</span>
                    <p className="font-bold text-emerald-600 font-mono mt-0.5">+₹{p.bonus_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Allocated Gift Hamper:</span>
                    <p className="font-bold text-purple-700 mt-0.5">{p.hamper_name || 'Artisan Gift'}</p>
                  </div>
                </div>

                {/* Wire Transfer Inputs */}
                <div className="bg-purple-50/60 p-4.5 rounded-2xl border border-purple-200/70 flex flex-col sm:flex-row items-end justify-between gap-4 text-xs">
                  <div className="w-full sm:w-80">
                    <label className="block text-xs font-semibold text-purple-950 mb-1.5">
                      Bank Wire Reference No (NEFT/RTGS):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC99281726"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleExecuteDisbursal(p.id)}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md text-xs flex items-center justify-center gap-2"
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
        <div className="nexora-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-slate-900 text-lg">Completed Disbursal Ledger</h3>
          <div className="space-y-3 text-xs">
            {disbursedPayouts.map((dp) => (
              <div key={dp.id} className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{dp.user_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Bank Ref: {dp.bank_transaction_ref}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-600">₹{dp.total_disbursal_amount.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5">
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

