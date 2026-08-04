import React, { useState, useEffect } from 'react';
import { stateStore } from '../store/StateStore';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, CreditCard, Calendar, Gift, Megaphone, ShieldAlert, X } from 'lucide-react';

interface NotificationsDropdownProps {
  userId: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    stateStore.getUserNotifications(userId)
  );

  useEffect(() => {
    const unsub = stateStore.subscribe(() => {
      setNotifications(stateStore.getUserNotifications(userId));
    });
    return unsub;
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    stateStore.markAllNotificationsAsRead(userId);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'due_date':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#4F5DFF]" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-[#4F5DFF]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-[#F7F8FC] border border-[#E8EAF8] text-[#6C7285] hover:text-[#1F1F24] hover:bg-white transition-all cursor-pointer active:scale-95"
        aria-label="Notifications"
        title="View Account Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E8EAF8] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[#E8EAF8]">
            <div className="flex items-center gap-2">
              <p className="font-heading font-extrabold text-sm text-[#1F1F24]">Notifications</p>
              {unreadCount > 0 && (
                <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#4F5DFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8EAF8] px-2 py-1">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-[#6C7285] italic">No notifications right now.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => stateStore.markNotificationAsRead(n.id)}
                  className={`p-3 rounded-2xl transition-colors cursor-pointer flex items-start gap-3 my-1 ${
                    n.read ? 'bg-white hover:bg-[#F7F8FC]' : 'bg-indigo-50/40 hover:bg-indigo-50/70 border border-indigo-100'
                  }`}
                >
                  <div className="p-2 bg-white rounded-xl border border-[#E8EAF8] shadow-2xs shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${n.read ? 'text-[#1F1F24]' : 'text-[#4F5DFF]'}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-[#6C7285] whitespace-nowrap">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6C7285] mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};
