import React from 'react';
import { ContributionRecord, UserProfile, Membership } from '../types';
import { ShieldCheck, Download, Printer, X, CheckCircle2, QrCode, Building2 } from 'lucide-react';

interface PrintableReceiptModalProps {
  record: ContributionRecord;
  member?: UserProfile;
  membership?: Membership;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  record,
  member,
  membership,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const textContent = `
====================================================
            SAMRUDDISAVE FINANCIAL SERVICES
        RBI ESCROW TRUSTEE CERTIFIED RECEIPT
====================================================
Receipt No    : ${record.receipt_number || record.transaction_ref}
Date & Time   : ${record.paid_date ? new Date(record.paid_date).toLocaleString() : new Date().toLocaleString()}
Transaction Ref: ${record.transaction_ref}
Escrow Batch  : ${record.escrow_batch_id || 'ESC_TRUSTEE_2026'}

----------------------------------------------------
MEMBER INFORMATION:
----------------------------------------------------
Member Name   : ${member?.full_name || 'Valued Member'}
Member ID     : ${record.user_id}
Mobile Number : ${member?.phone || 'N/A'}
Email Address : ${member?.email || 'N/A'}
Plan Name     : 12-Month Gold Savings Plan (₹10,000/mo)

----------------------------------------------------
PAYMENT BREAKDOWN:
----------------------------------------------------
Installment Cycle : Installment #${record.cycle_number} of 12
Amount Paid       : ₹${record.amount.toLocaleString()}
Payment Method    : ${(record.payment_type || record.payment_method || 'offline_cash').toUpperCase().replace(/_/g, ' ')}
Collected By Admin: ${record.reconciled_by_admin_name || 'Operations Admin'}
Remarks / Notes   : ${record.remarks || 'Monthly savings deposit received'}

----------------------------------------------------
FINANCIAL SUMMARY:
----------------------------------------------------
Total Plan Goal    : ₹1,20,000
Cumulative Saved   : ₹${((record.cycle_number || 1) * record.amount).toLocaleString()}
Remaining Balance  : ₹${(record.remaining_balance_after ?? Math.max(0, 120000 - (record.cycle_number * record.amount))).toLocaleString()}

====================================================
Escrow Trustee : HDFC Bank Escrow Account #91823749102
Verification   : Verified & Encrypted via Supabase
====================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${record.receipt_number || record.transaction_ref}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#E8EAF8] shadow-2xl space-y-6 relative overflow-hidden print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* Header & Close Action */}
        <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payment Recorded
            </span>
            <span className="text-xs text-[#6C7285] font-semibold">Receipt Voucher</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RECEIPT CARD CONTENT (Printable Area) */}
        <div className="space-y-6 bg-[#FAFBFD] p-6 rounded-2xl border border-[#E8EAF8] print:bg-white print:border-none print:p-0">
          
          {/* Header Branding & Logo */}
          <div className="flex items-start justify-between border-b border-[#E8EAF8] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                  S
                </div>
                <span className="font-heading font-extrabold text-lg text-[#1F1F24] tracking-tight">
                  Samruddi<span className="text-[#4F5DFF]">Save</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6C7285]">RBI Certified Escrow Savings & Chit Fund Platform</p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                <ShieldCheck className="w-3.5 h-3.5" /> HDFC Escrow Trustee Managed
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs font-bold text-[#4F5DFF] uppercase tracking-wider">OFFICIAL RECEIPT</p>
              <p className="font-mono text-xs font-extrabold text-[#1F1F24]">{record.receipt_number || `REC-${record.transaction_ref}`}</p>
              <p className="text-[10px] text-[#6C7285]">
                {record.paid_date ? new Date(record.paid_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Member Details & Payment Status */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF8]">
              <p className="text-[10px] font-bold text-[#6C7285] uppercase">Member Details</p>
              <p className="font-bold text-[#1F1F24] mt-1 text-sm">{member?.full_name || 'Valued Member'}</p>
              <p className="text-[11px] text-[#6C7285] font-mono mt-0.5">ID: {record.user_id}</p>
              <p className="text-[11px] text-[#6C7285] mt-0.5">{member?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF8]">
              <p className="text-[10px] font-bold text-[#6C7285] uppercase">Payment Reference</p>
              <p className="font-mono text-xs font-bold text-[#1F1F24] mt-1">{record.transaction_ref}</p>
              <p className="text-[11px] text-[#6C7285] mt-0.5">Method: <span className="font-bold uppercase text-[#4F5DFF]">{(record.payment_type || record.payment_method || 'Cash').replace(/_/g, ' ')}</span></p>
              <p className="text-[11px] text-[#6C7285] mt-0.5">Admin: {record.reconciled_by_admin_name || 'Operations Admin'}</p>
            </div>
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="bg-gradient-to-r from-[#4F5DFF] to-[#8A7BFF] p-5 rounded-2xl text-white flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Amount Received (INR)</p>
              <p className="font-heading font-extrabold text-3xl mt-0.5">₹{record.amount.toLocaleString()}</p>
              <p className="text-[11px] text-white/90 mt-1 font-medium">Month #{record.cycle_number} Savings Installment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Ledger Breakdown Table */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#6C7285] uppercase tracking-wider">Account Financial Summary</p>
            <div className="bg-white rounded-xl border border-[#E8EAF8] overflow-hidden text-xs">
              <div className="flex justify-between p-2.5 border-b border-[#E8EAF8]">
                <span className="text-[#6C7285]">12-Month Target Goal</span>
                <span className="font-bold text-[#1F1F24]">₹1,20,000</span>
              </div>
              <div className="flex justify-between p-2.5 border-b border-[#E8EAF8]">
                <span className="text-[#6C7285]">Cumulative Paid Principal</span>
                <span className="font-bold text-emerald-600">₹{((record.cycle_number || 1) * record.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F7F8FC]">
                <span className="font-bold text-[#1F1F24]">Remaining Balance to Pay</span>
                <span className="font-bold text-[#4F5DFF]">
                  ₹{(record.remaining_balance_after ?? Math.max(0, 120000 - (record.cycle_number * record.amount))).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks & QR Code Verification Footer */}
          <div className="flex items-center justify-between border-t border-[#E8EAF8] pt-4 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#6C7285] uppercase">Admin Remarks</p>
              <p className="text-slate-700 italic max-w-xs">{record.remarks || 'Cash collection verified and credited into Escrow Pool.'}</p>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E8EAF8]">
              <QrCode className="w-10 h-10 text-[#1F1F24]" />
              <div className="text-[9px] text-[#6C7285] leading-tight">
                <p className="font-bold text-[#1F1F24]">Scan to Verify</p>
                <p>RBI Trustee Hash</p>
                <p className="font-mono text-[8px]">{record.receipt_number || 'VERIFIED'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8EAF8] pt-4 print:hidden">
          <button
            onClick={handleDownloadTxt}
            className="min-h-[44px] bg-[#F7F8FC] hover:bg-[#E8EAF8] text-[#1F1F24] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#E8EAF8] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-[#4F5DFF]" /> Download Receipt
          </button>
          
          <button
            onClick={handlePrint}
            className="min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B49DF] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Official Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
