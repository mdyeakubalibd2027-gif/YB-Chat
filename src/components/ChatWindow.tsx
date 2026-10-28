import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Play,
  Pause,
  Trash2,
  X,
  Users,
  Image as ImageIcon,
  Heart,
  ThumbsUp,
  SmilePlus,
} from 'lucide-react';
import { Message, MessageStatus } from '../types/whatsapp';

export const ChatWindow: React.FC = () => {
  const {
    activeChat,
    setActiveChatId,
    currentUser,
    users,
    messages,
    sendMessage,
    startCall,
    reactToMessage,
    deleteMessage,
    theme,
    language,
  } = useWhatsApp();

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Hover reaction popup
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  // Get recipient info if direct
  const partnerUser = useMemo(() => {
    if (!activeChat || activeChat.type === 'group') return null;
    const partnerId = activeChat.participants.find((p) => p !== currentUser?.id);
    return users.find((u) => u.id === partnerId) || null;
  }, [activeChat, currentUser, users]);

  // Messages for active chat (deduplicated by message ID)
  const chatMessages = useMemo(() => {
    if (!activeChat) return [];
    const uniqueMap = new Map<string, Message>();
    messages
      .filter((m) => m && m.chatId === activeChat.id)
      .forEach((m) => {
        if (m.id && !uniqueMap.has(m.id)) {
          uniqueMap.set(m.id, m);
        }
      });
    let list = Array.from(uniqueMap.values());
    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      list = list.filter((m) => m.text?.toLowerCase().includes(q));
    }
    return list;
  }, [messages, activeChat, chatSearchQuery]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendTextMessage = () => {
    if (!inputText.trim() || !activeChat) return;
    sendMessage({
      chatId: activeChat.id,
      text: inputText.trim(),
      mediaType: 'text',
    });
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage();
    }
  };

  // Image attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        sendMessage({
          chatId: activeChat.id,
          mediaType: 'image',
          mediaUrl: reader.result,
          text: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  // Document attachment
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    sendMessage({
      chatId: activeChat.id,
      mediaType: 'file',
      mediaName: file.name,
      mediaSize: `${sizeMb} MB`,
      text: file.name,
    });
    setShowAttachMenu(false);
  };

  // Send voice note
  const handleFinishVoiceRecording = () => {
    if (!activeChat) return;
    const duration = recordingSeconds || 3;
    sendMessage({
      chatId: activeChat.id,
      mediaType: 'audio',
      audioDuration: duration,
      text: isBn ? `ভয়েস বার্তা (${duration}s)` : `Voice message (${duration}s)`,
    });
    setIsRecording(false);
  };

  const cancelVoiceRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const renderStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />;
      default:
        return null;
    }
  };

  // If no chat is selected (desktop empty state)
  if (!activeChat) {
    return (
      <div
        className={`hidden md:flex flex-col items-center justify-center flex-1 h-full select-none text-center p-8 border-b-4 border-[#00a884] ${
          isDark ? 'bg-[#222e35] text-[#8696a0]' : 'bg-[#f0f2f5] text-gray-500'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-[#00a884]/20 flex items-center justify-center text-[#00a884] mb-4">
          <Smile className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isBn ? 'হোয়াটসঅ্যাপ ওয়েব' : 'WhatsApp Web'}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-gray-400">
          {isBn
            ? 'যেকোনো কন্টাক্ট বা গ্রুপ নির্বাচন করে চ্যাটিং, ভয়েস মেসেজ ও ফাইল আদান-প্রদান শুরু করুন।'
            : 'Select a contact or group to send messages, voice notes and share files.'}
        </p>
        <div className="flex items-center gap-2 mt-6 text-xs text-emerald-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isBn ? 'এন্ড-টু-এন্ড এনক্রিপ্টেড' : 'End-to-end encrypted'}</span>
        </div>
      </div>
    );
  }

  const commonEmojis = ['❤️', '👍', '😂', '🔥', '🙏', '🎉', '😊', '👌', '☕', '🇧🇩'];

  return (
    <div className="flex flex-col h-full flex-1 min-w-0 relative select-none">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        onChange={handleDocUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div
        className={`px-3 md:px-4 py-2.5 flex items-center justify-between border-b shrink-0 z-20 ${
          isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={() => setActiveChatId(null)}
            className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            {activeChat.type === 'group' ? (
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white">
                <Users className="w-5 h-5 text-emerald-300" />
              </div>
            ) : activeChat.avatar ? (
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold">
                {activeChat.name.charAt(0)}
              </div>
            )}

            {/* Online presence dot */}
            {activeChat.type === 'direct' && partnerUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
            )}
          </div>

          {/* Name & Presence */}
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-semibold text-white truncate">
              {activeChat.name}
            </h2>
            <p className="text-xs text-gray-400 truncate">
              {activeChat.isTyping ? (
                <span className="text-[#00a884] font-medium animate-pulse">
                  {isBn ? 'টাইপ করছেন...' : 'typing...'}
                </span>
              ) : activeChat.type === 'group' ? (
                activeChat.description || (isBn ? 'গ্রুপ চ্যাট' : 'Group chat')
              ) : partnerUser?.isOnline ? (
                <span className="text-[#00a884] font-medium">
                  {isBn ? 'অনলাইনে আছেন' : 'Online'}
                </span>
              ) : (
                partnerUser?.lastSeen || (isBn ? 'অফলাইন' : 'Offline')
              )}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
          <button
            onClick={() => startCall(activeChat.id, 'video')}
            title={isBn ? 'ভিডিও কল' : 'Video call'}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
          >
            <Video className="w-5 h-5 text-emerald-400" />
          </button>
          <button
            onClick={() => startCall(activeChat.id, 'audio')}
            title={isBn ? 'ভয়েস কল' : 'Voice call'}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5 text-[#00a884]" />
          </button>
          <button
            onClick={() => setShowSearchInChat((prev) => !prev)}
            title={isBn ? 'মেসেজ খুঁজুন' : 'Search messages'}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* In-chat search bar */}
      {showSearchInChat && (
        <div className="px-4 py-2 bg-[#182229] border-b border-[#2a3942] flex items-center gap-2 animate-in slide-in-from-top-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder={isBn ? 'এই চ্যাটে মেসেজ খুঁজুন...' : 'Search in this chat...'}
            className="w-full bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={() => {
              setChatSearchQuery('');
              setShowSearchInChat(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Feed Area with WhatsApp Doodle pattern */}
      <div
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 relative ${
          isDark
            ? 'bg-[#0b141a] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]'
            : 'bg-[#efeae2]'
        }`}
      >
        {/* Security Notice */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229]/80 backdrop-blur-sm border border-[#2a3942] px-3 py-1.5 rounded-lg text-center max-w-sm text-[11px] text-[#ffd279] shadow-sm">
            🔒 {isBn ? 'মেসেজ এবং কল এন্ড-টু-এন্ড এনক্রিপ্টেড।' : 'Messages and calls are end-to-end encrypted.'}
          </div>
        </div>

        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="relative max-w-[85%] sm:max-w-[70%]">
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-3.5 py-2 shadow-sm text-sm relative break-words ${
                    isMe
                      ? isDark
                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                        : 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                      : isDark
                      ? 'bg-[#202c33] text-white rounded-tl-none'
                      : 'bg-white text-gray-900 rounded-tl-none'
                  }`}
                >
                  {/* Sender Name in Group Chat */}
                  {!isMe && activeChat.type === 'group' && (
                    <p className="text-[11px] font-bold text-emerald-400 mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Image Attachment */}
                  {msg.mediaType === 'image' && msg.mediaUrl && (
                    <div className="mb-1.5 rounded-xl overflow-hidden cursor-pointer">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared media"
                        referrerPolicy="no-referrer"
                        onClick={() => setPreviewMediaUrl(msg.mediaUrl!)}
                        className="w-full max-h-72 object-cover hover:scale-[1.01] transition-transform rounded-xl"
                      />
                    </div>
                  )}

                  {/* Document / File Attachment */}
                  {msg.mediaType === 'file' && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 mb-1.5 border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {msg.mediaName || 'Document.pdf'}
                        </p>
                        <p className="text-[10px] text-gray-300">{msg.mediaSize || '1.2 MB'}</p>
                      </div>
                      <a
                        href={msg.mediaUrl || '#'}
                        download={msg.mediaName || 'file'}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Voice Note Player */}
                  {msg.mediaType === 'audio' && (
                    <div className="flex items-center gap-3 py-1 min-w-[200px]">
                      <button
                        onClick={() =>
                          setPlayingAudioId((prev) => (prev === msg.id ? null : msg.id))
                        }
                        className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform"
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      {/* Waveform bars */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 35, 75, 85].map(
                          (h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h}%` }}
                              className={`w-1 rounded-full transition-colors ${
                                playingAudioId === msg.id
                                  ? 'bg-[#00a884] animate-pulse'
                                  : 'bg-white/50'
                              }`}
                            />
                          )
                        )}
                      </div>

                      <span className="text-[11px] text-gray-300 tabular-nums">
                        {msg.audioDuration ? `0:${msg.audioDuration < 10 ? '0' : ''}${msg.audioDuration}` : '0:05'}
                      </span>
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.text && (
                    <p className="whitespace-pre-wrap leading-relaxed pr-16">{msg.text}</p>
                  )}

                  {/* Meta: Timestamp and Delivery Ticks */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none">
                    <span className="text-[10px] text-gray-300/80">{formattedTime}</span>
                    {isMe && renderStatusIcon(msg.status)}
                  </div>
                </div>

                {/* Reaction Badge on message */}
                {msg.reaction && (
                  <div className="absolute -bottom-2 right-2 bg-[#202c33] border border-[#2a3942] rounded-full px-1.5 py-0.5 text-xs shadow-md">
                    {msg.reaction}
                  </div>
                )}

                {/* Hover Quick Actions (Reactions & Delete) */}
                {hoveredMessageId === msg.id && (
                  <div
                    className={`absolute -top-7 ${
                      isMe ? 'right-0' : 'left-0'
                    } flex items-center gap-1 p-1 bg-[#202c33] border border-[#2a3942] rounded-xl shadow-lg z-10 animate-in fade-in duration-150`}
                  >
                    <button
                      onClick={() => reactToMessage(msg.id, '❤️')}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => reactToMessage(msg.id, '👍')}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => reactToMessage(msg.id, '😂')}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      😂
                    </button>
                    {isMe && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 text-red-400 hover:text-red-300 ml-1"
                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Inspection Full Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <button
            onClick={() => setPreviewMediaUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewMediaUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-3 sm:left-6 z-30 p-3 bg-[#202c33] border border-[#2a3942] rounded-2xl shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a3942]">
            <span className="text-xs font-semibold text-gray-300">
              {isBn ? 'ইমোজি বা প্রতিক্রিয়া' : 'Emojis'}
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xl">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputText((prev) => prev + emoji)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Menu Popover */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 z-30 p-2 bg-[#202c33] border border-[#2a3942] rounded-2xl shadow-2xl flex flex-col gap-1 w-48 animate-in zoom-in-95">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left text-xs text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00a884] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>{isBn ? 'ছবি ও ভিডিও' : 'Photos & Videos'}</span>
          </button>

          <button
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left text-xs text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span>{isBn ? 'ডকুমেন্ট ও ফাইল' : 'Documents & Files'}</span>
          </button>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div
        className={`px-3 md:px-4 py-2.5 flex items-center gap-2 border-t shrink-0 z-20 ${
          isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-gray-200'
        }`}
      >
        {isRecording ? (
          /* Live Voice Recording Bar */
          <div className="flex-1 flex items-center justify-between bg-[#111b21] px-4 py-2 rounded-xl border border-red-500/30 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold text-red-400">
                {isBn ? 'ভয়েস রেকর্ড হচ্ছে...' : 'Recording voice...'}
              </span>
              <span className="text-xs text-white font-mono tabular-nums">
                0:{recordingSeconds < 10 ? '0' : ''}
                {recordingSeconds}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelVoiceRecording}
                title={isBn ? 'বাতিল' : 'Cancel'}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleFinishVoiceRecording}
                title={isBn ? 'ভয়েস পাঠান' : 'Send voice'}
                className="p-2 rounded-xl bg-[#00a884] text-white hover:bg-[#02906f] transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Bar */
          <>
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title={isBn ? 'ইমোজি' : 'Emoji'}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAttachMenu((prev) => !prev)}
              title={isBn ? 'ফাইল বা ছবি যুক্ত করুন' : 'Attach file'}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isBn ? 'মেসেজ টাইপ করুন...' : 'Type a message...'}
                className={`w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#2a3942] border-transparent focus:border-[#00a884]'
                    : 'bg-white border-gray-300 focus:border-[#00a884]'
                }`}
              />
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSendTextMessage}
                title={isBn ? 'মেসেজ পাঠান' : 'Send'}
                className="p-2.5 rounded-xl bg-[#00a884] text-white hover:bg-[#02906f] active:scale-95 transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsRecording(true)}
                title={isBn ? 'ভয়েস মেসেজ রেকর্ড করুন' : 'Record voice message'}
                className="p-2.5 rounded-xl bg-[#00a884]/20 text-[#00a884] hover:bg-[#00a884] hover:text-white transition-all shadow-sm shrink-0"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
