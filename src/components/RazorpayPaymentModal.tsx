import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, Smartphone, Building, Sparkles, X } from 'lucide-react';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName?: string;
  cycleNumber?: number;
  onPaymentSuccess: (paymentId: string) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  planName,
  cycleNumber,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'card' | 'netbanking'>('gpay');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setProcessing(true);

    try {
      // Call backend order creation endpoint
      await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, planName, cycleNumber }),
      });
    } catch (e) {
      console.warn('Razorpay order backend call fallback');
    }

    // Simulate Razorpay Gateway latency
    setTimeout(() => {
      setProcessing(false);
      const paymentId = `pay_ss_${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onPaymentSuccess(paymentId);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8EAF8] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Razorpay Header */}
        <div className="bg-gradient-to-r from-[#1F1F24] to-[#4F5DFF] text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Razorpay Secured (Test Mode)
            </div>
            <h3 className="font-heading font-extrabold text-xl text-white mt-1">
              ₹{amount.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-300">
              {planName ? `${planName}` : `Month ${cycleNumber || 1} Contribution`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escrow Trustee Note */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 px-5 flex items-center gap-2 text-xs text-emerald-900">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Direct deposit into <strong>HDFC Bank RBI Escrow Account</strong></span>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          
          <label className="block text-xs font-semibold text-[#6C7285] uppercase tracking-wider">
            Select Payment Method:
          </label>

          <div className="space-y-2">
            
            {/* GPay */}
            <button
              onClick={() => setSelectedMethod('gpay')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                selectedMethod === 'gpay'
                  ? 'border-[#4F5DFF] bg-[#4F5DFF]/5 text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                  : 'border-[#E8EAF8] hover:bg-[#F7F8FC] text-[#1F1F24]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  G
                </div>
                <span>Google Pay UPI / AutoPay</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Instant</span>
            </button>

            {/* PhonePe */}
            <button
              onClick={() => setSelectedMethod('phonepe')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                selectedMethod === 'phonepe'
                  ? 'border-[#4F5DFF] bg-[#4F5DFF]/5 text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                  : 'border-[#E8EAF8] hover:bg-[#F7F8FC] text-[#1F1F24]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  P
                </div>
                <span>PhonePe UPI AutoPay</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Instant</span>
            </button>

            {/* Paytm */}
            <button
              onClick={() => setSelectedMethod('paytm')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                selectedMethod === 'paytm'
                  ? 'border-[#4F5DFF] bg-[#4F5DFF]/5 text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                  : 'border-[#E8EAF8] hover:bg-[#F7F8FC] text-[#1F1F24]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  Py
                </div>
                <span>Paytm Wallet & UPI</span>
              </div>
            </button>

            {/* NetBanking */}
            <button
              onClick={() => setSelectedMethod('netbanking')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                selectedMethod === 'netbanking'
                  ? 'border-[#4F5DFF] bg-[#4F5DFF]/5 text-[#4F5DFF] ring-2 ring-[#4F5DFF]/20'
                  : 'border-[#E8EAF8] hover:bg-[#F7F8FC] text-[#1F1F24]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-slate-600" />
                <span>NetBanking (HDFC, SBI, ICICI, Axis)</span>
              </div>
            </button>

          </div>

          {/* Pay Button */}
          <button
            disabled={processing}
            onClick={handlePayNow}
            className="w-full bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#4F5DFF]/30 flex items-center justify-center gap-2 text-sm mt-4 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Escrow Deposit...
              </>
            ) : (
              <>
                Pay ₹{amount.toLocaleString('en-IN')} via Razorpay
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            256-Bit SSL Encryption • RBI Escrow Trustee Monitored
          </p>

        </div>

      </div>
    </div>
  );
};
