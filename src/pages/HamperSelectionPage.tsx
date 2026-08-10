import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { GiftHamper, UserProfile } from '../types';
import { GIFT_HAMPERS } from '../data/mockData';
import { HamperDetailModal } from '../components/HamperDetailModal';
import { Gift, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Eye } from 'lucide-react';

interface HamperSelectionPageProps {
  onNavigate: (path: string) => void;
}

export const HamperSelectionPage: React.FC<HamperSelectionPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [selectedHamper, setSelectedHamper] = useState<GiftHamper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const handleOpenDetail = (hamper: GiftHamper) => {
    setSelectedHamper(hamper);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Curated Festival Rewards
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-1">
            Month 12 Maturity Gift Catalogue
          </h1>
          <p className="text-xs text-[#6C7285] mt-1 max-w-xl">
            As part of your 12-month savings commitment, you receive a ₹4,500 retail-value curated gift hamper delivered to your doorstep upon maturity.
          </p>
        </div>

        {user?.allocated_hamper_id ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">✓ Included Gift / Assigned to Your Maturity Payout</p>
              <p className="text-emerald-800 text-[11px]">Allocated by MRM Officer {user?.allocated_by_admin || 'Staff'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#F7F8FC] border border-[#E8EAF8] p-4 rounded-2xl text-xs text-[#6C7285]">
            <span className="font-bold text-[#1F1F24]">Allocation Policy:</span> Gift hampers are assigned by your MRM Officer prior to Month 12 maturity disbursal.
          </div>
        )}
      </div>

      {/* Hampers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GIFT_HAMPERS.map((hamper) => {
          const isAssigned = user?.allocated_hamper_id === hamper.id;

          return (
            <div
              key={hamper.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between ${
                isAssigned ? 'border-emerald-400 ring-2 ring-emerald-300' : 'border-[#E8EAF8]'
              }`}
            >
              <div>
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  <img
                    src={hamper.image}
                    alt={hamper.name}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {hamper.tier}
                  </span>
                  
                  {isAssigned && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Assigned Gift
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 bg-[#1F1F24]/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-xl backdrop-blur-xs">
                    ₹{hamper.retail_value.toLocaleString('en-IN')} Value
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-[#1F1F24]">{hamper.name}</h3>
                  <p className="text-xs text-[#6C7285] line-clamp-2">{hamper.description}</p>
                  
                  <div className="bg-[#F7F8FC] p-3 rounded-xl border border-[#E8EAF8] text-xs space-y-1">
                    <p className="font-semibold text-[#1F1F24]">Top Items Included:</p>
                    {hamper.included_items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-[11px] text-[#6C7285] flex items-center gap-1">
                        • {item.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleOpenDetail(hamper)}
                  className="w-full bg-[#F7F8FC] hover:bg-[#4F5DFF] text-[#1F1F24] hover:text-white font-bold py-3 px-4 rounded-xl border border-[#E8EAF8] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <HamperDetailModal
        hamper={selectedHamper}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isAllocated={selectedHamper && user ? user.allocated_hamper_id === selectedHamper.id : false}
      />

    </div>
  );
};
