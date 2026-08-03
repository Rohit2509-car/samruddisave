import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, Membership } from '../types';
import { Lock, ShieldCheck, CheckCircle2, Building, Smartphone, ArrowRight } from 'lucide-react';

interface PaymentSetupPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentSetupPage: React.FC<PaymentSetupPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [membership, setMembership] = useState<Membership | undefined>(stateStore.getUserMembership(user.id));
  const [autopayMethod, setAutopayMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'netbanking'>(
    user.bank_details?.autopay_method || 'gpay'
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      const u = stateStore.getCurrentUser();
      setUser(u);
      setMembership(stateStore.getUserMembership(u.id));
      if (u.bank_details?.autopay_method) {
        setAutopayMethod(u.bank_details.autopay_method);
      }
    });
    return unsubscribe;
  }, []);

  const handleSaveMandate = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.bank_details) {
      user.bank_details.autopay_method = autopayMethod;
    }
    stateStore.addAuditLog('AUTOPAY_UPDATED', `Member updated AutoPay mandate method to ${autopayMethod.toUpperCase()}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          AutoPay Mandate Setup
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24]">
          Monthly NPCI AutoPay Authorization
        </h1>
        <p className="text-xs text-[#6C7285] max-w-md mx-auto">
          Manage your standing instructions for seamless monthly micro-savings
        </p>
      </div>

      <form onSubmit={handleSaveMandate} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-lg space-y-6">
        
        {/* Linked Bank Card */}
        <div className="bg-[#F7F8FC] border border-[#E8EAF8] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4F5DFF]/10 text-[#4F5DFF] flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1F1F24] text-sm">{user.bank_details?.bank_name || 'HDFC Bank'}</p>
              <p className="text-xs text-[#6C7285] font-mono">
                A/C: {user.bank_details?.account_number || '50100293847123'} • IFSC: {user.bank_details?.ifsc || 'HDFC0001234'}
              </p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            Mandate Active
          </span>
        </div>

        {/* Choose Method */}
        <div>
          <label className="block text-xs font-semibold text-[#1F1F24] mb-3 uppercase tracking-wider">
            Select Preferred AutoPay Provider:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'gpay', name: 'Google Pay' },
              { id: 'phonepe', name: 'PhonePe' },
              { id: 'paytm', name: 'Paytm' },
              { id: 'netbanking', name: 'NetBanking' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAutopayMethod(m.id as any)}
                className={`p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                  autopayMethod === m.id
                    ? 'border-[#4F5DFF] bg-[#4F5DFF]/10 text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                    : 'border-[#E8EAF8] bg-[#F7F8FC] text-[#1F1F24]'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            AutoPay Standing Instructions Updated Successfully!
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md text-xs"
          >
            Update AutoPay Mandate
          </button>
        </div>

      </form>

    </div>
  );
};
