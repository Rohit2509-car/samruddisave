import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { SupportTicket, UserProfile } from '../../types';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Clock, User, ShieldCheck } from 'lucide-react';

interface SupportPortalPageProps {
  onNavigate: (path: string) => void;
}

export const SupportPortalPage: React.FC<SupportPortalPageProps> = ({ onNavigate }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(stateStore.getTickets());
  const [user, setUser] = useState<UserProfile>(stateStore.getCurrentUser());
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('payments');
  const [newMessageText, setNewMessageText] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setTickets(stateStore.getTickets());
      setUser(stateStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    stateStore.replySupportTicket(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessageText) return;
    stateStore.createSupportTicket(newSubject, newCategory, newMessageText);
    setNewSubject('');
    setNewMessageText('');
    setNewModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Customer Support Portal
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-[#1F1F24] mt-1">
            Help Desk & Inquiry Queue
          </h1>
          <p className="text-xs text-[#6C7285]">
            Assisting members with payments, 5-day grace period queries, AutoPay mandates, & gift hampers
          </p>
        </div>

        {user.role === 'member' && (
          <button
            onClick={() => setNewModalOpen(true)}
            className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md text-xs flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Open Support Ticket
          </button>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tickets Sidebar */}
        <div className="lg:col-span-5 bg-white p-4 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#6C7285] px-2">
            Ticket Queue ({tickets.length}):
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {tickets.map((t) => {
              const isSelected = t.id === selectedTicket?.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs ${
                    isSelected
                      ? 'border-[#4F5DFF] bg-[#4F5DFF]/5 ring-2 ring-[#4F5DFF]/20'
                      : 'border-[#E8EAF8] hover:bg-[#F7F8FC]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono font-bold text-[#4F5DFF]">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-bold text-[#1F1F24] line-clamp-1">{t.subject}</p>
                  <p className="text-[11px] text-[#6C7285] mt-0.5">By {t.user_name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Thread */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <>
              <div>
                <div className="flex justify-between items-start border-b border-[#E8EAF8] pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#4F5DFF] font-bold">{selectedTicket.id} • Category: {selectedTicket.category.toUpperCase()}</span>
                    <h3 className="font-heading font-extrabold text-xl text-[#1F1F24] mt-0.5">{selectedTicket.subject}</h3>
                    <p className="text-xs text-[#6C7285]">Member: {selectedTicket.user_name}</p>
                  </div>

                  {(user.role === 'support_agent' || user.role === 'employee' || user.role === 'super_admin') && (
                    <button
                      onClick={() => stateStore.updateTicketStatus(selectedTicket.id, 'RESOLVED')}
                      className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m) => {
                    const isStaff = m.sender_role !== 'member';

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          isStaff
                            ? 'bg-[#4F5DFF]/5 border-[#4F5DFF]/20 ml-6 text-[#1F1F24]'
                            : 'bg-[#F7F8FC] border-[#E8EAF8] mr-6 text-[#1F1F24]'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#4F5DFF]">{m.sender} ({m.sender_role})</span>
                          <span className="text-[#6C7285]">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[#E8EAF8] flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#F7F8FC] border border-[#E8EAF8] focus:border-[#4F5DFF] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1F1F24] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#4F5DFF] hover:bg-[#6A6DFF] text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5 shrink-0"
                >
                  Reply <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-[#6C7285]">Select a support ticket to view details</div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8EAF8]">
            <h3 className="font-heading font-bold text-lg text-[#1F1F24]">Open Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  placeholder="Describe your inquiry..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl px-3 py-2 outline-none"
                >
                  <option value="payments">Monthly Payments & Grace Period</option>
                  <option value="kyc">KYC & Document Verification</option>
                  <option value="autopay">AutoPay Mandate Setup</option>
                  <option value="hampers">Maturity Gift Hampers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F24] mb-1">Message Details:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain your issue..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="bg-slate-100 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4F5DFF] text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
