import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Building2, Lock, Save, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface UserProfileEditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserProfileEditModal: React.FC<UserProfileEditModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState(user.emergency_contact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user.emergency_contact?.phone || '');
  const [emergencyRel, setEmergencyRel] = useState(user.emergency_contact?.relationship || '');

  // Bank Details
  const [bankAccNumber, setBankAccNumber] = useState(user.bank_details?.account_number || '');
  const [bankIfsc, setBankIfsc] = useState(user.bank_details?.ifsc || '');
  const [bankUpiId, setBankUpiId] = useState(user.bank_details?.upi_id || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    stateStore.updateUserProfile(user.id, {
      full_name: fullName,
      email,
      phone,
      address,
      emergency_contact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRel,
      },
      bank_details: {
        account_number: bankAccNumber,
        ifsc: bankIfsc,
        bank_name: 'HDFC Bank',
        autopay_method: 'gpay',
        mandate_id: user.bank_details?.mandate_id || 'MAN_98124',
        upi_id: bankUpiId,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E8EAF8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#1F1F24] flex items-center gap-2">
              <User className="w-5 h-5 text-[#4F5DFF]" /> Edit Member Profile
            </h3>
            <p className="text-xs text-[#6C7285] mt-0.5">Update personal details, address, emergency contact, and bank payout settings</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold">Profile updated successfully! Syncing changes...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <p className="font-bold text-[#1F1F24] uppercase tracking-wider text-[11px]">Personal Contact Details</p>
            
            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Residential Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Enter complete door no., street, city, state, pin code..."
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="space-y-3 border-t border-[#E8EAF8] pt-3">
            <p className="font-bold text-[#1F1F24] uppercase tracking-wider text-[11px]">Emergency Contact Person</p>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#1F1F24] mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh M"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1F1F24] mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Brother/Spouse"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1F1F24] mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank & Payout Info */}
          <div className="space-y-3 border-t border-[#E8EAF8] pt-3">
            <p className="font-bold text-[#1F1F24] uppercase tracking-wider text-[11px]">Bank Account & Payout Details</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Bank Account Number</label>
                <input
                  type="text"
                  placeholder="91823749102"
                  value={bankAccNumber}
                  onChange={(e) => setBankAccNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0001234"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">VPA / UPI ID (for instant payouts)</label>
              <input
                type="text"
                placeholder="name@okaxis / phonepe"
                value={bankUpiId}
                onChange={(e) => setBankUpiId(e.target.value)}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E8EAF8] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8EAF8] font-bold text-[#6C7285] hover:bg-[#F7F8FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#4F5DFF] hover:bg-[#3B49DF] text-white font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
