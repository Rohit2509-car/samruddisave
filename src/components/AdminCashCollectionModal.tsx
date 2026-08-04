import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, ContributionRecord } from '../types';
import { Search, User, DollarSign, Calendar, CreditCard, FileText, CheckCircle2, AlertCircle, X, ShieldCheck, Download, Printer } from 'lucide-react';
import { PrintableReceiptModal } from './PrintableReceiptModal';

interface AdminCashCollectionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminCashCollectionModal: React.FC<AdminCashCollectionModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const adminUser = stateStore.getCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(10000);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'cash' | 'upi'>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Status & Validation State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<ContributionRecord | null>(null);

  // Live member search
  const searchResults = stateStore.searchMembers(searchQuery);

  const handleSelectMember = (member: UserProfile) => {
    setSelectedMember(member);
    setErrorMsg(null);
    const membership = stateStore.getUserMembership(member.id);
    const monthlyAmt = membership?.monthly_amount || 10000;
    setAmount(monthlyAmt);
    setRemarks(`Month ${ (stateStore.getUserContributions(member.id).filter(c => c.status === 'PAID').length + 1) } Installment Cash Deposit`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedMember) {
      setErrorMsg('Please select an active member before submitting payment.');
      return;
    }

    const result = stateStore.recordAdminCashCollection({
      memberId: selectedMember.id,
      amount: Number(amount),
      paymentDate,
      paymentType,
      referenceNumber,
      remarks,
      adminId: adminUser.id,
    });

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    if (result.record) {
      setSuccessRecord(result.record);
      if (onSuccess) onSuccess();
    }
  };

  // Compute selected member financial stats
  const memberMembership = selectedMember ? stateStore.getUserMembership(selectedMember.id) : null;
  const memberContribs = selectedMember ? stateStore.getUserContributions(selectedMember.id).filter(c => c.status === 'PAID') : [];
  const totalPaidSum = memberContribs.reduce((acc, c) => acc + c.amount, 0);
  const totalPlanGoal = (memberMembership?.monthly_amount || 10000) * 12;
  const remainingBalance = Math.max(0, totalPlanGoal - totalPaidSum);
  const currentInstallmentNum = Math.min(memberContribs.length + 1, 12);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E8EAF8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-[#1F1F24] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#4F5DFF]" /> Record Admin Cash Payment
              </h3>
              <p className="text-xs text-[#6C7285] mt-0.5">Manually record member cash or offline UPI collections into RBI Escrow Trustee pool</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Error Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-start gap-3 animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Validation Error</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* STEP 2: Instant Member Search */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider">
              Step 1: Search Member (by Name, ID, Mobile, Email or Login ID)
            </label>
            
            <div className="relative">
              <Search className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Type Member Name, ID (e.g. user-member-1), Mobile (+91...), or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF] transition-all"
              />
            </div>

            {/* Live Autocomplete List */}
            {searchQuery.trim() && (
              <div className="bg-white border border-[#E8EAF8] rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-[#E8EAF8] mt-1">
                {searchResults.length === 0 ? (
                  <p className="p-3 text-xs text-[#6C7285] italic">No members matching "{searchQuery}"</p>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        handleSelectMember(m);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-[#F7F8FC] transition-colors flex items-center justify-between cursor-pointer min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1F1F24]">{m.full_name}</p>
                          <p className="text-[10px] text-[#6C7285] font-mono">{m.id} • {m.phone || m.email}</p>
                        </div>
                      </div>
                      <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Select Member
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Selected Member Information Summary Card */}
          {selectedMember ? (
            <div className="bg-[#F7F8FC] p-4 sm:p-5 rounded-2xl border border-[#E8EAF8] space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0">
                    {selectedMember.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-[#1F1F24]">{selectedMember.full_name}</h4>
                    <p className="text-[11px] text-[#6C7285] font-mono">ID: {selectedMember.id} • {selectedMember.phone}</p>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  {selectedMember.kyc_status === 'approved' ? 'KYC Verified' : selectedMember.kyc_status}
                </span>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#E8EAF8]">
                  <p className="text-[10px] text-[#6C7285] font-bold">12-Mo Goal</p>
                  <p className="font-bold text-[#1F1F24] mt-0.5">₹{totalPlanGoal.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E8EAF8]">
                  <p className="text-[10px] text-[#6C7285] font-bold">Total Paid</p>
                  <p className="font-bold text-emerald-600 mt-0.5">₹{totalPaidSum.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E8EAF8]">
                  <p className="text-[10px] text-[#6C7285] font-bold">Remaining</p>
                  <p className="font-bold text-[#4F5DFF] mt-0.5">₹{remainingBalance.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E8EAF8]">
                  <p className="text-[10px] text-[#6C7285] font-bold">Current Cycle</p>
                  <p className="font-bold text-[#1F1F24] mt-0.5">Cycle #{currentInstallmentNum}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Use the search bar above to select a member before submitting payment.</span>
            </div>
          )}

          {/* STEP 4 & 5: Cash Payment Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Payment Amount (INR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-[#6C7285]">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-bold focus:outline-none focus:border-[#4F5DFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Payment Type *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                >
                  <option value="cash">Offline Cash (In-Hand Voucher)</option>
                  <option value="upi">Offline UPI (GPay/PhonePe/Paytm Direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Collected By Admin (Auto-filled)</label>
                <input
                  type="text"
                  readOnly
                  value={`${adminUser.full_name} (${adminUser.email})`}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                Reference / Receipt Number (Optional)
              </label>
              <input
                type="text"
                placeholder={paymentType === 'cash' ? 'Leave blank for auto-generated CASH_REC_XXXXXX' : 'e.g. UPI_REF_981273948'}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Remarks & Collection Notes</label>
              <textarea
                placeholder="Add audit notes or cashier voucher details..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E8EAF8] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8EAF8] text-xs font-bold text-[#6C7285] hover:bg-[#F7F8FC] transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!selectedMember}
                className={`min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  selectedMember
                    ? 'bg-[#4F5DFF] hover:bg-[#3B49DF] active:scale-95'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Save & Generate Receipt
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* STEP 10: Printable Receipt Trigger */}
      {successRecord && (
        <PrintableReceiptModal
          record={successRecord}
          member={selectedMember || undefined}
          onClose={() => {
            setSuccessRecord(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
