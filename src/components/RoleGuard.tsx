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
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Redirect unauthenticated users attempting to access protected pages
  useEffect(() => {
    if (!user && (allowedRoles || requiresApprovedKYC)) {
      const timer = setTimeout(() => {
        onNavigate('/login');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, allowedRoles, requiresApprovedKYC, onNavigate]);

  // Automatic Auth Guard: Redirect non-admin users attempting to access /admin directly to /console first
  useEffect(() => {
    if (user && allowedRoles && allowedRoles.includes('admin') && user.role !== 'admin') {
      const timer = setTimeout(() => {
        onNavigate('/console');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [allowedRoles, user, onNavigate]);

  if (!user) {
    if (allowedRoles || requiresApprovedKYC) {
      return (
        <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please sign in to access your micro-savings wallet, contribution ledger, and account features.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Check role authorization fallback
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-200 shadow-xl text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3.5 py-1 rounded-full border border-amber-300 uppercase tracking-wider">
          Admin Portal Access Required
        </span>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900">
          Admin Role Required for /admin
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          You are attempting to access Admin features. Please switch to Admin mode or log in to continue.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => stateStore.switchRole('admin')}
            className="bg-[#4F5DFF] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#4F5DFF]/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            ⚡ 1-Click Demo Admin Login <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/console')}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Log in with Credentials
          </button>
        </div>
      </div>
    );
  }

  // Check KYC Approval constraint for member payment routes
  if (user?.role === 'member' && requiresApprovedKYC && user?.kyc_status !== 'approved') {
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
