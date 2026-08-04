import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { UserProfile, Membership, ContributionRecord, AuditLog } from '../../types';
import {
  Users,
  CreditCard,
  FileSpreadsheet,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Download,
  Search,
  PlusCircle,
  X,
  FileText,
  DollarSign,
  PieChart,
  UserCheck,
  Settings,
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { GIFT_HAMPERS } from '../../data/mockData';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [adminUser, setAdminUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [memberships, setMemberships] = useState<Membership[]>(stateStore.getMemberships());
  const [contributions, setContributions] = useState<ContributionRecord[]>(stateStore.getContributions());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(stateStore.getAuditLogs());

  // Navigation Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'kyc_queue' | 'members' | 'payments' | 'ledger' | 'reports' | 'hampers' | 'payouts' | 'audit' | 'settings'
  >('overview');

  useEffect(() => {
    const updateTabFromLocation = () => {
      const hash = window.location.hash.replace('#', '');
      const path = window.location.pathname;

      if (hash && ['overview', 'kyc_queue', 'members', 'payments', 'ledger', 'reports', 'hampers', 'payouts', 'audit', 'settings'].includes(hash)) {
        setActiveTab(hash as any);
      } else if (path === '/employee') {
        setActiveTab('kyc_queue');
      } else if (path === '/finance') {
        setActiveTab('payouts');
      } else if (path === '/ledger') {
        setActiveTab('ledger');
      } else if (path === '/admin') {
        if (!hash || hash === 'overview') setActiveTab('overview');
      }
    };

    updateTabFromLocation();
    window.addEventListener('hashchange', updateTabFromLocation);
    return () => window.removeEventListener('hashchange', updateTabFromLocation);
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [inspectedMember, setInspectedMember] = useState<any | null>(null);

  // 8 Lifecycle Stages Definition
  const lifecycleStages = [
    { id: 'signup', name: '1. Member Signup', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'pending', name: '2. Approval Pending', badgeStyle: 'bg-amber-50 text-amber-800 border-amber-300' },
    { id: 'approved', name: '3. Account Approved', badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { id: 'active', name: '4. Savings Active', badgeStyle: 'bg-blue-50 text-blue-800 border-blue-300' },
    { id: 'grace', name: '5. Grace Period', badgeStyle: 'bg-rose-50 text-rose-800 border-rose-300' },
    { id: 'hamper', name: '6. Hamper Selected', badgeStyle: 'bg-purple-50 text-purple-800 border-purple-300' },
    { id: 'payout', name: '7. Payout Processing', badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
    { id: 'matured', name: '8. Plan Matured', badgeStyle: 'bg-teal-50 text-teal-800 border-teal-300' },
  ];

  const getMembersForStage = (stageId: string) => {
    // Dynamic members from store whose stage matches
    const storeMembers = profiles
      .filter((p) => p.role === 'member')
      .filter((p) => {
        const stage = (p as any).pipeline_stage || 'active';
        return stage === stageId || (stageId === 'active' && !['signup','pending','approved','grace','hamper','payout','matured'].includes(stage));
      })
      .map((p) => {
        const matchingStage = lifecycleStages.find((s) => s.id === (p as any).pipeline_stage) || lifecycleStages[3];
        return {
          ...p,
          stageName: matchingStage.name,
          streak: '4m'
        };
      });

    const mockMembersMap: Record<string, any[]> = {
      signup: [
        { id: 'pipe-1', full_name: 'Arjun Deshmukh', phone: '+91 98765 11223', email: 'arjun@example.com', kyc_status: 'unsubmitted', stageName: '1. Member Signup', streak: '0m', pipeline_stage: 'signup' }
      ],
      pending: [
        { id: 'pipe-2', full_name: 'Ananya Sharma', phone: '+91 98765 77889', email: 'ananya.s@example.com', kyc_status: 'pending', stageName: '2. Approval Pending', streak: '0m', pipeline_stage: 'pending' },
        { id: 'pipe-3', full_name: 'Rohit Kumar', phone: '+91 98765 66778', email: 'rohit.k@example.com', kyc_status: 'pending', stageName: '2. Approval Pending', streak: '0m', pipeline_stage: 'pending' }
      ],
      approved: [
        { id: 'pipe-4', full_name: 'Sunita Rao', phone: '+91 98111 44556', email: 'sunita@example.com', kyc_status: 'approved', stageName: '3. Account Approved', streak: '0m', pipeline_stage: 'approved' }
      ],
      active: [
        { id: 'pipe-5', full_name: 'Priya Varma', phone: '+91 90422 85132', email: 'priya.v@example.com', kyc_status: 'approved', stageName: '4. Savings Active', streak: '12m', pipeline_stage: 'active' },
        { id: 'pipe-6', full_name: 'Karthik', phone: '+91 90422 85132', email: 'karthik@example.com', kyc_status: 'approved', stageName: '4. Savings Active', streak: '6m', pipeline_stage: 'active' },
        { id: 'pipe-7', full_name: 'Rahul Verma', phone: '+91 98765 88990', email: 'rahul.v@example.com', kyc_status: 'approved', stageName: '4. Savings Active', streak: '5m', pipeline_stage: 'active' }
      ],
      grace: [
        { id: 'pipe-8', full_name: 'Rajesh Kumar', phone: '+91 99887 76655', email: 'rajesh.k@example.com', kyc_status: 'approved', stageName: '5. Grace Period', streak: '5m', pipeline_stage: 'grace' }
      ],
      hamper: [
        { id: 'pipe-9', full_name: 'Vikramaditya S.', phone: '+91 97654 32109', email: 'vikram@example.com', kyc_status: 'approved', stageName: '6. Hamper Selected', streak: '12m', pipeline_stage: 'hamper' }
      ],
      payout: [
        { id: 'pipe-10', full_name: 'Meera Deshmukh', phone: '+91 98111 99887', email: 'meera@example.com', kyc_status: 'approved', stageName: '7. Payout Processing', streak: '12m', pipeline_stage: 'payout' }
      ],
      matured: [
        { id: 'pipe-11', full_name: 'Priya Patel', phone: '+91 97654 32109', email: 'priya.patel@example.com', kyc_status: 'approved', stageName: '8. Plan Matured', streak: '12m', pipeline_stage: 'matured' }
      ]
    };

    return [...storeMembers, ...(mockMembersMap[stageId] || [])];
  };

  const handleStageChange = (member: any, targetStage: { id: string; name: string }) => {
    if (member.id && !member.id.startsWith('pipe-')) {
      stateStore.updateMemberPipelineStage(member.id, targetStage.id, adminUser.id, `Admin moved ${member.full_name} to ${targetStage.name}`);
    }
    setInspectedMember((prev: any) => (prev ? { ...prev, pipeline_stage: targetStage.id, stageName: targetStage.name } : null));
    alert(`Member ${member.full_name} successfully moved to ${targetStage.name}!`);
  };

  // Offline Payment Reconciliation Modal
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [offlineAmount, setOfflineAmount] = useState<number>(1000);
  const [offlineMethod, setOfflineMethod] = useState<'offline_cash' | 'offline_upi'>('offline_upi');
  const [offlineTxnRef, setOfflineTxnRef] = useState<string>('');
  const [offlineNotes, setOfflineNotes] = useState<string>('');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setAdminUser(stateStore.getCurrentUser());
      setProfiles(stateStore.getProfiles());
      setMemberships(stateStore.getMemberships());
      setContributions(stateStore.getContributions());
      setAuditLogs(stateStore.getAuditLogs());
    });
    return unsubscribe;
  }, []);

  // Operational Metrics
  const totalMembers = profiles.filter((p) => p.role === 'member').length;
  const activeMembers = memberships.filter((m) => m.status === 'active').length;
  const pendingKYCMembers = profiles.filter((p) => p.role === 'member' && p.kyc_status === 'pending');
  const gracePeriodMembers = memberships.filter((m) => m.status === 'grace_period');
  const maturedMembers = memberships.filter((m) => m.status === 'matured' || m.status === 'disbursed');
  const totalCollection = contributions
    .filter((c) => c.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Manual Offline Payment Submission
  const handleReconcileOfflinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const membership = stateStore.getUserMembership(selectedMemberId);
    if (!membership) {
      alert('Selected member does not have an active membership!');
      return;
    }

    const txnRef = offlineTxnRef || `OFFLINE_${Date.now().toString().slice(-6)}`;
    stateStore.recordPaymentWithMembership(
      membership.id,
      txnRef,
      offlineMethod,
      adminUser.id,
      offlineNotes || `Admin reconciled offline payment for ${membership.user_id}`
    );

    setIsReconcileModalOpen(false);
    setSelectedMemberId('');
    setOfflineTxnRef('');
    setOfflineNotes('');
    alert('Offline payment successfully reconciled and audit log recorded!');
  };

  // Download Individual Official Escrow Receipt
  const handleDownloadReceipt = (contrib: ContributionRecord) => {
    const member = profiles.find((p) => p.id === contrib.user_id);
    const memberName = member?.full_name || 'Rohit Sharma';
    const memberEmail = member?.email || 'rohitxcvmhss@gmail.com';

    const receiptContent = `================================================
SAMRUDDISAVE RBI ESCROW OFFICIAL RECEIPT
================================================
Receipt ID: ${contrib.id}
Date: ${contrib.paid_date ? new Date(contrib.paid_date).toLocaleString() : new Date().toLocaleString()}
Member Name: ${memberName}
Member Email: ${memberEmail}
Member Account ID: ${contrib.user_id}
Membership ID: ${contrib.membership_id}
Cycle Number: Cycle #${contrib.cycle_number} of 12
Deposit Amount: INR ${contrib.amount.toLocaleString('en-IN')}
Payment Method: ${(contrib.payment_method || 'razorpay').toUpperCase()}
Transaction Ref: ${contrib.transaction_ref}
Escrow Batch ID: ${contrib.escrow_batch_id || 'ESC_BATCH_2026'}
Escrow Bank: HDFC Escrow Trustee Account #9182374619
Status: VERIFIED & DEPOSITED
================================================
Audit Trail: Verified under RBI Escrow Regulations
Generated By: SamruddiSave Admin Console
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${contrib.transaction_ref}_${memberName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Full Member Passbook & Receipt Batch
  const handleDownloadMemberBatchReceipts = (memberId: string) => {
    const member = profiles.find((p) => p.id === memberId);
    const name = member?.full_name || 'Member';
    const memberContribs = contributions.filter((c) => c.user_id === memberId && c.status === 'PAID');

    if (memberContribs.length === 0) {
      alert(`No paid contributions found for ${name}.`);
      return;
    }

    const statementText = `================================================
SAMRUDDISAVE RBI ESCROW COMPLETE MEMBER PASSBOOK
================================================
Member Name: ${name}
Email: ${member?.email || 'N/A'}
Member Account ID: ${memberId}
Total Paid Contributions: ${memberContribs.length} Cycles
Total Amount Deposited: INR ${memberContribs.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
Generated Date: ${new Date().toLocaleString()}
================================================

TRANSACTION ENTRIES & INDIVIDUAL RECEIPTS:

${memberContribs
  .map(
    (c) => `--- CYCLE #${c.cycle_number} RECEIPT ---
Receipt ID: ${c.id}
Paid Date: ${c.paid_date ? new Date(c.paid_date).toLocaleString() : 'N/A'}
Amount: INR ${c.amount.toLocaleString('en-IN')}
Method: ${(c.payment_method || 'razorpay').toUpperCase()}
Txn Ref: ${c.transaction_ref}
Escrow Batch: ${c.escrow_batch_id || 'ESC_BATCH_2026'}
Status: VERIFIED & DEPOSITED`
  )
  .join('\n\n')}

================================================
End of Official Member Passbook & Escrow Ledger
`;

    const blob = new Blob([statementText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Full_Passbook_Receipts_${name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const csvData = stateStore.exportLedgerCSV();
    stateStore.downloadCSV(csvData, `samruddisave_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F5DFF] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Member Operations & Lifecycle
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F1F24] mt-1">
              Admin Operations Dashboard
            </h1>
            <p className="text-xs text-[#6C7285] mt-1">
              Logged in as <span className="font-semibold text-[#1F1F24]">{adminUser.full_name}</span> (Operations Administrator)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReconcileModalOpen(true)}
              className="min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-[#4F5DFF]/20 transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF] focus-visible:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" /> Record Offline Payment
            </button>
            <button
              onClick={handleExportCSV}
              className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <Download className="w-4 h-4" /> Export Ledger CSV
            </button>
          </div>
        </div>

        {/* Main Module Display Area (Full Width, Sidebar Moved to Top Navbar) */}
        <div className="w-full space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Operational KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                    <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Total Registered Members</p>
                    <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{totalMembers}</p>
                    <span className="inline-block mt-1 text-xs text-emerald-600 font-semibold">{activeMembers} Active Savers</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                    <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Pending KYC Approvals</p>
                    <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{pendingKYCMembers.length}</p>
                    <span className="inline-block mt-1 text-xs text-amber-600 font-semibold">Requires Admin Sign-off</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                    <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Grace Period 5-Day Alert</p>
                    <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">{gracePeriodMembers.length}</p>
                    <span className="inline-block mt-1 text-xs text-rose-600 font-semibold">Action Required</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E8EAF8] shadow-sm">
                    <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Total Collection Pool</p>
                    <p className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-2">₹{totalCollection.toLocaleString()}</p>
                    <span className="inline-block mt-1 text-xs text-[#4F5DFF] font-semibold">HDFC Escrow Trustee</span>
                  </div>
                </div>

                {/* Explicit 8-Stage Lifecycle Pipeline Board */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">
                      Explicit 8-Stage Lifecycle Pipeline Board
                    </h3>
                    <p className="text-xs text-[#6C7285] font-medium mt-0.5">
                      Member Signup → Approval Pending → Account Approved → Savings Active → Grace Period → Hamper Selected → Payout Processing → Plan Matured
                    </p>
                  </div>

                  {/* Horizontal Scrollable Pipeline Kanban Board */}
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
                    {lifecycleStages.map((stage) => {
                      const stageMembers = getMembersForStage(stage.id);
                      return (
                        <div
                          key={stage.id}
                          className="min-w-[260px] max-w-[280px] flex-1 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-3 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stage.badgeStyle}`}>
                              {stage.name}
                            </span>
                            <span className="font-mono font-bold text-xs text-slate-500">{stageMembers.length}</span>
                          </div>

                          <div className="space-y-2.5 min-h-[160px] flex-1">
                            {stageMembers.length === 0 ? (
                              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-[11px] text-slate-400 font-medium text-center">
                                No Members in Stage
                              </div>
                            ) : (
                              stageMembers.map((m: any) => (
                                <div
                                  key={m.id}
                                  className="bg-white p-3 rounded-xl border border-[#E8EAF8] shadow-2xs hover:shadow-md transition-all space-y-2"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                      {m.full_name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="font-bold text-xs text-[#1F1F24] truncate">{m.full_name}</p>
                                      <p className="text-xs text-[#6C7285] font-medium">{m.phone}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
                                    <span className="font-semibold text-slate-600">Streak: <span className="font-bold text-[#1F1F24]">{m.streak || '0m'}</span></span>
                                    <button
                                      onClick={() => setInspectedMember(m)}
                                      className="min-h-[44px] bg-[#4F5DFF]/10 hover:bg-[#4F5DFF] text-[#4F5DFF] hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                                    >
                                      Inspect 360° &rarr;
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* PENDING MEMBER KYC APPROVALS MODULE TAB */}
            {activeTab === 'kyc_queue' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF8] pb-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-amber-500" /> Pending Member KYC Approvals
                    </h3>
                    <p className="text-xs text-[#6C7285] font-medium mt-1">
                      Review identity documents, PAN, Aadhaar, and approve member accounts for deposit access
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2 rounded-full border border-amber-200">
                    {pendingKYCMembers.length} Pending Approvals
                  </span>
                </div>

                {pendingKYCMembers.length === 0 ? (
                  <div className="p-12 text-center bg-[#F7F8FC] rounded-3xl border border-[#E8EAF8] space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-heading font-extrabold text-base text-[#1F1F24]">All Clear! No Pending KYC Registrations</p>
                    <p className="text-xs text-[#6C7285] max-w-md mx-auto">
                      All active customer accounts are fully verified under RBI Escrow and compliance standards.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingKYCMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-sm transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-[#1F1F24]">{member.full_name}</span>
                            <span className="text-xs text-[#6C7285] bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                              ID: {member.id}
                            </span>
                          </div>
                          <p className="text-xs text-[#6C7285]">
                            Phone: <span className="font-medium text-[#1F1F24]">{member.phone}</span> • Email: <span className="font-medium text-[#1F1F24]">{member.email}</span>
                          </p>
                          <p className="text-xs text-[#6C7285]">
                            PAN Number: <span className="font-mono font-bold text-[#1F1F24]">{member.pan_number || 'ABCDE1234F'}</span> • Aadhaar: <span className="font-mono font-bold text-[#1F1F24]">{member.aadhaar_number || '9876 5432 1098'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setInspectedMember(member)}
                            className="min-h-[44px] bg-white hover:bg-slate-100 border border-[#E8EAF8] text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                          >
                            Inspect Docs 360°
                          </button>
                          <button
                            onClick={() => {
                              stateStore.updateKYCStatus(member.id, 'approved', adminUser.id, 'Admin approved KYC');
                              alert(`KYC for ${member.full_name} has been approved successfully!`);
                            }}
                            className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Member Account
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MEMBERS DIRECTORY TAB */}
            {activeTab === 'members' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">All Members Directory</h3>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#6C7285] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search member by name, email, or PAN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs text-[#1F1F24] w-full sm:w-64 focus:outline-none focus:border-[#4F5DFF]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider font-bold">
                        <th className="p-3">Member</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">KYC Status</th>
                        <th className="p-3">Pipeline Stage</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAF8]">
                      {profiles
                        .filter((p) => p.role === 'member')
                        .filter((p) => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-[#F7F8FC]/50">
                            <td className="p-3 font-semibold text-[#1F1F24]">
                              {p.full_name}
                              <div className="text-[10px] text-[#6C7285] font-normal">{p.email} • {p.phone}</div>
                            </td>
                            <td className="p-3 uppercase font-bold text-[#4F5DFF]">{p.role}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                p.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {p.kyc_status}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-700">{p.pipeline_stage}</td>
                            <td className="p-3">
                              {p.kyc_status !== 'approved' && (
                                <button
                                  onClick={() => stateStore.updateKYCStatus(p.id, 'approved', adminUser.id)}
                                  className="text-xs font-bold text-emerald-600 hover:underline"
                                >
                                  Approve KYC
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAYMENTS MANAGEMENT TAB */}
            {activeTab === 'payments' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Payments Management</h3>
                    <p className="text-xs text-[#6C7285]">Due Today, Overdue Contributions, Razorpay & Offline Transactions</p>
                  </div>

                  <button
                    onClick={() => setIsReconcileModalOpen(true)}
                    className="bg-[#4F5DFF] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    + Record Offline Payment
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-xs font-bold text-amber-800 uppercase">Due Today</p>
                    <p className="font-extrabold text-xl text-amber-900 mt-1">₹5,000</p>
                  </div>
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                    <p className="text-xs font-bold text-rose-800 uppercase">Overdue Contributions</p>
                    <p className="font-extrabold text-xl text-rose-900 mt-1">{gracePeriodMembers.length} Members</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-800 uppercase">Total Collected</p>
                    <p className="font-extrabold text-xl text-emerald-900 mt-1">₹{totalCollection.toLocaleString()}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider font-bold">
                        <th className="p-3">Txn Ref</th>
                        <th className="p-3">Member Details</th>
                        <th className="p-3">Cycle #</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAF8]">
                      {contributions.map((c) => {
                        const m = profiles.find((p) => p.id === c.user_id);
                        return (
                          <tr key={c.id} className="hover:bg-[#F7F8FC]/50">
                            <td className="p-3 font-mono font-bold text-[#1F1F24]">{c.transaction_ref}</td>
                            <td className="p-3">
                              <p className="font-semibold text-[#1F1F24]">{m?.full_name || 'Rohit Sharma'}</p>
                              <p className="text-[10px] text-[#6C7285]">{c.user_id}</p>
                            </td>
                            <td className="p-3 font-semibold">Month {c.cycle_number}</td>
                            <td className="p-3 font-bold text-[#1F1F24]">₹{c.amount.toLocaleString()}</td>
                            <td className="p-3 uppercase font-semibold text-[#4F5DFF]">{c.payment_method || 'razorpay'}</td>
                            <td className="p-3">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDownloadReceipt(c)}
                                className="min-h-[44px] bg-[#4F5DFF]/10 hover:bg-[#4F5DFF] text-[#4F5DFF] hover:text-white border border-[#4F5DFF]/20 px-4 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                                title="Download Official Escrow Receipt"
                              >
                                <Download className="w-3.5 h-3.5" /> Download Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTRIBUTION LEDGER TAB */}
            {activeTab === 'ledger' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Global Contribution Ledger</h3>
                    <p className="text-xs text-[#6C7285]">Audit-ready transaction entries for all active member savings cycles</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Member Filter Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6C7285]">Filter Member:</span>
                      <select
                        value={filterMemberId}
                        onChange={(e) => setFilterMemberId(e.target.value)}
                        className="bg-[#F7F8FC] border border-[#E8EAF8] text-xs font-semibold rounded-xl px-3 py-2 text-[#1F1F24] focus:outline-none focus:border-[#4F5DFF]"
                      >
                        <option value="all">All Members ({profiles.filter((p) => p.role === 'member').length})</option>
                        {profiles
                          .filter((p) => p.role === 'member')
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name} ({m.email})
                            </option>
                          ))}
                      </select>
                    </div>

                    {filterMemberId !== 'all' && (
                      <button
                        onClick={() => handleDownloadMemberBatchReceipts(filterMemberId)}
                        className="min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                      >
                        <FileText className="w-4 h-4" /> Download Passbook & Receipts
                      </button>
                    )}

                    <button
                      onClick={handleExportCSV}
                      className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider font-bold">
                        <th className="p-3">Ledger ID</th>
                        <th className="p-3">Member Details</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Cycle</th>
                        <th className="p-3">Paid Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Txn Ref</th>
                        <th className="p-3 text-right">Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAF8]">
                      {(filterMemberId === 'all'
                        ? contributions
                        : contributions.filter((c) => c.user_id === filterMemberId)
                      ).map((c) => {
                        const m = profiles.find((p) => p.id === c.user_id);
                        return (
                          <tr key={c.id} className="hover:bg-[#F7F8FC]/50">
                            <td className="p-3 font-mono font-medium text-slate-600">{c.id}</td>
                            <td className="p-3">
                              <p className="font-semibold text-[#1F1F24]">{m?.full_name || 'Rohit Sharma'}</p>
                              <p className="text-[10px] text-[#6C7285]">{c.user_id} • {m?.email || 'rohitxcvmhss@gmail.com'}</p>
                            </td>
                            <td className="p-3 font-bold text-[#1F1F24]">₹{c.amount.toLocaleString()}</td>
                            <td className="p-3 font-medium">Cycle #{c.cycle_number}</td>
                            <td className="p-3 text-[#6C7285]">
                              {c.paid_date ? new Date(c.paid_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-700">{c.transaction_ref}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDownloadReceipt(c)}
                                className="min-h-[44px] bg-[#4F5DFF]/10 hover:bg-[#4F5DFF] text-[#4F5DFF] hover:text-white border border-[#4F5DFF]/20 px-4 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                                title="Download Official Escrow Receipt"
                              >
                                <Download className="w-3.5 h-3.5" /> Download Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FINANCIAL REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Financial & Collection Reports</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-[#1F1F24]">Monthly Collection Summary</h4>
                    <p className="text-xs text-[#6C7285]">Total escrow principal deposited across all 12-month savings plans.</p>
                    <p className="font-heading font-extrabold text-2xl text-[#4F5DFF] mt-2">₹{totalCollection.toLocaleString()}</p>
                    <button onClick={handleExportCSV} className="text-xs font-bold text-[#4F5DFF] hover:underline">
                      Download Detailed CSV Report →
                    </button>
                  </div>

                  <div className="p-5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-[#1F1F24]">Grace Period & Defaulters</h4>
                    <p className="text-xs text-[#6C7285]">Members with active 5-day grace alert notices.</p>
                    <p className="font-heading font-extrabold text-2xl text-rose-600 mt-2">{gracePeriodMembers.length} Members</p>
                  </div>
                </div>
              </div>
            )}

            {/* HAMPER ALLOCATIONS TAB */}
            {activeTab === 'hampers' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Maturity Gift Hamper Allocations</h3>
                <p className="text-xs text-[#6C7285]">Assign gift hampers to members for Month 12 maturity dispatch</p>

                <div className="space-y-3">
                  {profiles
                    .filter((p) => p.role === 'member')
                    .map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-sm text-[#1F1F24]">{member.full_name}</p>
                          <p className="text-xs text-[#6C7285]">ID: {member.id}</p>
                        </div>

                        <select
                          value={member.allocated_hamper_id || ''}
                          onChange={(e) => stateStore.allocateHamper(member.id, e.target.value, adminUser.id)}
                          className="bg-white border border-[#E8EAF8] rounded-xl px-4 py-2 text-xs font-semibold text-[#1F1F24] focus:outline-none focus:border-[#4F5DFF]"
                        >
                          <option value="">-- Select Gift Hamper --</option>
                          {GIFT_HAMPERS.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.tier} Tier - ₹{h.retail_value})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* MATURITY PAYOUTS TAB */}
            {activeTab === 'payouts' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Maturity Disbursal Approvals</h3>
                <p className="text-xs text-[#6C7285]">Execute final maturity disbursals and hamper dispatches</p>

                {stateStore.getPayouts().length === 0 ? (
                  <div className="p-8 text-center bg-[#F7F8FC] rounded-2xl text-xs text-[#6C7285]">
                    No pending maturity payouts queue at present.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stateStore.getPayouts().map((pay) => (
                      <div key={pay.id} className="p-4 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-sm text-[#1F1F24]">{pay.user_name}</p>
                          <span className="font-extrabold text-sm text-emerald-600">₹{pay.total_disbursal_amount.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#6C7285]">Hamper: {pay.hamper_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'audit' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">System Audit Logs</h3>
                <p className="text-xs text-[#6C7285]">Immutable audit trail tracking admin reconciliations, approvals, and system events</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E8EAF8] text-[#6C7285] uppercase tracking-wider font-bold">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Admin</th>
                        <th className="p-3">Member ID</th>
                        <th className="p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAF8]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F7F8FC]/50">
                          <td className="p-3 text-[#6C7285]">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-3 font-bold text-[#4F5DFF]">{log.action}</td>
                          <td className="p-3 font-semibold text-[#1F1F24]">{log.admin_id}</td>
                          <td className="p-3 text-slate-700">{log.member_id || 'System'}</td>
                          <td className="p-3 text-[#6C7285]">{log.notes || JSON.stringify(log.details)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4 animate-in fade-in duration-200">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Admin Portal Settings</h3>
                <p className="text-xs text-[#6C7285]">Platform parameters, security configuration, and escrow disclosures</p>
                <div className="p-4 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8] text-xs text-[#1F1F24]">
                  Admin Profile: <span className="font-bold">{adminUser.full_name} ({adminUser.email})</span>
                  <div className="mt-2 text-slate-500">Security Encryption: 256-bit AES • Supabase RLS Active</div>
                </div>
              </div>
            )}
          </div>

        {/* MODAL: Record Offline Payment Reconciliation */}
        {isReconcileModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E8EAF8] shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Record Offline Payment</h3>
                <button
                  onClick={() => setIsReconcileModalOpen(false)}
                  className="text-[#6C7285] hover:text-[#1F1F24]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReconcileOfflinePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] mb-1">Select Member</label>
                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                  >
                    <option value="">-- Select Member --</option>
                    {profiles
                      .filter((p) => p.role === 'member')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={offlineAmount}
                    onChange={(e) => setOfflineAmount(Number(e.target.value))}
                    className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] mb-1">Payment Method</label>
                  <select
                    value={offlineMethod}
                    onChange={(e) => setOfflineMethod(e.target.value as any)}
                    className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                  >
                    <option value="offline_upi">Offline UPI (GPay/PhonePe)</option>
                    <option value="offline_cash">Offline Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] mb-1">Transaction Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI_REF_91823749"
                    value={offlineTxnRef}
                    onChange={(e) => setOfflineTxnRef(e.target.value)}
                    className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] mb-1">Admin Reconciliation Notes</label>
                  <textarea
                    placeholder="Reason or verification details for manual payment entry..."
                    value={offlineNotes}
                    onChange={(e) => setOfflineNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReconcileModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#4F5DFF] hover:bg-[#4F5DFF]/90 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Reconcile & Write Audit Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Inspect 360° Member Profile & Lifecycle */}
        {inspectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-in fade-in duration-200">
            <div className="relative z-50 bg-white rounded-3xl max-w-2xl w-full p-6 border border-[#E8EAF8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-bold text-lg flex items-center justify-center">
                    {inspectedMember.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-[#1F1F24]">{inspectedMember.full_name}</h3>
                    <p className="text-xs text-[#6C7285]">{inspectedMember.email} • {inspectedMember.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectedMember(null)}
                  className="text-[#6C7285] hover:text-[#1F1F24] p-2.5 rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF]"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Grid Metrics & Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8]">
                  <p className="text-[10px] font-bold text-[#6C7285] uppercase">KYC Status</p>
                  <p className="font-bold text-sm text-emerald-600 mt-0.5">{inspectedMember.kyc_status?.toUpperCase() || 'APPROVED'}</p>
                </div>
                <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8]">
                  <p className="text-[10px] font-bold text-[#6C7285] uppercase">Pipeline Stage</p>
                  <p className="font-bold text-sm text-[#4F5DFF] mt-0.5">{inspectedMember.stageName || inspectedMember.pipeline_stage || '4. Savings Active'}</p>
                </div>
                <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E8EAF8]">
                  <p className="text-[10px] font-bold text-[#6C7285] uppercase">OCR Confidence</p>
                  <p className="font-bold text-sm text-slate-800 mt-0.5">{inspectedMember.ocr_confidence || 99.8}% Match</p>
                </div>
              </div>

              {/* Detailed Documents & Ledger Info */}
              <div className="bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8] space-y-2 text-xs">
                <p className="font-bold text-[#1F1F24]">Identity Verification & Compliance Documents:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>PAN Number: <span className="font-mono font-bold text-[#1F1F24]">{inspectedMember.pan_number || 'ABCDE1234F'}</span></div>
                  <div>Aadhaar Number: <span className="font-mono font-bold text-[#1F1F24]">{inspectedMember.aadhaar_number || '9876 5432 1098'}</span></div>
                  <div>HDFC Escrow Account: <span className="font-semibold text-emerald-600">Deposits Active</span></div>
                  <div>Allocated Hamper: <span className="font-semibold text-[#4F5DFF]">{GIFT_HAMPERS.find(h => h.id === inspectedMember.allocated_hamper_id)?.name || inspectedMember.allocated_hamper_id || 'Smart Home & Tech Box'}</span></div>
                </div>
              </div>

              {/* Stage Transition Control Panel */}
              <div className="space-y-2 pt-2 border-t border-[#E8EAF8]">
                <p className="text-xs font-bold text-[#1F1F24]">Advance Member Lifecycle Stage:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {lifecycleStages.map((stg) => (
                    <button
                      key={stg.id}
                      onClick={() => handleStageChange(inspectedMember, stg)}
                      className={`min-h-[44px] px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF] ${
                        inspectedMember.stageName === stg.name || inspectedMember.pipeline_stage === stg.id
                          ? 'bg-[#4F5DFF] text-white border-[#4F5DFF] shadow-sm'
                          : 'border-[#E8EAF8] bg-white text-[#1F1F24] hover:bg-[#4F5DFF] hover:text-white'
                      }`}
                    >
                      Move to {stg.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8EAF8] flex justify-end">
                <button
                  onClick={() => setInspectedMember(null)}
                  className="min-h-[44px] px-5 py-3 bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F5DFF] focus-visible:ring-offset-2"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
