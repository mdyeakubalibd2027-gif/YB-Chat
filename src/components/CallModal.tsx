import React from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';

export const CallModal: React.FC = () => {
  const { callState, endCall, toggleCallMute, toggleCallCamera, language } = useWhatsApp();

  if (!callState || !callState.active) return null;

  const isBn = language === 'bn';
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111b21] flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-8 text-center">
        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          {callState.type === 'video'
            ? isBn
              ? 'হোয়াটসঅ্যাপ ভিডিও কল'
              : 'WhatsApp Video Call'
            : isBn
            ? 'হোয়াটসঅ্যাপ অডিও কল'
            : 'WhatsApp Voice Call'}
        </span>
        <h2 className="text-2xl font-bold text-white mb-1">
          {callState.partnerName}
        </h2>
        <p className="text-sm text-gray-400">
          {callState.status === 'calling'
            ? isBn
              ? 'রিং হচ্ছে...'
              : 'Ringing...'
            : formatDuration(callState.duration)}
        </p>
      </div>

      {/* Center Visual */}
      <div className="relative flex items-center justify-center my-auto">
        {callState.type === 'video' && !callState.isCameraOff ? (
          <div className="w-72 h-96 sm:w-80 sm:h-[450px] bg-[#202c33] rounded-3xl overflow-hidden relative border-2 border-emerald-500/40 shadow-2xl flex items-center justify-center">
            {callState.partnerAvatar ? (
              <img
                src={callState.partnerAvatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-20 h-20 text-gray-500" />
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs text-white">
              {callState.partnerName}
            </div>
          </div>
        ) : (
          <div className="relative">
            {callState.status === 'calling' && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            )}
            <img
              src={callState.partnerAvatar}
              alt=""
              referrerPolicy="no-referrer"
              className="w-36 h-36 rounded-full object-cover border-4 border-emerald-500/60 shadow-2xl relative z-10"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center gap-6 mb-8">
        {/* Mute Button */}
        <button
          onClick={toggleCallMute}
          className={`p-4 rounded-full transition-colors ${
            callState.isMuted
              ? 'bg-white text-gray-900'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleCallCamera}
          className={`p-4 rounded-full transition-colors ${
            callState.isCameraOff
              ? 'bg-white text-gray-900'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {callState.isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
