import React, { useEffect, useState } from 'react';
import { stateStore } from '../store/StateStore';
import { UserProfile } from '../types';
import { Home, LayoutDashboard, CreditCard, Gift, Users, FileCheck2, Building } from 'lucide-react';

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

  if (user.role === 'admin' || currentPath.startsWith('/admin') || currentPath === '/console') {
    return null;
  }

  const dockItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'KYC', path: '/kyc', icon: FileCheck2 },
    { label: 'Wallet', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deposit', path: '/pay', icon: CreditCard },
    { label: 'Hampers', path: '/hampers', icon: Gift },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-[#1F1F24]/90 backdrop-blur-md text-white rounded-full px-4 py-2 border border-white/10 shadow-2xl flex items-center gap-4">
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;

        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all ${
              isActive ? 'text-[#4F5DFF] bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
