import React from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';

export const CallsTab: React.FC = () => {
  const { users, currentUser, startCall, chats, theme, language } = useWhatsApp();

  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  // Demo call history
  const callLogs = [
    {
      id: 'call_1',
      user: users[1] || users[0],
      type: 'video' as const,
      direction: 'incoming' as const,
      status: 'missed' as const,
      time: isBn ? 'আজ দুপুর ১:২০' : 'Today 1:20 PM',
    },
    {
      id: 'call_2',
      user: users[2] || users[0],
      type: 'audio' as const,
      direction: 'outgoing' as const,
      status: 'connected' as const,
      time: isBn ? 'গতকাল রাত ৮:৪৫' : 'Yesterday 8:45 PM',
    },
    {
      id: 'call_3',
      user: users[3] || users[0],
      type: 'video' as const,
      direction: 'outgoing' as const,
      status: 'connected' as const,
      time: isBn ? '২৫ অক্টোবর' : 'Oct 25',
    },
  ];

  const handleStartCall = (userId: string, type: 'audio' | 'video') => {
    // find or use direct chat
    const chat = chats.find(
      (c) => c.type === 'direct' && c.participants.includes(userId)
    );
    if (chat) {
      startCall(chat.id, type);
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-y-auto ${
        isDark ? 'bg-[#111b21] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-4 py-4 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-gray-200'
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight">
          {isBn ? 'কল ইতিহাস' : 'Calls'}
        </h2>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
          {isBn ? 'সাম্প্রতিক কল' : 'Recent Calls'}
        </p>

        <div className="space-y-1">
          {callLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                isDark ? 'hover:bg-[#202c33]' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={log.user.avatar}
                  alt={log.user.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                />

                <div>
                  <h4 className="text-sm font-semibold truncate text-white">
                    {log.user.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    {log.status === 'missed' ? (
                      <PhoneMissed className="w-3.5 h-3.5 text-red-400" />
                    ) : log.direction === 'outgoing' ? (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-[#00a884]" />
                    ) : (
                      <PhoneIncoming className="w-3.5 h-3.5 text-[#00a884]" />
                    )}
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCall(log.user.id, log.type)}
                  className="p-2.5 rounded-full hover:bg-white/10 text-[#00a884] transition-colors"
                >
                  {log.type === 'video' ? (
                    <Video className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
