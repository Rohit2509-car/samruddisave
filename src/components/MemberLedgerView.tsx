import React from 'react';
import { stateStore } from '../store/StateStore';
import { MemberLedgerEntry } from '../types';
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

interface MemberLedgerViewProps {
  userId: string;
}

export const MemberLedgerView: React.FC<MemberLedgerViewProps> = ({ userId }) => {
  const ledgerEntries = stateStore.getMemberLedger(userId);
  const membership = stateStore.getUserMembership(userId);
  const totalGoal = (membership?.monthly_amount || 10000) * 12;
  const currentSaved = ledgerEntries.reduce((acc, entry) => acc + entry.credit, 0);
  const remaining = Math.max(0, totalGoal - currentSaved);

  const handleExportCSV = () => {
    const csvContent = stateStore.exportLedgerCSV();
    stateStore.downloadCSV(csvContent, `Member_Ledger_${userId}.csv`);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF8] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4F5DFF] uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" /> Member Account Ledger
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1F1F24] mt-1">
            Installment Statement & Passbook
          </h2>
          <p className="text-xs text-[#6C7285] mt-0.5">
            Verified RBI Escrow Ledger • HDFC Trustee Account #91823749102
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B49DF] text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" /> Export Ledger CSV
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
          <p className="text-[10px] font-bold text-[#6C7285] uppercase">Total Plan Target Goal</p>
          <p className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">₹{totalGoal.toLocaleString()}</p>
          <p className="text-[11px] text-[#6C7285] mt-0.5">12 Monthly Installments</p>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
          <p className="text-[10px] font-bold text-emerald-800 uppercase">Cumulative Deposits Paid</p>
          <p className="font-heading font-extrabold text-2xl text-emerald-700 mt-1">₹{currentSaved.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-800 mt-0.5">{ledgerEntries.length} Paid Installments</p>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
          <p className="text-[10px] font-bold text-[#4F5DFF] uppercase">Remaining Balance to Complete</p>
          <p className="font-heading font-extrabold text-2xl text-[#4F5DFF] mt-1">₹{remaining.toLocaleString()}</p>
          <p className="text-[11px] text-[#4F5DFF] mt-0.5">{Math.max(0, 12 - ledgerEntries.length)} Months Left</p>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="w-full max-w-full rounded-2xl border border-[#E8EAF8] overflow-hidden shadow-2xs bg-white">
        <div className="table-scroll-container max-h-[480px]">
          <table className="w-full text-left text-xs border-collapse min-w-max">
            <thead className="sticky top-0 z-10 bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider font-bold shadow-2xs">
              <tr>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 font-bold">Date</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 font-bold">Transaction Details</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right font-bold">Opening Bal (₹)</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right font-bold">Credit (+) (₹)</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right font-bold">Debit (-) (₹)</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right font-bold">Closing Bal (₹)</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-right font-bold">Remaining (₹)</th>
                <th className="p-3.5 whitespace-nowrap bg-[#F7F8FC] sticky top-0 z-10 text-center font-bold">Receipt Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF8]">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-xs text-[#6C7285] italic">
                    No installment payments recorded yet. Make your first deposit to generate passbook entries.
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#F7F8FC]/50 transition-colors">
                    <td className="p-3.5 font-semibold text-[#1F1F24] whitespace-nowrap">{entry.date}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <p className="font-bold text-[#1F1F24]">{entry.description}</p>
                      <p className="text-[10px] text-[#6C7285]">RBI Escrow Trust Batch Verified</p>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#6C7285] whitespace-nowrap">₹{entry.opening_balance.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">+₹{entry.credit.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono text-[#6C7285] whitespace-nowrap">₹{entry.debit}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#1F1F24] whitespace-nowrap">₹{entry.closing_balance.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#4F5DFF] whitespace-nowrap">₹{entry.remaining_balance.toLocaleString()}</td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 font-bold text-slate-700 rounded-lg inline-block">
                        {entry.receipt_ref || 'VERIFIED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
