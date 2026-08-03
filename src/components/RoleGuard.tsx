import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile, UserRole } from '../types';
import { ShieldAlert, Lock, ArrowRight, UserCheck } from 'lucide-react';

interface RoleGuardProps {
  currentPath: string;
  allowedRoles?: UserRole[];
  requiresApprovedKYC?: boolean;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  currentPath,
  allowedRoles,
  requiresApprovedKYC,
  onNavigate,
  children,
}) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-lg text-center">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-xl text-[#1F1F24] mb-2">Access Restricted (RBAC Route Guard)</h2>
        <p className="text-sm text-[#6C7285] max-w-md mx-auto mb-6">
          Your current account role (<span className="font-semibold text-rose-600">{user.role}</span>) does not have permission to view route <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">{currentPath}</code>.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="bg-[#4F5DFF] text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F5DFF]/90 transition-all shadow-md"
          >
            Return to Home
          </button>
          <button
            onClick={() => {
              // Switch persona helper for demo convenience
              if (currentPath === '/employee') stateStore.switchRole('employee');
              else if (currentPath === '/finance') stateStore.switchRole('finance_admin');
              else if (currentPath === '/support') stateStore.switchRole('support_agent');
              else if (currentPath === '/admin') stateStore.switchRole('super_admin');
            }}
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Switch to Required Role
          </button>
        </div>
      </div>
    );
  }

  // Check KYC Approval constraint for member payment routes
  if (user.role === 'member' && requiresApprovedKYC && user.kyc_status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-amber-200 shadow-xl text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
          Compliance Lock Active
        </span>
        <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-3 mb-2">
          Pending Officer Sign-off
        </h2>
        <p className="text-sm text-[#6C7285] max-w-lg mx-auto mb-6 leading-relaxed">
          In strict compliance with RBI Escrow Trustee regulations, monthly deposits and AutoPay setup are temporarily locked until an MRM Officer verifies your PAN / Aadhaar AI OCR submission.
        </p>

        <div className="bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl p-4 max-w-md mx-auto mb-6 text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7285]">Applicant Name:</span>
            <span className="font-semibold text-[#1F1F24]">{user.full_name}</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7285]">PAN OCR Status:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> 99.8% Match Verified
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6C7285]">KYC Pipeline Stage:</span>
            <span className="font-semibold text-amber-600">{user.pipeline_stage}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => onNavigate('/kyc')}
            className="bg-[#4F5DFF] text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-[#4F5DFF]/90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            Review KYC Documents <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Quick demo shortcut to approve for testing!
              stateStore.updateKYCStatus(user.id, 'approved', 'Demo MRM Officer');
            }}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            ⚡ Demo Action: Simulate Officer Approval
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
