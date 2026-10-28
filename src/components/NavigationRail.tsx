import React from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { MessageSquare, CircleDashed, Phone, Settings, Moon, Sun, Volume2, VolumeX, Globe, LogOut, Cloud } from 'lucide-react';

interface NavigationRailProps {
  currentTab: 'chats' | 'status' | 'calls';
  setCurrentTab: (tab: 'chats' | 'status' | 'calls') => void;
  openProfile: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentTab,
  setCurrentTab,
  openProfile,
}) => {
  const {
    currentUser,
    chats,
    stories,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    language,
    toggleLanguage,
    logout,
    isFirebaseConnected,
  } = useWhatsApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const hasUnseenStories = stories.some((s) => s.userId !== currentUser?.id && !s.allViewed);
  const isDark = theme === 'dark';

  return (
    <>
      {/* Desktop Vertical Icon Rail */}
      <aside
        className={`hidden md:flex flex-col items-center justify-between w-16 py-4 border-r shrink-0 z-30 transition-colors ${
          isDark
            ? 'bg-[#202c33] border-[#2a3942] text-[#aebac1]'
            : 'bg-[#f0f2f5] border-gray-200 text-gray-600'
        }`}
      >
        {/* Top Actions: Navigation */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Chats Tab */}
          <button
            onClick={() => setCurrentTab('chats')}
            title={language === 'bn' ? 'চ্যাট' : 'Chats'}
            className={`relative p-3 rounded-xl transition-all ${
              currentTab === 'chats'
                ? isDark
                  ? 'bg-[#374248] text-[#00a884]'
                  : 'bg-gray-200 text-[#00a884]'
                : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[#00a884] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>

          {/* Status Tab */}
          <button
            onClick={() => setCurrentTab('status')}
            title={language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
            className={`relative p-3 rounded-xl transition-all ${
              currentTab === 'status'
                ? isDark
                  ? 'bg-[#374248] text-[#00a884]'
                  : 'bg-gray-200 text-[#00a884]'
                : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-white'
            }`}
          >
            <CircleDashed className="w-5 h-5" />
            {hasUnseenStories && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#00a884] rounded-full ring-2 ring-[#202c33]" />
            )}
          </button>

          {/* Calls Tab */}
          <button
            onClick={() => setCurrentTab('calls')}
            title={language === 'bn' ? 'কল' : 'Calls'}
            className={`relative p-3 rounded-xl transition-all ${
              currentTab === 'calls'
                ? isDark
                  ? 'bg-[#374248] text-[#00a884]'
                  : 'bg-gray-200 text-[#00a884]'
                : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-white'
            }`}
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Utility Controls */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Firebase Cloud Live Sync Indicator */}
          <div
            title={
              isFirebaseConnected
                ? language === 'bn'
                  ? 'Firebase ক্লাউড লাইভ সিঙ্ক সক্রিয়'
                  : 'Firebase Cloud Live Sync Active'
                : language === 'bn'
                ? 'Firebase সংযোগ হচ্ছে...'
                : 'Connecting to Firebase...'
            }
            className="p-2 rounded-xl text-emerald-400 flex items-center justify-center transition-colors"
          >
            <Cloud className={`w-4 h-4 ${isFirebaseConnected ? 'text-emerald-400' : 'text-gray-400 animate-pulse'}`} />
          </div>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            title={language === 'bn' ? 'বাংলা / English' : 'Switch Language'}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#00a884]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings / Profile Drawer */}
          <button
            onClick={openProfile}
            title={language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={openProfile}
            title={currentUser?.name}
            className="relative mt-1 group"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#00a884] group-hover:scale-105 transition-transform"
            />
            {currentUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full ring-2 ring-[#202c33]" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            title={language === 'bn' ? 'লগআউট' : 'Logout'}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile skill) */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 h-16 z-40 flex items-center justify-around border-t backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#202c33]/95 border-[#2a3942] text-[#aebac1]'
            : 'bg-white/95 border-gray-200 text-gray-600'
        }`}
      >
        <button
          onClick={() => setCurrentTab('chats')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            currentTab === 'chats' ? 'text-[#00a884] font-semibold' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-[#00a884] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'চ্যাট' : 'Chats'}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('status')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            currentTab === 'status' ? 'text-[#00a884] font-semibold' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <CircleDashed className="w-5 h-5" />
            {hasUnseenStories && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#00a884] rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('calls')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            currentTab === 'calls' ? 'text-[#00a884] font-semibold' : 'text-gray-400'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'কল' : 'Calls'}
          </span>
        </button>

        <button
          onClick={openProfile}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-gray-400 hover:text-white"
        >
          <img
            src={currentUser?.avatar}
            alt=""
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-full object-cover border border-[#00a884]"
          />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </span>
        </button>
      </nav>
    </>
  );
};
