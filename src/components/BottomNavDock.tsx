import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile } from '../types';
import { Home, BarChart3, Plus, Landmark, Gift, FileCheck2, Building, LayoutDashboard, CreditCard } from 'lucide-react';

interface BottomNavDockProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const isKYCPending = user.role === 'member' && user.kyc_status !== 'approved';

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_16px_36px_rgba(15,23,42,0.14)] rounded-full px-5 py-2.5 flex items-center justify-between gap-5 sm:gap-7 transition-all duration-300">
        
        {/* Item 1: Home */}
        <button
          onClick={() => onNavigate('/')}
          title="Overview"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
            currentPath === '/' ? 'text-slate-950 font-bold scale-110' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[9px] font-semibold mt-0.5 sm:block hidden">Home</span>
        </button>

        {/* Item 2: Plans / Maturity */}
        <button
          onClick={() => onNavigate('/plans')}
          title="Maturity Plans"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
            currentPath === '/plans' ? 'text-slate-950 font-bold scale-110' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[9px] font-semibold mt-0.5 sm:block hidden">Plans</span>
        </button>

        {/* Item 3 (CENTER ACTION BUTTON): Prominent Blue Circle with Plus Icon */}
        <button
          onClick={() => {
            if (isKYCPending) {
              onNavigate('/kyc');
            } else {
              onNavigate('/pay');
            }
          }}
          title={isKYCPending ? "Complete KYC First" : "Execute Monthly Deposit"}
          className="relative -top-5 group flex items-center justify-center focus:outline-none"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-[3.5px] border-white transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:shadow-blue-500/60">
            <Plus className="w-6 h-6 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
          </div>
          <span className="absolute -bottom-4 text-[9px] font-extrabold text-blue-600 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/70 shadow-2xs">
            Deposit
          </span>
        </button>

        {/* Item 4: Escrow Ledger / Bank */}
        <button
          onClick={() => onNavigate('/ledger')}
          title="Escrow Ledger"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
            currentPath === '/ledger' ? 'text-slate-950 font-bold scale-110' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[9px] font-semibold mt-0.5 sm:block hidden">Escrow</span>
        </button>

        {/* Item 5: Hampers / Dashboard */}
        <button
          onClick={() => onNavigate('/dashboard')}
          title="Wallet Dashboard"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
            currentPath === '/dashboard' || currentPath === '/hampers'
              ? 'text-slate-950 font-bold scale-110'
              : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[9px] font-semibold mt-0.5 sm:block hidden">Wallet</span>
        </button>

      </div>
    </nav>
  );
};

