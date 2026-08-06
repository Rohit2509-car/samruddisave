import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, ContributionRecord, AuditLog } from '../types';
import { FileText, Download, TrendingUp, DollarSign, Users, PieChart, ShieldCheck, Printer, Calendar } from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (path: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [user] = useState<UserProfile>(stateStore.getCurrentUser());
  const [contributions] = useState<ContributionRecord[]>(stateStore.getUserContributions(user.id));
  const [activeTab, setActiveTab] = useState<'summary' | 'payments' | 'cash_online' | 'overdue'>('summary');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff';

  const totalPaidAmount = contributions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);
  const totalPaidCount = contributions.filter(c => c.status === 'PAID').length;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 print:p-0 print:m-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8EAF8] pb-6 print:hidden">
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {isAdmin ? 'Admin Financial Audit Reports' : 'Member Financial Statements'}
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-1">
            Chit Fund Reports & Analytics
          </h1>
        </div>

        <button
          onClick={handlePrintReport}
          className="bg-white hover:bg-slate-50 text-[#1F1F24] border border-[#E8EAF8] font-bold py-2.5 px-5 rounded-2xl transition-all shadow-xs text-xs flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#4F5DFF]" /> Print / Save PDF Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8EAF8] gap-4 text-xs font-bold print:hidden">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'summary' ? 'border-[#4F5DFF] text-[#4F5DFF]' : 'border-transparent text-[#6C7285] hover:text-[#1F1F24]'
          }`}
        >
          Summary Overview
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'payments' ? 'border-[#4F5DFF] text-[#4F5DFF]' : 'border-transparent text-[#6C7285] hover:text-[#1F1F24]'
          }`}
        >
          Payment History
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('cash_online')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'cash_online' ? 'border-[#4F5DFF] text-[#4F5DFF]' : 'border-transparent text-[#6C7285] hover:text-[#1F1F24]'
              }`}
            >
              Cash vs Online Breakdown
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'overdue' ? 'border-[#4F5DFF] text-[#4F5DFF]' : 'border-transparent text-[#6C7285] hover:text-[#1F1F24]'
              }`}
            >
              Pending & Overdue Report
            </button>
          </>
        )}
      </div>

      {/* Report Cards Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-1">
          <span className="text-xs text-[#6C7285] font-semibold">Total Paid Contributions</span>
          <p className="font-heading font-extrabold text-3xl text-[#1F1F24]">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{totalPaidCount} Cycles Completed</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-1">
          <span className="text-xs text-[#6C7285] font-semibold">Escrow Bank Balance</span>
          <p className="font-heading font-extrabold text-3xl text-[#4F5DFF]">₹{(totalPaidAmount * 1.05).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-blue-600 font-bold">HDFC RBI Custody Trustee</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-1">
          <span className="text-xs text-[#6C7285] font-semibold">Year-End Bonus Earnings</span>
          <p className="font-heading font-extrabold text-3xl text-emerald-600">₹{(totalPaidAmount * 0.05).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-700 font-bold">5% Bonus Tier Active</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xl space-y-4">
        <h3 className="font-heading font-bold text-lg text-[#1F1F24]">
          {activeTab === 'summary' && 'Ledger & Contribution Summary'}
          {activeTab === 'payments' && 'Payment History Breakdown'}
          {activeTab === 'cash_online' && 'Admin Collection: Cash vs Online Breakdown'}
          {activeTab === 'overdue' && 'Overdue & Grace Period Watchlist'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider">
                <th className="p-3.5 font-bold">Cycle</th>
                <th className="p-3.5 font-bold">Date</th>
                <th className="p-3.5 font-bold">Amount</th>
                <th className="p-3.5 font-bold">Payment Mode</th>
                <th className="p-3.5 font-bold">Ref / Receipt #</th>
                <th className="p-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF8]">
              {contributions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-[#1F1F24]">Cycle {c.cycle_number}</td>
                  <td className="p-3.5 text-[#6C7285]">{new Date(c.paid_date).toLocaleDateString()}</td>
                  <td className="p-3.5 font-bold font-mono text-[#1F1F24]">₹{c.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3.5">
                    <span className="capitalize bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {c.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#6C7285]">{c.transaction_ref}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
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
