import React, { useEffect } from 'react';
import { GiftHamper } from '../types';
import { Gift, Sparkles, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface HamperDetailModalProps {
  hamper: GiftHamper | null;
  isOpen: boolean;
  onClose: () => void;
  isAllocated?: boolean;
}

export const HamperDetailModal: React.FC<HamperDetailModalProps> = ({
  hamper,
  isOpen,
  onClose,
  isAllocated,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.position = originalPosition || '';
        document.body.style.width = originalWidth || '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !hamper) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain touch-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EAF8] animate-in zoom-in-95 duration-200 relative my-auto touch-auto overscroll-contain">
        
        {/* Modal Banner Image Header */}
        <div className="relative h-48 w-full bg-slate-900 shrink-0">
          <img
            src={hamper.image}
            alt={hamper.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors backdrop-blur-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="bg-[#8A7BFF] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {hamper.tier}
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-white mt-1">
                {hamper.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300">Retail Value</span>
              <p className="font-heading font-extrabold text-xl text-emerald-400">
                ₹{hamper.retail_value.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-[#6C7285]">
          
          {isAllocated && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold text-emerald-900">
                ✓ Included Gift / Assigned to Your Month 12 Maturity Payout
              </p>
            </div>
          )}

          <p className="text-xs text-[#6C7285] leading-relaxed">
            {hamper.description}
          </p>

          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1F1F24] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F5DFF]" /> Included Luxury Items ({hamper.included_items.length}):
            </h4>

            <div className="space-y-2.5">
              {hamper.included_items.map((item, idx) => (
                <div key={idx} className="bg-[#F7F8FC] border border-[#E8EAF8] p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#1F1F24]">{item.name}</p>
                    <p className="text-[11px] text-[#6C7285]">{item.description}</p>
                  </div>
                  <span className="font-mono font-bold text-[#4F5DFF] bg-white px-2.5 py-1 rounded-xl border border-[#E8EAF8] shrink-0 ml-2">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-[#6C7285] border-t border-[#E8EAF8]">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" /> RBI Escrow Backed Perks
            </span>
            <button
              onClick={onClose}
              className="bg-[#1F1F24] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-black transition-colors"
            >
              Close Catalogue
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
