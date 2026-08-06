import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { ChitAuction, UserProfile, ChitGroup } from '../types';
import { Gavel, Clock, Trophy, TrendingDown, DollarSign, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuctionsPageProps {
  onNavigate: (path: string) => void;
}

export const AuctionsPage: React.FC<AuctionsPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(stateStore.getCurrentUser());
  const [auctions, setAuctions] = useState<ChitAuction[]>(stateStore.getAuctions());
  const [chitGroups, setChitGroups] = useState<ChitGroup[]>(stateStore.getChitGroups());
  
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [discountBidInput, setDiscountBidInput] = useState<number>(5000);
  const [placing, setPlacing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setUser(stateStore.getCurrentUser());
      setAuctions(stateStore.getAuctions());
      setChitGroups(stateStore.getChitGroups());
    });
    return unsubscribe;
  }, []);

  const handlePlaceBid = async (auctionId: string) => {
    if (!user) {
      onNavigate('/login');
      return;
    }

    if (discountBidInput <= 0) {
      setFeedbackMsg('Please enter a valid discount bid amount greater than ₹0.');
      return;
    }

    setPlacing(true);
    setFeedbackMsg(null);

    const res = await stateStore.placeAuctionBid(auctionId, user.id, discountBidInput);
    setPlacing(false);
    setFeedbackMsg(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-purple-600" /> Live Chit Fund Bidding System
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1F1F24]">
          Monthly Auction & Discount Bidding
        </h1>
        <p className="text-xs text-[#6C7285] max-w-lg mx-auto">
          Participate in scheduled monthly auctions. Place a discount bid to claim the prize pool early or earn dividends on your monthly installment.
        </p>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold text-blue-600 underline">Dismiss</button>
        </div>
      )}

      {/* Live & Scheduled Auctions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {auctions.map((auction) => {
          const group = chitGroups.find((g) => g.id === auction.group_id);
          const isLive = auction.status === 'live';
          const isCompleted = auction.status === 'completed';
          const prizePool = (group?.total_value || 50000) - (auction.winning_discount_bid || 0);

          return (
            <div
              key={auction.id}
              className={`bg-white rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl transition-all ${
                isLive ? 'border-[#4F5DFF] ring-2 ring-[#4F5DFF]/20' : 'border-[#E8EAF8]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isLive ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isLive ? '🔴 LIVE BIDDING NOW' : 'COMPLETED AUCTION'}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
                    {auction.group_name || group?.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6C7285] font-semibold">Total Chit Value</span>
                  <p className="font-heading font-extrabold text-2xl text-[#4F5DFF]">
                    ₹{(group?.total_value || 50000).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#F7F8FC] p-3.5 rounded-2xl border border-[#E8EAF8]">
                  <span className="text-[#6C7285]">Lowest Discount Bid:</span>
                  <p className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">
                    ₹{(auction.winning_discount_bid || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-emerald-800 font-medium">Disbursal Prize Amount:</span>
                  <p className="font-heading font-extrabold text-xl text-emerald-700 mt-0.5">
                    ₹{prizePool.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Bidding Actions / Winner Info */}
              {isLive ? (
                <div className="space-y-3 bg-[#F7F8FC] p-4 rounded-2xl border border-[#E8EAF8]">
                  <label className="block text-xs font-bold text-[#1F1F24]">Enter Discount Bid Amount (₹):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step={500}
                      value={discountBidInput}
                      onChange={(e) => setDiscountBidInput(Number(e.target.value))}
                      placeholder="e.g. 6000"
                      className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAF8] focus:outline-none focus:border-[#4F5DFF] bg-white font-bold text-sm"
                    />
                    <button
                      disabled={placing}
                      onClick={() => handlePlaceBid(auction.id)}
                      className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer disabled:opacity-50"
                    >
                      {placing ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-bold text-[#1F1F24]">Winner: {auction.winner_name || 'Karthickeyan M.'}</p>
                      <p className="text-[10px] text-[#6C7285]">Won with discount bid of ₹{auction.winning_discount_bid?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Prize Disbursed
                  </span>
                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
};
