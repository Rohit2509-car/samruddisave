import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { stateStore } from '../store/StateStore';
import { SecuritySettingsView } from '../components/SecuritySettingsView';

interface AccountSecurityPageProps {
  onNavigate: (path: string) => void;
}

export const AccountSecurityPage: React.FC<AccountSecurityPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState(stateStore.getCurrentUser());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Lock background page scrolling when Security Settings is active
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });

    return () => {
      // Restore normal background scrolling when returning or closing
      document.body.style.overflow = originalBodyOverflow || '';
      unsubscribe();
    };
  }, []);

  const handleGoBack = () => {
    document.body.style.overflow = '';
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate('/security');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F8FC] flex flex-col min-h-screen animate-in fade-in duration-200">
      
      {/* 1. FIXED TOP HEADER BAR FOR SECURITY SETTINGS */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E8EAF8] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs shrink-0">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F7F8FC] hover:bg-[#4F5DFF] border border-[#E8EAF8] text-[#1F1F24] hover:text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 group/back shrink-0"
          title="Return to Previous Page"
        >
          <ArrowLeft className="w-4 h-4 text-[#4F5DFF] group-hover/back:text-white transition-transform group-hover/back:-translate-x-1" />
          <span>Back to Security Center</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#1F1F24]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Supabase Auth 256-Bit RLS Protected</span>
        </div>
      </div>

      {/* 2. SECURITY SETTINGS INDEPENDENTLY SCROLLABLE WORKSPACE */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {user ? (
          <div className="space-y-6 pb-12">
            <SecuritySettingsView user={user} onNavigate={onNavigate} />
          </div>
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8EAF8] shadow-sm text-center space-y-5 max-w-2xl mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4F5DFF] mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-2xl text-[#1F1F24]">Authentication Required</h2>
              <p className="text-xs sm:text-sm text-[#6C7285] max-w-md mx-auto leading-relaxed">
                Please sign in to your SamruddiSave member account to change credentials, manage active sessions, or view account security status.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  document.body.style.overflow = '';
                  onNavigate('/login');
                }}
                className="w-full sm:w-auto bg-[#4F5DFF] hover:bg-[#3B48DF] text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                Sign In to Your Account
              </button>
              <button
                onClick={handleGoBack}
                className="w-full sm:w-auto bg-white border border-[#E8EAF8] text-[#1F1F24] hover:bg-slate-50 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all cursor-pointer"
              >
                Return to Security Center
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
