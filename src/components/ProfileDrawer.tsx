import React, { useState, useRef } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import {
  X,
  Camera,
  Check,
  Edit2,
  User as UserIcon,
  Phone,
  Info,
  LogOut,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { AVATAR_MAN, AVATAR_WOMAN } from '../utils/mockData';

interface ProfileDrawerProps {
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ onClose }) => {
  const {
    currentUser,
    updateProfile,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    language,
    toggleLanguage,
    logout,
  } = useWhatsApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(currentUser?.name || '');

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutVal, setAboutVal] = useState(currentUser?.about || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBn = language === 'bn';
  const isDark = theme === 'dark';

  const handleSaveName = () => {
    if (nameVal.trim()) {
      updateProfile({ name: nameVal.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveAbout = () => {
    if (aboutVal.trim()) {
      updateProfile({ about: aboutVal.trim() });
    }
    setIsEditingAbout(false);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateProfile({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [AVATAR_MAN, AVATAR_WOMAN];

  const suggestedBios = [
    'Available',
    'ব্যস্ত আছি, শুধুমাত্র জরুরি টেক্সট 📱',
    'At work / অফিসে আছি',
    'Sleeping 😴',
    'Urgent calls only',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200 border-r ${
          isDark
            ? 'bg-[#111b21] border-[#2a3942] text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarFile}
          className="hidden"
        />

        {/* Drawer Header */}
        <div
          className={`px-4 py-4 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#008069] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold tracking-tight">
              {isBn ? 'প্রোফাইল কাস্টমাইজেশন' : 'Profile Settings'}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-3">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                referrerPolicy="no-referrer"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#00a884] shadow-xl"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-7 h-7 text-white mb-1" />
                <span className="text-[10px] text-white font-medium">
                  {isBn ? 'ছবি পরিবর্তন' : 'Change Photo'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400">
                {isBn ? 'ডিফল্ট অবতার:' : 'Presets:'}
              </span>
              {presetAvatars.map((av, idx) => (
                <button
                  key={idx}
                  onClick={() => updateProfile({ avatar: av })}
                  className="w-7 h-7 rounded-full overflow-hidden border border-[#00a884] hover:scale-110 transition-transform"
                >
                  <img src={av} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#00a884] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                {isBn ? 'আপনার নাম' : 'Your Name'}
              </span>
              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-xl bg-[#00a884] text-white hover:bg-[#02906f]"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-semibold">{currentUser?.name}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              {isBn
                ? 'এই নামটি আপনার কন্টাক্ট এবং গ্রুপ সদস্যদের প্রদর্শিত হবে।'
                : 'This name will be visible to your contacts and groups.'}
            </p>
          </div>

          {/* About / Bio Field */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#00a884] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {isBn ? 'সম্পর্কে / বায়ো' : 'About / Bio'}
              </span>
              {!isEditingAbout && (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isEditingAbout ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={aboutVal}
                  onChange={(e) => setAboutVal(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
                />
                <button
                  onClick={handleSaveAbout}
                  className="p-2 rounded-xl bg-[#00a884] text-white hover:bg-[#02906f]"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm">{currentUser?.about}</p>
            )}

            {/* Quick bio suggestion chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestedBios.map((bio, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAboutVal(bio);
                    updateProfile({ about: bio });
                  }}
                  className="px-2 py-1 bg-black/20 hover:bg-black/40 rounded-lg text-[10px] text-gray-300 transition-colors"
                >
                  {bio}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Display */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <span className="text-xs font-semibold text-[#00a884] flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5" />
              {isBn ? 'ফোন নম্বর' : 'Phone Number'}
            </span>
            <p className="text-sm font-semibold">{currentUser?.phone}</p>
          </div>

          {/* Preferences */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{isBn ? 'ডার্ক মোড' : 'Dark Mode'}</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isDark ? 'bg-[#00a884]' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span>{isBn ? 'মেসেজ সাউন্ড' : 'Notification Sounds'}</span>
              </div>
              <button
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-[#00a884]' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'ভাষা (Language)' : 'Language'}</span>
              </div>
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 rounded-lg bg-black/20 text-xs text-white hover:bg-black/40 font-semibold"
              >
                {isBn ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>

          {/* Security & Logout */}
          <div className="pt-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isBn ? 'লগআউট করুন' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
