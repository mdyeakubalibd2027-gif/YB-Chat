import React, { useState } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { MessageSquare, Phone, User as UserIcon, Lock, Camera, Check, ShieldCheck, Globe, AlertCircle } from 'lucide-react';
import { AVATAR_MAN, AVATAR_WOMAN } from '../utils/mockData';

export const AuthScreen: React.FC = () => {
  const { login, register, users, language, toggleLanguage } = useWhatsApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAbout, setRegAbout] = useState('Hey there! I am using WhatsApp.');
  const [regAvatar, setRegAvatar] = useState(AVATAR_MAN);
  const [regPassword, setRegPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>(AVATAR_MAN);

  // Avatar presets
  const avatarPresets = [
    { label: 'Avatar 1', url: AVATAR_MAN },
    { label: 'Avatar 2', url: AVATAR_WOMAN },
  ];

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRegAvatar(reader.result);
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = loginPhone.trim();
    if (!cleanInput) {
      setLoginError(
        isBn ? 'অনুগ্রহ করে আপনার ফোন নম্বর বা নাম লিখুন।' : 'Please enter your phone number or name.'
      );
      return;
    }

    const inputDigits = cleanInput.replace(/\D/g, '');

    const found = users.find((u) => {
      const uDigits = u.phone.replace(/\D/g, '');
      const matchPhone =
        inputDigits.length >= 5 &&
        (uDigits === inputDigits || uDigits.endsWith(inputDigits) || inputDigits.endsWith(uDigits));
      const matchName = u.name.toLowerCase().includes(cleanInput.toLowerCase());
      return matchPhone || matchName;
    });

    if (found) {
      login(found);
    } else {
      setLoginError(
        isBn
          ? 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।'
          : 'No account found with this phone number. Please check the number or create an account.'
      );
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    register({
      name: regName.trim(),
      phone: regPhone.trim() || `+880 17${Math.floor(10000000 + Math.random() * 90000000)}`,
      avatar: regAvatar,
      about: regAbout.trim() || 'Available on WhatsApp',
    });
  };

  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col items-center justify-center p-4 sm:p-6 text-[#e9edef] relative overflow-hidden">
      {/* Background WhatsApp Emerald Glow */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-[#00a884] opacity-20 blur-3xl pointer-events-none" />

      {/* Language switcher button */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs text-gray-300 hover:text-white hover:bg-[#2a3942] transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isBn ? 'English' : 'বাংলা'}</span>
      </button>

      <div className="w-full max-w-md bg-[#202c33] border border-[#2a3942] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#00a884] flex items-center justify-center shadow-lg shadow-[#00a884]/20 mb-3 text-white">
            <MessageSquare className="w-9 h-9 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isBn ? 'হোয়াটসঅ্যাপ ওয়েব' : 'WhatsApp Web'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isBn
              ? 'নিরাপদ রিয়েল-টাইম মেসেজিং ও ফাইল শেয়ারিং প্ল্যাটফর্ম'
              : 'Secure real-time messaging and file sharing'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-[#111b21] rounded-xl mb-6 border border-[#2a3942]">
          <button
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#00a884] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isBn ? 'লগইন (Login)' : 'Login'}
          </button>
          <button
            onClick={() => {
              setMode('register');
              setLoginError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#00a884] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isBn ? 'রেজিস্ট্রেশন (Register)' : 'Register'}
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isBn ? 'নিবন্ধিত ফোন নম্বর বা নাম *' : 'Registered Phone or Name *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => {
                    setLoginPhone(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder={isBn ? 'যেমন: +880 1712-345678 বা 01712345678' : '+880 1712-345678'}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isBn ? 'পাসওয়ার্ড / পিন' : 'Password / PIN'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                />
              </div>
            </div>

            {/* Login Error Feedback */}
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p>{loginError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setRegPhone(loginPhone);
                      setLoginError(null);
                    }}
                    className="text-emerald-400 hover:underline mt-1 font-semibold"
                  >
                    {isBn ? 'এখনই নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create an account now'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#00a884] hover:bg-[#02906f] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#00a884]/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'লগইন করুন' : 'Log In'}</span>
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={isBn ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full pl-9 pr-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {isBn ? 'ফোন নম্বর *' : 'Phone Number *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+880 1712-000000"
                  className="w-full pl-9 pr-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {isBn ? 'বায়ো / স্ট্যাটাস' : 'Bio / Status'}
              </label>
              <input
                type="text"
                value={regAbout}
                onChange={(e) => setRegAbout(e.target.value)}
                placeholder={isBn ? 'যেমন: Available / ব্যস্ত আছি' : 'Available'}
                className="w-full px-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isBn ? 'প্রোফাইল ছবি নির্বাচন বা আপলোড' : 'Profile Picture'}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative group shrink-0">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#00a884]"
                  />
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRegAvatar(preset.url);
                        setAvatarPreview(preset.url);
                      }}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                        regAvatar === preset.url ? 'border-[#00a884] scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={preset.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      {regAvatar === preset.url && (
                        <div className="absolute inset-0 bg-[#00a884]/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                  <label className="px-2.5 py-1.5 rounded-lg bg-[#111b21] border border-[#2a3942] text-[11px] text-gray-300 hover:text-white cursor-pointer hover:bg-[#2a3942] transition-colors flex items-center gap-1">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>{isBn ? 'ফাইল বেছে নিন' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#00a884] hover:bg-[#02906f] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#00a884]/20 transition-all flex items-center justify-center gap-2 mt-3"
            >
              <Check className="w-4 h-4" />
              <span>{isBn ? 'অ্যাকাউন্ট তৈরি ও প্রবেশ করুন' : 'Create Account & Enter'}</span>
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-6 text-center">
        🔒 {isBn ? 'এন্ড-টু-এন্ড এনক্রিপ্টেড ও সম্পূর্ণ রিয়েল-টাইম কমিনিউকেশন' : 'End-to-end encrypted real-time communication'}
      </p>
    </div>
  );
};
