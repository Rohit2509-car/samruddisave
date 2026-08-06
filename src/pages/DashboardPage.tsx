import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, Membership, ContributionRecord, GiftHamper } from '../types';
import { SAVINGS_PLANS, GIFT_HAMPERS } from '../data/mockData';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  CreditCard,
  ArrowRight,
  Zap,
  Lock,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Check,
  Download,
  User,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfileEditModal } from '../components/UserProfileEditModal';
import { PrintableReceiptModal } from '../components/PrintableReceiptModal';
import { MemberLedgerView } from '../components/MemberLedgerView';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(user ? stateStore.getUserMembership(user.id) : undefined);
  const [contributions, setContributions] = useState<ContributionRecord[]>(user ? stateStore.getUserContributions(user.id) : []);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewReceiptRecord, setViewReceiptRecord] = useState<ContributionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'circles' | 'kyc' | 'ledger' | 'hampers'>('overview');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      if (u) {
        setMembership(stateStore.getUserMembership(u.id));
        setContributions(stateStore.getUserContributions(u.id));
      } else {
        setMembership(undefined);
        setContributions([]);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E8EAF8] text-center space-y-4 shadow-xl">
        <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24]">Signed Out</h2>
        <p className="text-xs text-[#6C7285]">Please sign in to view your micro-savings wallet dashboard.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const plan = SAVINGS_PLANS.find((p) => p.id === membership?.plan_id) || SAVINGS_PLANS[0];
  const allocatedHamper = GIFT_HAMPERS.find((h) => h.id === user.allocated_hamper_id);

  const isKYCPending = user.kyc_status !== 'approved';
  const paidCount = contributions.filter((c) => c.status === 'PAID').length;
  const monthlyAmount = membership?.monthly_amount || plan.monthly_amount;
  const totalSavedSoFar = paidCount * monthlyAmount;
  const totalGoalTarget = monthlyAmount * 12;
  const remainingAmount = Math.max(0, totalGoalTarget - totalSavedSoFar);
  const goalProgressPct = Math.round((paidCount / 12) * 100);
  const accruedBonus = Math.round((totalSavedSoFar * plan.cash_bonus_pct) / 100);

  // Latest paid transaction
  const paidContribs = contributions.filter(c => c.status === 'PAID');
  const latestPaid = paidContribs.length > 0 ? paidContribs[paidContribs.length - 1] : null;

  // Generate and Download Payment Receipt
  const handleDownloadReceipt = (contrib: ContributionRecord) => {
    const receiptContent = `================================================
SAMRUDDISAVE RBI ESCROW OFFICIAL RECEIPT
================================================
Receipt ID: ${contrib.id}
Date: ${contrib.paid_date ? new Date(contrib.paid_date).toLocaleString() : new Date().toLocaleString()}
Member Name: ${user.full_name}
Member Email: ${user.email}
Member Account ID: ${user.id}
Membership ID: ${contrib.membership_id}
Cycle Number: Month #${contrib.cycle_number} of 12
Deposit Amount: INR ${contrib.amount.toLocaleString('en-IN')}
Payment Method: ${(contrib.payment_method || 'razorpay').toUpperCase()}
Verification Status: ${contrib.is_offline || contrib.reconciled_by_admin ? `ADMIN VERIFIED (${contrib.reconciled_by_admin_name || 'Admin'})` : 'AUTOMATED ONLINE'}
Admin Notes: ${contrib.admin_notes || 'N/A'}
Transaction Ref: ${contrib.transaction_ref}
Escrow Batch ID: ${contrib.escrow_batch_id || 'ESC_TRUSTEE_91823'}
Escrow Bank: HDFC Escrow Trustee Account #9182374619
Status: VERIFIED & DEPOSITED
================================================
Thank you for saving with SamruddiSave Escrow!
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${contrib.transaction_ref}_${user.full_name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const csvData = stateStore.exportLedgerCSV();
    stateStore.downloadCSV(csvData, `my_passbook_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section (Matches Admin Dashboard layout) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F5DFF] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> RBI Escrow Custody Account
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F1F24] mt-1">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-xs text-[#6C7285] mt-1">
              Account ID: <span className="font-semibold text-[#1F1F24]">{user.id}</span> • Plan: <span className="font-semibold text-[#4F5DFF]">{plan.name} (₹{plan.monthly_amount.toLocaleString('en-IN')}/mo)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isKYCPending && (
              <button
                onClick={() => onNavigate('/pay')}
                className="min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-[#4F5DFF]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Make Monthly Deposit
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Passbook CSV
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation (Matches Admin Dashboard layout) */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-3xl border border-[#E8EAF8] shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#4F5DFF] text-white shadow-md'
                : 'text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24]'
            }`}
          >
            <Activity className="w-4 h-4" /> Savings Overview
          </button>

          <button
            onClick={() => setActiveTab('circles')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'circles'
                ? 'bg-[#4F5DFF] text-white shadow-md'
                : 'text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24]'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Chit Groups
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-[#4F5DFF] text-white shadow-md'
                : 'text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> KYC Status
            {isKYCPending && (
              <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#4F5DFF] text-white shadow-md'
                : 'text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Passbook & Receipts
          </button>

          <button
            onClick={() => setActiveTab('hampers')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hampers'
                ? 'bg-[#4F5DFF] text-white shadow-md'
                : 'text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24]'
            }`}
          >
            <Gift className="w-4 h-4" /> Gift Perks
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6C7285] font-bold">
                  <span>TOTAL ESCROW SAVED</span>
                  <TrendingUp className="w-4 h-4 text-[#4F5DFF]" />
                </div>
                <p className="font-heading font-extrabold text-3xl text-[#1F1F24]">
                  ₹{totalSavedSoFar.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {paidCount} of 12 Cycles Completed
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6C7285] font-bold">
                  <span>NEXT DUE DATE</span>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-heading font-extrabold text-2xl text-[#1F1F24]">
                  {membership?.next_due_date || '2026-08-05'}
                </p>
                <p className="text-[11px] text-[#4F5DFF] font-semibold">
                  ₹{monthlyAmount.toLocaleString('en-IN')} Monthly AutoPay
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6C7285] font-bold">
                  <span>ACCRUED CASH BONUS</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <p className="font-heading font-extrabold text-3xl text-[#4F5DFF]">
                  +₹{accruedBonus.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-[#6C7285]">
                  {plan.cash_bonus_pct}% Rate at Month 12 Maturity
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6C7285] font-bold">
                  <span>SAVINGS STREAK</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <p className="font-heading font-extrabold text-3xl text-amber-600">
                  {membership?.current_streak || 0} Months
                </p>
                <p className="text-[11px] text-[#6C7285]">
                  5-Day Grace Period Safeguard Active
                </p>
              </div>
            </div>

            {/* REALTIME GOAL SUMMARY & PROGRESS BAR CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAF8] pb-4">
                <div>
                  <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border border-[#4F5DFF]/20 inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Supabase Realtime Progress
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
                    Goal Progress Summary ({goalProgressPct}% Achieved)
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6C7285] font-medium">Target 12-Month Goal:</p>
                  <p className="font-heading font-extrabold text-xl text-[#1F1F24]">
                    ₹{totalGoalTarget.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#1F1F24]">
                  <span>Total Saved: <strong className="text-[#4F5DFF]">₹{totalSavedSoFar.toLocaleString('en-IN')}</strong></span>
                  <span>Remaining Target: <strong className="text-[#6C7285]">₹{remainingAmount.toLocaleString('en-IN')}</strong></span>
                </div>

                <div className="w-full h-4 bg-[#F7F8FC] rounded-full overflow-hidden p-0.5 border border-[#E8EAF8]">
                  <div
                    className="h-full bg-gradient-to-r from-[#4F5DFF] to-[#8A7BFF] rounded-full transition-all duration-700 ease-out shadow-md shadow-[#4F5DFF]/20"
                    style={{ width: `${Math.max(5, goalProgressPct)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#6C7285] font-medium pt-1">
                  <span>Month 1 Started</span>
                  <span>{paidCount} of 12 Cycles Paid</span>
                  <span>Month 12 Maturity</span>
                </div>
              </div>
            </div>

            {/* VISUAL GOAL JOURNEY (Month 1 to 12 Progress Grid) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF8] pb-4">
                <div>
                  <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    12-Month Ledger Tracking
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
                    Visual Goal Journey
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Paid ({paidCount})
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Remaining ({12 - paidCount})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const cycleNum = idx + 1;
                  const contrib = contributions.find((c) => c.cycle_number === cycleNum);
                  const isPaid = contrib?.status === 'PAID';
                  const isGrace = contrib?.status === 'GRACE_PERIOD';
                  const isNext = cycleNum === paidCount + 1;

                  return (
                    <div
                      key={cycleNum}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isPaid
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : isGrace
                          ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400'
                          : isNext
                          ? 'bg-[#4F5DFF]/5 border-[#4F5DFF] text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                          : 'bg-[#F7F8FC] border-[#E8EAF8] text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold mb-2">
                        <span>MONTH {cycleNum}</span>
                        {isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isGrace ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>

                      <p className="font-heading font-extrabold text-sm text-[#1F1F24]">
                        ₹{monthlyAmount.toLocaleString('en-IN')}
                      </p>

                      <p className="text-[10px] mt-1 font-semibold">
                        {isPaid
                          ? 'PAID'
                          : isGrace
                          ? 'GRACE PERIOD'
                          : isNext
                          ? 'DUE NEXT'
                          : 'UPCOMING'}
                      </p>

                      {isPaid && contrib && (
                        <button
                          onClick={() => handleDownloadReceipt(contrib)}
                          className="mt-2 text-[10px] font-bold text-[#4F5DFF] hover:underline flex items-center justify-center gap-1 w-full cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Receipt
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHIT GROUPS TAB */}
        {activeTab === 'circles' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E8EAF8] pb-4">
              <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Chit Groups Enrollment
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
                Your Enrolled Savings Circles
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F7F8FC] p-6 rounded-2xl border border-[#E8EAF8] space-y-3">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">ACTIVE CIRCLE</span>
                <h4 className="font-heading font-extrabold text-xl text-[#1F1F24]">₹50,000 Gold Circle</h4>
                <p className="text-xs text-[#6C7285]">Monthly Deposit: ₹1,000 • 20 Members • 12 Months</p>
                <div className="pt-2 border-t border-[#E8EAF8] flex justify-between text-xs font-bold">
                  <span>Current Status:</span>
                  <span className="text-emerald-600">Active Saver</span>
                </div>
              </div>
              <div className="bg-[#F7F8FC] p-6 rounded-2xl border border-[#E8EAF8] space-y-3 opacity-75">
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">AVAILABLE</span>
                <h4 className="font-heading font-extrabold text-xl text-[#1F1F24]">₹1,00,000 Appliance Circle</h4>
                <p className="text-xs text-[#6C7285]">Monthly Deposit: ₹2,000 • 20 Members • 12 Months</p>
                <button onClick={() => onNavigate('/circles')} className="w-full bg-[#4F5DFF] text-white text-xs font-bold py-2 rounded-xl">
                  Enroll in ₹1L Group
                </button>
              </div>
              <div className="bg-[#F7F8FC] p-6 rounded-2xl border border-[#E8EAF8] space-y-3 opacity-75">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">PREMIUM CIRCLE</span>
                <h4 className="font-heading font-extrabold text-xl text-[#1F1F24]">₹5,00,000 Diamond Circle</h4>
                <p className="text-xs text-[#6C7285]">Monthly Deposit: ₹5,000 • 20 Members • 12 Months</p>
                <button onClick={() => onNavigate('/circles')} className="w-full bg-slate-800 text-white text-xs font-bold py-2 rounded-xl">
                  Enroll in ₹5L Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KYC STATUS TAB */}
        {activeTab === 'kyc' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E8EAF8] pb-4 flex items-center justify-between">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Compliance & Identity Status
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
                  e-KYC Verification & SLA Protection
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/kyc')}
                className="bg-[#4F5DFF] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Update Documents →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Aadhaar Identity Proof</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verified</span>
                </div>
                <p className="text-xs text-[#6C7285]">Aadhaar Number: {user.aadhaar_number || '9876 **** 1098'}</p>
                <p className="text-[11px] text-slate-400">OCR Confidence Score: 99.8% Match</p>
              </div>

              <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E8EAF8] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>PAN Financial Verification</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verified</span>
                </div>
                <p className="text-xs text-[#6C7285]">PAN Card: {user.pan_number || 'ABCDE1234F'}</p>
                <p className="text-[11px] text-slate-400">Income Tax Dept Database Validated</p>
              </div>
            </div>
          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div className="animate-in fade-in duration-200">
            <MemberLedgerView userId={user.id} />
          </div>
        )}

        {/* GIFT HAMPERS TAB */}
        {activeTab === 'hampers' && (
          <div className="bg-gradient-to-r from-purple-900 to-[#1F1F24] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-200">
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Maturity Gift Perk
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-white">
                {allocatedHamper ? allocatedHamper.name : '24K Gold Coin & Appliance Hamper'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed font-medium">
                Guaranteed 100% genuine perk delivered automatically at Month 12 plan maturity.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/hampers')}
              className="bg-[#8A7BFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-purple-900/40 text-xs shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" /> Browse Full Catalogue
            </button>
          </div>
        )}

        {/* MODAL: Edit Profile */}
        {isProfileModalOpen && (
          <UserProfileEditModal
            user={user}
            onClose={() => setIsProfileModalOpen(false)}
            onSuccess={() => {
              setUser(stateStore.getCurrentUser());
            }}
          />
        )}

        {/* MODAL: Printable Receipt */}
        {viewReceiptRecord && (
          <PrintableReceiptModal
            record={viewReceiptRecord}
            member={user}
            onClose={() => setViewReceiptRecord(null)}
          />
        )}

      </div>
    </div>
  );
};
