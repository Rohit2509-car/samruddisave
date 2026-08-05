import React, { useState } from 'react';
import { stateStore } from '../store/StateStore';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { ShieldCheck, User, Mail, Phone, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  defaultMode?: 'login' | 'register';
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultMode = 'login', onNavigate }) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Login Form
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMsg('Please enter your Email/Mobile and Password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Supabase Auth Login
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.trim(),
        password: password.trim(),
      });

      let userId: string | null = authData?.user?.id || null;

      // Local StateStore Fallback for Demo Profiles
      if (authErr || !userId) {
        const q = emailOrPhone.toLowerCase().trim();
        const profiles = stateStore.getProfiles();
        const match = profiles.find(
          (p) => p.email.toLowerCase() === q || p.phone.includes(q) || p.id === q
        );
        if (match) {
          userId = match.id;
        }
      }

      if (!userId) {
        setErrorMsg('Invalid email or password. Please try registering a new account.');
        setLoading(false);
        return;
      }

      // 2. Set Current User Session
      stateStore.setCurrentUserId(userId);
      const profile = stateStore.getCurrentUser();

      // 3. User Validation: Check if Profile & Onboarding is complete
      const isCompleteProfile = profile && profile.full_name && profile.phone && profile.pan_number && profile.kyc_status !== 'unsubmitted';

      setSuccessMsg(`Login successful! Checking onboarding status...`);

      setTimeout(() => {
        if (isCompleteProfile) {
          onNavigate('/dashboard');
        } else {
          onNavigate('/onboarding');
        }
      }, 600);

    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please enter a valid email and password.');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms of Service & Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword.trim(),
        options: {
          data: {
            full_name: regFullName.trim(),
            phone: regMobile.trim(),
          }
        }
      });

      const newUserId = authData?.user?.id || `user-new-${Date.now()}`;

      // 2. Register profile in StateStore
      const newProfile: UserProfile = {
        id: newUserId,
        full_name: regFullName.trim() || 'Member',
        email: regEmail.trim(),
        phone: regMobile.trim(),
        pan_number: '',
        aadhaar_number: '',
        role: 'member' as const,
        kyc_status: 'unsubmitted' as const,
        pipeline_stage: 'signup' as any,
        ocr_confidence: 0,
        created_at: new Date().toISOString()
      };

      await stateStore.registerOrUpdateProfile(newProfile);

      setSuccessMsg('Account created successfully! Proceeding to Onboarding...');
      setTimeout(() => {
        onNavigate('/onboarding');
      }, 700);

    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8EAF8] shadow-2xl p-8 space-y-6">
        
        {/* Brand Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full border border-[#4F5DFF]/20">
            <ShieldCheck className="w-4 h-4 text-[#4F5DFF]" />
            RBI Escrow Certified Login
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24]">
            {mode === 'login' ? 'Welcome Back to SamruddiSave' : 'Start Your Savings Journey'}
          </h2>
          <p className="text-xs text-[#6C7285]">
            {mode === 'login'
              ? 'Enter your credentials to access your gold & appliance savings dashboard'
              : 'Create a new account to enroll in 12-month disciplined micro-savings'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F7F8FC] p-1 rounded-2xl border border-[#E8EAF8] text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-[#4F5DFF] text-white shadow-sm'
                : 'text-[#6C7285] hover:text-[#1F1F24]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[#4F5DFF] text-white shadow-sm'
                : 'text-[#6C7285] hover:text-[#1F1F24]'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form (Customer Sign In with Email & Password) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#1F1F24] font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1F1F24] font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold rounded-xl shadow-lg shadow-[#4F5DFF]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#1F1F24] font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Rohit Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
              />
            </div>

            <div>
              <label className="block text-[#1F1F24] font-bold mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
              />
            </div>

            <div>
              <label className="block text-[#1F1F24] font-bold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
              />
            </div>

            <div>
              <label className="block text-[#1F1F24] font-bold mb-1">Create Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-[#F7F8FC]"
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#4F5DFF]"
              />
              <span className="text-[11px] text-[#6C7285] leading-tight">
                I accept the <a href="#terms" className="text-[#4F5DFF] font-semibold underline">Terms & Conditions</a> and consent to RBI Escrow Account handling.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold rounded-xl shadow-lg shadow-[#4F5DFF]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Continue to Onboarding'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
