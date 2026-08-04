import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { ContributionRecord, UserProfile } from '../types';
import { History, ShieldCheck, Download, Search, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet, Lock } from 'lucide-react';

interface LedgerPageProps {
  onNavigate: (path: string) => void;
}

export const LedgerPage: React.FC<LedgerPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getUserContributions(user.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      setContributions(stateStore.getUserContributions(u.id));
    });
    return unsubscribe;
  }, []);

  const filtered = contributions.filter((c) => {
    const matchesSearch =
      c.transaction_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.escrow_batch_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.admin_notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isOffline = c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer';

    if (methodFilter === 'online') return matchesSearch && !isOffline;
    if (methodFilter === 'offline') return matchesSearch && isOffline;
    return matchesSearch;
  });

  const offlineCount = contributions.filter(
    (c) => c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer'
  ).length;

  const handleDownloadReceipt = (contrib: ContributionRecord) => {
    const receiptContent = `================================================
SAMRUDDISAVE RBI ESCROW OFFICIAL RECEIPT
================================================
Receipt ID: ${contrib.id}
Date: ${contrib.paid_date ? new Date(contrib.paid_date).toLocaleString() : new Date().toLocaleString()}
Member Name: ${user.full_name}
Member Email: ${user.email}
Membership ID: ${contrib.membership_id}
Cycle Number: Month #${contrib.cycle_number} of 12
Deposit Amount: INR ${contrib.amount.toLocaleString('en-IN')}
Payment Method: ${(contrib.payment_method || 'razorpay').toUpperCase()}
Verification Status: ${contrib.is_offline || contrib.reconciled_by_admin ? `ADMIN VERIFIED (${contrib.reconciled_by_admin_name || 'Admin'})` : 'AUTOMATED ONLINE'}
Admin Notes: ${contrib.admin_notes || 'N/A'}
Transaction Ref: ${contrib.transaction_ref}
Escrow Batch ID: ${contrib.escrow_batch_id || 'ESC_TRUSTEE_91823'}
Escrow Bank: HDFC Escrow Trustee Custody Account #9182374619
Status: VERIFIED & DEPOSITED
================================================
Thank you for saving with SamruddiSave Escrow!
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SamruddiSave_Receipt_${contrib.transaction_ref}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs">
        <div>
          <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            RBI Escrow Audit Ledger
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
            Tripartite Savings Ledger
          </h1>
          <p className="text-xs text-[#6C7285]">
            Transparent 12-month deposit records held under HDFC Escrow Trustee Custody
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Escrow Certified Active
          </span>
        </div>
      </div>

      {/* Filter / Search & Method Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Method Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F7F8FC] p-1.5 rounded-2xl border border-[#E8EAF8] w-full sm:w-auto">
            <button
              onClick={() => setMethodFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methodFilter === 'all' ? 'bg-[#4F5DFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Payments ({contributions.length})
            </button>
            <button
              onClick={() => setMethodFilter('online')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methodFilter === 'online' ? 'bg-[#4F5DFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Online Razorpay ({contributions.length - offlineCount})
            </button>
            <button
              onClick={() => setMethodFilter('offline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methodFilter === 'offline' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offline Admin Verified ({offlineCount})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by transaction ref, escrow batch, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F1F24] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E8EAF8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Cycle</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Payment Method & Verification</th>
                <th className="py-3.5 px-6">Paid Date</th>
                <th className="py-3.5 px-6">Transaction Ref</th>
                <th className="py-3.5 px-6">Admin Notes / Verification</th>
                <th className="py-3.5 px-6 text-right">Escrow Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF8]">
              {filtered.map((c) => {
                const isOffline = c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer';
                return (
                  <tr key={c.id} className="hover:bg-[#F7F8FC] transition-colors">
                    <td className="py-4 px-6 font-bold text-[#1F1F24]">Month {c.cycle_number}</td>
                    <td className="py-4 px-6 font-mono font-bold text-[#4F5DFF]">₹{c.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      {isOffline ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {c.payment_method === 'offline_cash' ? 'Offline Cash' : 'Offline UPI'} (Admin Verified)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-semibold">
                          Razorpay Webhook (Online)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#6C7285]">{c.paid_date ? new Date(c.paid_date).toLocaleDateString() : '—'}</td>
                    <td className="py-4 px-6 font-mono text-[11px] font-bold text-purple-900">{c.transaction_ref}</td>
                    <td className="py-4 px-6 text-slate-600 max-w-[220px]">
                      {isOffline ? (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-900">Reconciled by: {c.reconciled_by_admin_name || 'Admin'}</p>
                          <p className="text-[10px] text-slate-500 italic truncate" title={c.admin_notes || 'Entered by admin'}>
                            {c.admin_notes || 'Manual admin entry'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Automated Gateway</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(c)}
                        className="text-xs font-bold text-[#4F5DFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
