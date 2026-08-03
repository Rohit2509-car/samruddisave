import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { SavingsCircle, UserProfile } from '../types';
import { Users, Award, ShieldCheck, Plus, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface SavingsCirclesPageProps {
  onNavigate: (path: string) => void;
}

export const SavingsCirclesPage: React.FC<SavingsCirclesPageProps> = ({ onNavigate }) => {
  const [circles, setCircles] = useState<SavingsCircle[]>(stateStore.getCircles());
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [joinedCircleId, setJoinedCircleId] = useState<string | null>('circle-1');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setCircles(stateStore.getCircles());
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleToggleJoin = (circleId: string) => {
    if (joinedCircleId === circleId) {
      setJoinedCircleId(null);
    } else {
      setJoinedCircleId(circleId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="nexora-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-blue-50 text-blue-600 border border-blue-200/70 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Peer Micro-Savings Communities
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2">
            Savings Circles & Goal Squads
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium leading-relaxed">
            Save alongside disciplined retail investors. Maintain collective 100% payment streaks to unlock bonus yield rewards and festive hampers.
          </p>
        </div>

        <button
          onClick={() => {
            alert('New Savings Circle Creation: Enter squad name & target monthly pool.');
          }}
          className="nexora-pill-btn font-bold py-3.5 px-6 text-xs flex items-center gap-2 shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create New Savings Circle
        </button>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {circles.map((circle) => {
          const isMember = joinedCircleId === circle.id;
          const pct = Math.round((circle.current_members / circle.target_members) * 100);

          return (
            <div
              key={circle.id}
              className={`nexora-card nexora-card-hover rounded-3xl border p-7 sm:p-8 space-y-6 shadow-sm transition-all ${
                isMember ? 'border-blue-600 ring-4 ring-blue-500/15 bg-white' : 'border-slate-200/80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-purple-50 text-purple-600 border border-purple-200/70 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {circle.reward_badge}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-900 mt-1.5">
                    {circle.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold px-3.5 py-1 rounded-full shadow-2xs">
                  <Zap className="w-3.5 h-3.5" /> {circle.streak_count} Month Streak
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {circle.description}
              </p>

              {/* Goal Progress Bar */}
              <div className="space-y-2.5 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Squad Capacity ({circle.current_members}/{circle.target_members} Members)</span>
                  <span className="text-blue-600 font-bold">{pct}% Filled</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 font-medium">
                  <span>Monthly Pool: ₹{circle.total_monthly_pool.toLocaleString('en-IN')}</span>
                  <span>100% On-Time Ledger</span>
                </div>
              </div>

              {/* Members Avatars */}
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-3">Active Squad Members:</p>
                <div className="flex flex-wrap gap-2">
                  {circle.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs"
                    >
                      <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        {m.streak}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Bonus Perks Enabled
                </span>
                <button
                  onClick={() => handleToggleJoin(circle.id)}
                  className={`py-2.5 px-6 rounded-full font-bold text-xs transition-all ${
                    isMember
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'nexora-pill-btn text-white'
                  }`}
                >
                  {isMember ? '✓ Joined Circle' : 'Join Circle Squad'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

