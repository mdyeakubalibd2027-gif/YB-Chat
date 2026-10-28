import React, { useState, useMemo } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import {
  Search,
  UserPlus,
  Users,
  Check,
  CheckCheck,
  Clock,
  Camera,
  FileText,
  Mic,
  Pin,
  Filter,
} from 'lucide-react';
import { Chat, MessageStatus } from '../types/whatsapp';

interface ChatListProps {
  onOpenNewContact: () => void;
  onOpenNewGroup: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  onOpenNewContact,
  onOpenNewGroup,
}) => {
  const { chats, messages, users, currentUser, activeChatId, setActiveChatId, theme, language } = useWhatsApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');

  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  // Format time display
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return isBn ? 'গতকাল' : 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get recipient/contact info for a direct chat
  const getPartnerUser = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const partnerId = chat.participants.find((p) => p !== currentUser?.id);
    return users.find((u) => u.id === partnerId) || null;
  };

  // Filtered, deduplicated and sorted chats
  const filteredChats = useMemo(() => {
    const uniqueMap = new Map<string, Chat>();
    chats.forEach((chat) => {
      if (chat && chat.id && !uniqueMap.has(chat.id)) {
        uniqueMap.set(chat.id, chat);
      }
    });

    return Array.from(uniqueMap.values())
      .filter((chat) => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = chat.name.toLowerCase().includes(q);
          const lastMsgText = chat.lastMessage?.text?.toLowerCase() || '';
          if (!matchName && !lastMsgText.includes(q)) return false;
        }

        // Category filter
        if (filterType === 'unread') {
          return (chat.unreadCount || 0) > 0;
        }
        if (filterType === 'groups') {
          return chat.type === 'group';
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA;
      });
  }, [chats, searchQuery, filterType]);

  const renderStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-gray-400 inline shrink-0" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-400 inline shrink-0" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400 inline shrink-0" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full md:w-96 lg:w-[420px] border-r shrink-0 select-none transition-colors ${
        isDark ? 'bg-[#111b21] border-[#2a3942]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-4 py-3.5 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-gray-200'
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight text-white dark:text-[#e9edef] light:text-slate-900">
          {isBn ? 'চ্যাট' : 'Chats'}
        </h2>

        <div className="flex items-center gap-1">
          {/* Add Contact Button */}
          <button
            onClick={onOpenNewContact}
            title={isBn ? 'নতুন কন্টাক্ট যোগ করুন' : 'New Contact'}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <UserPlus className="w-5 h-5 text-emerald-400" />
          </button>

          {/* New Group Button */}
          <button
            onClick={onOpenNewGroup}
            title={isBn ? 'নতুন গ্রুপ তৈরি করুন' : 'New Group'}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users className="w-5 h-5 text-[#00a884]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 pb-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
            isDark
              ? 'bg-[#202c33] border-[#2a3942] focus-within:border-[#00a884]'
              : 'bg-[#f0f2f5] border-gray-200 focus-within:border-[#00a884]'
          }`}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'চ্যাট খুঁজুন বা সার্চ করুন...' : 'Search or start new chat...'}
            className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-transparent">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filterType === 'all'
              ? 'bg-[#00a884] text-white shadow-sm'
              : isDark
              ? 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isBn ? 'সব চ্যাট' : 'All'}
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
            filterType === 'unread'
              ? 'bg-[#00a884] text-white shadow-sm'
              : isDark
              ? 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{isBn ? 'অপঠিত' : 'Unread'}</span>
        </button>
        <button
          onClick={() => setFilterType('groups')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filterType === 'groups'
              ? 'bg-[#00a884] text-white shadow-sm'
              : isDark
              ? 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isBn ? 'গ্রুপ সমূহ' : 'Groups'}
        </button>
      </div>

      {/* Chats Scroll List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 divide-y divide-[#2a3942]/40">
        {filteredChats.length === 0 ? (
          <div className="py-12 px-6 text-center text-gray-400">
            <div className="w-14 h-14 rounded-full bg-[#00a884]/15 flex items-center justify-center text-[#00a884] mx-auto mb-3">
              <UserPlus className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white">
              {isBn ? 'কোনো চ্যাট নেই' : 'No chats yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {isBn
                ? 'আমাদের স্টোরে নিবন্ধিত ফোন নম্বর যোগ করে সরাসরি কথা বলা শুরু করুন।'
                : 'Add a registered phone number from our store to start chatting.'}
            </p>
            <button
              onClick={onOpenNewContact}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#00a884]/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBn ? 'নম্বর দিয়ে চ্যাট শুরু করুন' : 'Add Contact by Number'}</span>
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = activeChatId === chat.id;
            const partner = getPartnerUser(chat);
            const isOnline = partner?.isOnline;
            const lastMsg =
              chat.lastMessage ||
              [...messages].reverse().find((m) => m.chatId === chat.id);
            const isMyMsg = lastMsg?.senderId === currentUser?.id;

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? isDark
                      ? 'bg-[#2a3942]'
                      : 'bg-[#f0f2f5]'
                    : isDark
                    ? 'hover:bg-[#202c33]'
                    : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Avatar with Online Presence Dot */}
                <div className="relative shrink-0">
                  {chat.type === 'group' ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-800/80 flex items-center justify-center text-white border border-emerald-500/20">
                      <Users className="w-6 h-6 text-emerald-300" />
                    </div>
                  ) : chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold text-lg">
                      {chat.name.charAt(0)}
                    </div>
                  )}

                  {/* Online Presence Indicator */}
                  {chat.type === 'direct' && isOnline && (
                    <span
                      title="অনলাইনে আছেন"
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] rounded-full border-2 border-[#111b21]"
                    />
                  )}
                </div>

                {/* Content details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {chat.name}
                    </h3>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatTime(lastMsg?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Last message preview */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 truncate flex-1 min-w-0">
                      {chat.isTyping ? (
                        <span className="text-[#00a884] font-medium animate-pulse">
                          {isBn ? 'টাইপ করছেন...' : 'typing...'}
                        </span>
                      ) : (
                        <>
                          {isMyMsg && lastMsg && renderStatusIcon(lastMsg.status)}
                          {lastMsg?.mediaType === 'image' && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{isBn ? 'ছবি' : 'Photo'}</span>
                            </span>
                          )}
                          {lastMsg?.mediaType === 'file' && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">{lastMsg.mediaName || (isBn ? 'ডকুমেন্ট' : 'Document')}</span>
                            </span>
                          )}
                          {lastMsg?.mediaType === 'audio' && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{isBn ? 'ভয়েস বার্তা' : 'Voice message'}</span>
                            </span>
                          )}
                          {lastMsg?.text && (
                            <span className="truncate">{lastMsg.text}</span>
                          )}
                          {!lastMsg && (
                            <span className="italic text-gray-500">
                              {isBn ? 'কোনো মেসেজ নেই' : 'No messages yet'}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Unread count & Pin */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {chat.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-gray-400 rotate-45" />
                      )}
                      {(chat.unreadCount || 0) > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-[#00a884] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
