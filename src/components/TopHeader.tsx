import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { UserRole, UserProfile } from '../types';
import {
  ShieldCheck,
  User,
  ChevronDown,
  Sparkles,
  LogOut,
  Building2,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  Lock,
  RotateCcw
} from 'lucide-react';

interface TopHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
      setProfiles(stateStore.getProfiles());
    });
    return unsubscribe;
  }, []);

  const handleSwitchPersona = (targetUser: UserProfile) => {
    stateStore.setCurrentUser(targetUser.id);
    setPersonaOpen(false);
    setDropdownOpen(false);

    // Auto navigate to role default path
    if (targetUser.role === 'member') {
      onNavigate('/dashboard');
    } else if (targetUser.role === 'employee') {
      onNavigate('/employee');
    } else if (targetUser.role === 'support_agent') {
      onNavigate('/support');
    } else if (targetUser.role === 'finance_admin') {
      onNavigate('/finance');
    } else if (targetUser.role === 'super_admin') {
      onNavigate('/admin');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'member':
        return <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] border border-[#4F5DFF]/20 px-2 py-0.5 rounded-full text-xs font-semibold">Member</span>;
      case 'employee':
        return <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">MRM Officer</span>;
      case 'support_agent':
        return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Support Desk</span>;
      case 'finance_admin':
        return <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Escrow Finance</span>;
      case 'super_admin':
        return <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Super Admin</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8EAF8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Escrow Badge */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F5DFF] to-[#8A7BFF] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#4F5DFF]/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-tight text-[#1F1F24]">
                Samruddi<span className="text-[#4F5DFF]">Save</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-[#4F5DFF]/10 text-[#4F5DFF] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#4F5DFF]/20">
                <ShieldCheck className="w-3 h-3 text-[#4F5DFF]" />
                RBI Escrow Certified
              </span>
            </div>
            <p className="text-[11px] text-[#6C7285] hidden sm:block">
              12-Month Micro-Savings & Maturity Perks Platform
            </p>
          </div>
        </div>

        {/* Persona Switcher & User Profile Pill */}
        <div className="flex items-center gap-3">
          
          {/* Persona Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-2 bg-[#F7F8FC] hover:bg-[#E8EAF8]/50 border border-[#E8EAF8] text-[#1F1F24] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              title="Switch between RBAC personas (Member, MRM Officer, Support, Escrow Admin, Super Admin)"
            >
              <Building2 className="w-3.5 h-3.5 text-[#4F5DFF]" />
              <span className="hidden md:inline">Test Role:</span>
              <span className="font-semibold text-[#4F5DFF]">
                {user.role === 'member' ? 'Customer' : user.role === 'employee' ? 'MRM Officer' : user.role === 'support_agent' ? 'Support Desk' : user.role === 'finance_admin' ? 'Finance Admin' : 'Super Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6C7285]" />
            </button>

            {/* Persona Switcher Dropdown */}
            {personaOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E8EAF8] py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-[#E8EAF8] bg-[#F7F8FC]">
                  <p className="font-semibold text-[#1F1F24]">Switch RBAC Access Tier</p>
                  <p className="text-[11px] text-[#6C7285]">Simulate any of the 5 platform personas</p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p)}
                      className={`w-full text-left px-3 py-2 hover:bg-[#F7F8FC] flex items-center justify-between transition-colors ${
                        user.id === p.id ? 'bg-[#4F5DFF]/5 text-[#4F5DFF] font-medium' : 'text-[#1F1F24]'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{p.full_name}</p>
                        <p className="text-[10px] text-[#6C7285]">{p.email}</p>
                      </div>
                      {getRoleBadge(p.role)}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#E8EAF8] pt-1 px-2">
                  <button
                    onClick={() => {
                      stateStore.resetToDefaults();
                      setPersonaOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5 rounded hover:bg-slate-100"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset All Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white hover:bg-[#F7F8FC] border border-[#E8EAF8] p-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl transition-all shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6A6DFF] to-[#8A7BFF] text-white font-bold text-xs flex items-center justify-center">
                {user.full_name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#1F1F24] leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-[#6C7285] leading-none">{user.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6C7285] hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E8EAF8] py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#E8EAF8]">
                  <p className="font-semibold text-[#1F1F24]">{user.full_name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getRoleBadge(user.role)}
                    {user.role === 'member' && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        user.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        KYC {user.kyc_status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  {user.role === 'member' && (
                    <>
                      <button
                        onClick={() => { onNavigate('/dashboard'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24]"
                      >
                        <User className="w-4 h-4 text-[#4F5DFF]" /> My Wallet Dashboard
                      </button>
                      <button
                        onClick={() => { onNavigate('/kyc'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24]"
                      >
                        <FileCheck2 className="w-4 h-4 text-[#4F5DFF]" /> KYC Verification Status
                      </button>
                    </>
                  )}

                  {user.role === 'employee' && (
                    <button
                      onClick={() => { onNavigate('/employee'); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24]"
                    >
                      <FileCheck2 className="w-4 h-4 text-amber-600" /> MRM Approval Queue
                    </button>
                  )}

                  {user.role === 'finance_admin' && (
                    <button
                      onClick={() => { onNavigate('/finance'); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24]"
                    >
                      <Building2 className="w-4 h-4 text-purple-600" /> Escrow Disbursal Queue
                    </button>
                  )}

                  <button
                    onClick={() => { onNavigate('/support'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F8FC] flex items-center gap-2 text-[#1F1F24]"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-600" /> Help & Support Desk
                  </button>
                </div>

                <div className="border-t border-[#E8EAF8] pt-1 px-2">
                  <button
                    onClick={() => {
                      onNavigate('/');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
