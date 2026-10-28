import React from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { MessageSquare, X } from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const { notifications, dismissNotification, setActiveChatId } = useWhatsApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto flex items-center gap-3 p-3.5 bg-[#202c33] text-white border border-[#374248] rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-200 cursor-pointer hover:bg-[#2a3942] transition-colors"
          onClick={() => {
            setActiveChatId(notif.chatId);
            dismissNotification(notif.id);
          }}
        >
          {notif.avatar ? (
            <img
              src={notif.avatar}
              alt=""
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 text-white font-medium">
              <MessageSquare className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-400 truncate">{notif.title}</p>
            <p className="text-xs text-gray-300 truncate">{notif.body}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(notif.id);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
