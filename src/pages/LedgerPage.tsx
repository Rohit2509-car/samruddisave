import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { ContributionRecord, UserProfile } from '../types';
import { History, ShieldCheck, Download, Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface LedgerPageProps {
  onNavigate: (path: string) => void;
}

export const LedgerPage: React.FC<LedgerPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getUserContributions(user.id));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      setContributions(stateStore.getUserContributions(u.id));
    });
    return unsubscribe;
  }, []);

  const filtered = contributions.filter(c =>
    c.transaction_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.escrow_batch_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 nexora-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="bg-blue-50 text-blue-600 border border-blue-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
            RBI Escrow Audit Ledger
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1.5">
            Tripartite Savings Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Transparent 12-month deposit records held under HDFC Escrow Trustee Custody
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200/70 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Escrow Certified
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="nexora-card p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by transaction reference or escrow batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {filtered.length} Entries
        </div>
      </div>

      {/* Table */}
      <div className="nexora-card rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Cycle</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Paid Date</th>
                <th className="py-3.5 px-6">Transaction Ref</th>
                <th className="py-3.5 px-6">Escrow Batch</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">Month {c.cycle_number}</td>
                  <td className="py-4 px-6 font-mono font-bold text-blue-600">₹{c.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{c.due_date}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{c.paid_date ? new Date(c.paid_date).toLocaleDateString() : '—'}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-900">{c.transaction_ref}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-purple-700 font-medium">{c.escrow_batch_id}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'GRACE_PERIOD'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

