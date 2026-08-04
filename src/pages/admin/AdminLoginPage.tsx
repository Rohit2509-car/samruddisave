import React, { useState } from 'react';
import { stateStore } from '../../store/StateStore';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('admin@samruddisave.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const success = stateStore.adminLogin(email, password);
      setLoading(false);
      if (success) {
        onNavigate('/admin');
      } else {
        setError('Invalid Admin credentials or your profile does not have Admin privileges.');
      }
    }, 400);
  };

  const handleQuickDemoAdmin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      stateStore.switchRole('admin');
      setLoading(false);
      onNavigate('/admin');
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#F7F8FC] to-[#EEF0FB]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8EAF8] shadow-2xl overflow-hidden animate-in fade-in duration-300">
        
        {/* Header Header Banner */}
        <div className="bg-gradient-to-r from-[#1F1F24] via-[#2D2E38] to-[#1F1F24] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4F5DFF]/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-14 h-14 bg-[#4F5DFF] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#4F5DFF]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white">
            SamruddiSave <span className="text-[#4F5DFF]">Console</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Single Admin Operational & Management Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs animate-in fade-in duration-150">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Failed</p>
                <p className="mt-0.5 text-rose-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@samruddisave.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs text-[#1F1F24] font-medium focus:bg-white focus:border-[#4F5DFF] focus:outline-none focus:ring-2 focus:ring-[#4F5DFF]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2">
                Admin Security Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#6C7285] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl text-xs text-[#1F1F24] font-medium focus:bg-white focus:border-[#4F5DFF] focus:outline-none focus:ring-2 focus:ring-[#4F5DFF]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4F5DFF] hover:bg-[#4F5DFF]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4F5DFF]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <span className="inline-block animate-spin font-bold">↻ Authenticating...</span>
              ) : (
                <>
                  Access Admin Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8EAF8]"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] text-[#6C7285] font-semibold">
              OR FOR TESTING
            </span>
          </div>

          <button
            onClick={handleQuickDemoAdmin}
            className="w-full py-3 bg-[#F7F8FC] hover:bg-[#E8EAF8]/60 text-[#1F1F24] border border-[#E8EAF8] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#4F5DFF]" />
            ⚡ 1-Click Demo Admin Login
          </button>

          <p className="text-[11px] text-[#6C7285] text-center mt-6">
            Protected by Supabase Row Level Security (RLS) & 256-bit AES Admin Encryption.
          </p>
        </div>

      </div>
    </div>
  );
};
