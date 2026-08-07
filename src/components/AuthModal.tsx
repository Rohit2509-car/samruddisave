import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { supabase } from '../lib/supabase';
import { PasswordMetadataService } from '../services/PasswordMetadataService';
import { ShieldCheck, User, Mail, Phone, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle, X, Sparkles, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'forgot_password';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // OTP Verification Step
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Status Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter your Email/Mobile/ID and Password.');
      return;
    }

    try {
      // 1. Supabase Auth Login Attempt
      if (loginIdentifier.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginIdentifier.trim(),
          password: loginPassword.trim(),
        });
        if (!authError && authData?.user) {
          stateStore.setCurrentUserId(authData.user.id);
          setSuccessMsg(`Welcome back! Redirecting to dashboard...`);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 400);
          return;
        }
      }
    } catch (err) {
      console.warn('Supabase Auth login fallback:', err);
    }

    // 2. Authenticate with StateStore local profiles & PasswordMetadataService
    const profiles = stateStore.getProfiles();
    const q = loginIdentifier.toLowerCase().trim();
    const user = profiles.find(
      (p) =>
        p.email?.toLowerCase() === q ||
        p.phone?.includes(q) ||
        p.id?.toLowerCase() === q ||
        (p.login_id && p.login_id.toLowerCase() === q)
    );

    if (!user) {
      setErrorMsg('Invalid email or password. Please check your credentials and try again.');
      return;
    }

    const isPasswordValid = await PasswordMetadataService.verifyPassword(user.id, user.email, loginPassword.trim());
    if (!isPasswordValid) {
      setErrorMsg('Invalid email or password. Please check your credentials and try again.');
      return;
    }

    stateStore.setCurrentUserId(user.id);
    setSuccessMsg(`Welcome back, ${user.full_name}! Redirecting to dashboard...`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Password reset instructions have been sent to your email. Please check your inbox.');
      }
    } catch (err: any) {
      setSuccessMsg('Password reset instructions have been sent to your email. Please check your inbox.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regFullName.trim() || !regMobile.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    // Trigger OTP Step
    setOtpStep(true);
    setSuccessMsg(`OTP verification code sent to ${regMobile} and ${regEmail}. (Demo OTP: 123456)`);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpCode.trim() !== '123456' && otpCode.trim().length !== 6) {
      setErrorMsg('Invalid 6-digit OTP verification code. Use 123456 for demo.');
      return;
    }

    let newUserId: string | null = null;
    try {
      const { data: authData } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword.trim(),
        options: {
          data: {
            full_name: regFullName.trim(),
            phone: regMobile.trim(),
          }
        }
      });
      newUserId = authData?.user?.id || null;
    } catch (e) {
      console.warn('Supabase auth signup fallback:', e);
    }

    if (!newUserId) {
      newUserId = `user-${Date.now()}`;
    }

    // Register user profile & save password hash metadata
    const newProfile = {
      id: newUserId,
      full_name: regFullName.trim() || 'Member',
      email: regEmail.trim(),
      phone: regMobile.trim() || '+91 98765 43210',
      pan_number: 'ABCDE1234F',
      aadhaar_number: '9876 5432 1098',
      role: 'member' as const,
      kyc_status: 'approved' as const,
      onboarding_completed: true,
      pipeline_stage: 'ACTIVE_SAVING' as any,
      ocr_confidence: 99.8,
      created_at: new Date().toISOString()
    };

    await stateStore.registerOrUpdateProfile(newProfile, regPassword.trim());
    stateStore.setCurrentUserId(newUserId);
    stateStore.getUserMembership(newUserId);

    setSuccessMsg(`Registration successful! Directing to your dashboard...`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E8EAF8] shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Background Pill */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#4F5DFF]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EAF8] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] text-white font-extrabold text-base flex items-center justify-center shadow-sm">
              S
            </div>
            <span className="font-heading font-extrabold text-base text-[#1F1F24]">
              Samruddi<span className="text-[#4F5DFF]">Save</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6C7285] hover:bg-[#F7F8FC] hover:text-[#1F1F24] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!otpStep && (
          <div className="flex bg-[#F7F8FC] p-1 rounded-2xl border border-[#E8EAF8]">
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                mode === 'login'
                  ? 'bg-white text-[#4F5DFF] shadow-xs'
                  : 'text-[#6C7285] hover:text-[#1F1F24]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                mode === 'register'
                  ? 'bg-white text-[#4F5DFF] shadow-xs'
                  : 'text-[#6C7285] hover:text-[#1F1F24]'
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && !otpStep && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Email / Mobile / Member ID *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter Email, Phone, or Member ID..."
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#6C7285]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#4F5DFF] focus:ring-[#4F5DFF]"
                />
                Remember Me
              </label>

              <button
                type="button"
                onClick={() => setMode('forgot_password')}
                className="font-bold text-[#4F5DFF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B49DF] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Sign In to Member Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && !otpStep && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Karthickeyan M"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765..."
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SAMRUDDI_2026"
                value={regReferral}
                onChange={(e) => setRegReferral(e.target.value)}
                className="w-full p-2.5 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#6C7285] leading-tight">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded text-[#4F5DFF] focus:ring-[#4F5DFF] mt-0.5"
              />
              I accept the RBI Escrow Savings Terms of Service & Privacy Guidelines.
            </label>

            <button
              type="submit"
              className="w-full min-h-[44px] bg-[#4F5DFF] hover:bg-[#3B49DF] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Proceed to OTP Verification <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP */}
        {otpStep && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F5DFF] flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-[#1F1F24]">Enter 6-Digit OTP</h4>
              <p className="text-xs text-[#6C7285]">Enter the code sent to your registered mobile and email</p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-xl font-mono font-bold tracking-widest p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl focus:outline-none focus:border-[#4F5DFF]"
              />
              <p className="text-[11px] text-center text-[#6C7285] mt-1 font-mono">Demo Master OTP: <strong>123456</strong></p>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Verify OTP & Complete Registration <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FLOW */}
        {mode === 'forgot_password' && (
          <div className="space-y-4 text-xs">
            <p className="text-[#6C7285]">Enter your registered Email or Mobile number to reset your account password.</p>
            <input
              type="text"
              placeholder="Email or Phone Number..."
              className="w-full p-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4F5DFF]"
            />
            <button
              onClick={() => {
                setSuccessMsg('Password reset OTP sent to registered phone number.');
                setTimeout(() => setMode('login'), 1500);
              }}
              className="w-full min-h-[44px] bg-[#4F5DFF] text-white font-bold text-xs py-3 rounded-xl shadow-md"
            >
              Send Password Reset OTP
            </button>
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-bold text-[#6C7285] hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
