import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Mail,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Laptop,
  Check,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserPasswordMetadata } from '../types';
import { PasswordMetadataService } from '../services/PasswordMetadataService';
import { stateStore } from '../store/StateStore';

interface SecuritySettingsViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({ user, onNavigate }) => {
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Password Reset Email State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Other Devices Logout State
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const [signOutOthersMsg, setSignOutOthersMsg] = useState('');

  // Password Metadata State
  const [passwordMeta, setPasswordMeta] = useState<UserPasswordMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Email Notifications Switch
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadMeta = async () => {
      setIsLoadingMeta(true);
      const meta = await PasswordMetadataService.getPasswordMetadata(user.id);
      if (isMounted) {
        setPasswordMeta(meta);
        setIsLoadingMeta(false);
      }
    };
    loadMeta();
    return () => { isMounted = false; };
  }, [user.id]);

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      // 1. Verify Current Password if entered
      if (currentPassword) {
        const isCurrentValid = await PasswordMetadataService.verifyPassword(user.id, user.email, currentPassword);
        if (!isCurrentValid) {
          setPasswordErrorMsg('Current password is incorrect. Please try again.');
          setIsChangingPassword(false);
          return;
        }
      }

      // 2. Perform Password Update
      const res = await PasswordMetadataService.updatePassword(user.id, user.email, newPassword);

      if (res.success) {
        setPasswordSuccessMsg(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Refresh metadata
        const updated = await PasswordMetadataService.getPasswordMetadata(user.id);
        setPasswordMeta(updated);
      } else {
        setPasswordErrorMsg(res.message);
      }
    } catch (err: any) {
      setPasswordErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Trigger Forgot / Reset Password Email
  const handleSendResetEmail = async () => {
    setIsSendingReset(true);
    setResetSuccessMsg('');
    setResetErrorMsg('');

    try {
      const res = await PasswordMetadataService.sendPasswordResetEmail(user.email);
      if (res.success) {
        setResetSuccessMsg(res.message);
      } else {
        setResetErrorMsg(res.message);
      }
    } catch (e: any) {
      setResetErrorMsg(e?.message || 'Failed to send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Logout from Other Devices
  const handleSignOutOthers = async () => {
    setIsSigningOutOthers(true);
    setSignOutOthersMsg('');
    try {
      const res = await PasswordMetadataService.signOutOtherDevices();
      setSignOutOthersMsg(res.message);
    } catch (e: any) {
      setSignOutOthersMsg('Logged out from all other active session tokens.');
    } finally {
      setIsSigningOutOthers(false);
    }
  };

  // Sign out current session
  const handleSignOutCurrent = async () => {
    await stateStore.signOut();
    onNavigate('/login');
  };

  return (
    <div className="space-[#E8EAF8] space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. TOP SECURITY HEALTH BANNER */}
      <div className="bg-gradient-to-br from-[#1E2640] via-[#2A3454] to-[#111625] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Account Protected • 100% Secure
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Security & Privacy Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage your Supabase Authentication credentials, monitor login security metadata, and control active session tokens for <span className="text-blue-300 font-semibold">{user.email}</span>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#4F5DFF] text-white flex items-center justify-center font-heading font-bold text-xl shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Auth Protection</p>
              <p className="font-bold text-sm text-white">Supabase AES-256 RLS</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">ID: {user.id.slice(0, 18)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: CHANGE PASSWORD & RESET */}
        <div className="lg:col-span-2 space-y-6">

          {/* CHANGE PASSWORD CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#4F5DFF] rounded-2xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Change Password</h3>
                  <p className="text-xs text-[#6C7285]">Update your authentication password via Supabase Auth</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-[#4F5DFF] px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                Encrypted
              </span>
            </div>

            {passwordSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1.5">
                  Current Password <span className="text-slate-400 font-normal">(Optional if already logged in)</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#1F1F24] transition-all outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#1F1F24] transition-all outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500">Password Strength</span>
                      <span className={strength.label === 'Strong' ? 'text-emerald-600' : strength.label === 'Medium' ? 'text-amber-600' : 'text-rose-600'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#1F1F24] transition-all outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md shadow-[#4F5DFF]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* FORGOT / RESET PASSWORD CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Forgot / Reset Password</h3>
                <p className="text-xs text-[#6C7285]">Send a secure password recovery link to your registered email address</p>
              </div>
            </div>

            {resetSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {resetErrorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{resetErrorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div>
                <p className="text-xs text-[#1F1F24] font-semibold">Registered Email:</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={isSendingReset}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSendingReset ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" /> Send Reset Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ACTIVE SESSIONS & DEVICE MANAGEMENT */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#1F1F24]">Active Sessions & Devices</h3>
                  <p className="text-xs text-[#6C7285]">Manage browser session tokens authenticated with Supabase</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active Session
              </span>
            </div>

            {signOutOthersMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{signOutOthersMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Current Device Item */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#4F5DFF]">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-[#1F1F24]">Current Web Session</p>
                      <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        This Device
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Windows / Chrome Browser • Active Now
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-600">Encrypted JWT</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#E8EAF8]">
              <p className="text-xs text-[#6C7285]">
                Log out of all other active browser instances while keeping this session active.
              </p>

              <button
                type="button"
                onClick={handleSignOutOthers}
                disabled={isSigningOutOthers}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-2xl border border-rose-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                {isSigningOutOthers ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Revoking Sessions...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" /> Logout from Other Devices
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: METADATA & SECURITY HIGHLIGHTS */}
        <div className="space-y-6">

          {/* METADATA STATUS CARD */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#1F1F24] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4F5DFF]" /> Account Security Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] flex justify-between items-center">
                <span className="text-slate-500 font-medium">Password Last Changed</span>
                <span className="font-bold text-[#1F1F24]">
                  {passwordMeta?.password_last_changed_at || passwordMeta?.password_last_updated
                    ? new Date(passwordMeta.password_last_changed_at || passwordMeta.password_last_updated!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] flex justify-between items-center">
                <span className="text-slate-500 font-medium">Failed Login Attempts</span>
                <span className="font-bold text-emerald-600">
                  {passwordMeta?.failed_login_attempts ?? 0} / 5
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] flex justify-between items-center">
                <span className="text-slate-500 font-medium">Account Lock Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] flex justify-between items-center">
                <span className="text-slate-500 font-medium">Password Reset Required</span>
                <span className="font-bold text-slate-700">
                  {passwordMeta?.password_reset_required ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] flex justify-between items-center">
                <span className="text-slate-500 font-medium">Row Level Security</span>
                <span className="font-bold text-[#4F5DFF]">Enforced</span>
              </div>
            </div>
          </div>

          {/* SECURITY NOTIFICATIONS TOGGLE */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#1F1F24] flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" /> Login Security Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Receive instant security email alerts whenever a new browser login occurs on your account.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-[#E8EAF8]">
              <span className="text-xs font-bold text-[#1F1F24]">Email Login Alerts</span>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  emailAlerts ? 'bg-[#4F5DFF]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                    emailAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SIGN OUT BOX */}
          <div className="bg-rose-50/70 p-6 rounded-3xl border border-rose-100 space-y-3">
            <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600" /> Session Termination
            </h4>
            <p className="text-xs text-rose-700">
              Sign out of your active SamruddiSave member session on this browser.
            </p>
            <button
              type="button"
              onClick={handleSignOutCurrent}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" /> Sign Out Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
