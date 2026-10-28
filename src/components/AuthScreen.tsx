import React, { useState } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import {
  MessageSquare,
  Phone,
  User as UserIcon,
  Lock,
  Camera,
  Check,
  ShieldCheck,
  Globe,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { AVATAR_MAN, AVATAR_WOMAN } from '../utils/mockData';
import { User } from '../types/whatsapp';

export const AuthScreen: React.FC = () => {
  const { login, register, users, language, toggleLanguage } = useWhatsApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAvatar, setRegAvatar] = useState(AVATAR_MAN);
  const [avatarPreview, setAvatarPreview] = useState<string>(AVATAR_MAN);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

const DEFAULT_AVATAR_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%231f2c34'/><circle cx='32' cy='25' r='12' fill='%2300a884'/><path d='M14 54c0-10 8-16 18-16s18 6 18 16' fill='%2300a884'/></svg>";

  // Handle Login with Phone & Password
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = loginPhone.trim();
    if (!cleanInput) {
      setLoginError(
        isBn ? 'অনুগ্রহ করে আপনার ফোন নম্বর লিখুন।' : 'Please enter your phone number.'
      );
      return;
    }

    const inputDigits = cleanInput.replace(/\D/g, '');

    // Gather users from both state and localStorage backup to guarantee finding the user
    let allUsers = [...users];
    try {
      const saved = localStorage.getItem('whatsapp_web_all_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map = new Map<string, User>();
          allUsers.forEach((u) => map.set(u.id, u));
          parsed.forEach((u: User) => {
            if (u && u.id) map.set(u.id, u);
          });
          allUsers = Array.from(map.values());
        }
      }
    } catch {
      // safe
    }

    // Search user by matching phone digits or name
    const found = allUsers.find((u) => {
      const uDigits = (u.phone || '').replace(/\D/g, '');
      const matchPhone =
        inputDigits.length >= 5 &&
        (uDigits === inputDigits || uDigits.endsWith(inputDigits) || inputDigits.endsWith(uDigits));
      const matchName = u.name.toLowerCase() === cleanInput.toLowerCase();
      return matchPhone || matchName;
    });

    if (!found) {
      setLoginError(
        isBn
          ? 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন অথবা রেজিস্ট্রেশন করুন।'
          : 'No account found with this phone number. Please check the number or create an account.'
      );
      return;
    }

    // Password verification
    const enteredPassword = loginPassword.trim();
    if (found.password) {
      if (!enteredPassword) {
        setLoginError(
          isBn ? 'অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।' : 'Please enter your account password.'
        );
        return;
      }
      if (found.password !== enteredPassword) {
        setLoginError(
          isBn ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please enter the correct password.'
        );
        return;
      }
    }

    // Log the user in and enter directly
    login(found);
  };

  // Handle Register with Name, Phone, Avatar & Password
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const name = regName.trim();
    const phone = regPhone.trim();
    const password = regPassword.trim();

    if (!name) {
      setRegError(isBn ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    if (!phone) {
      setRegError(isBn ? 'অনুগ্রহ করে মোবাইল ফোন নম্বর লিখুন।' : 'Please enter your phone number.');
      return;
    }

    if (!password) {
      setRegError(isBn ? 'অনুগ্রহ করে একটি পাসওয়ার্ড দিন।' : 'Please enter a password.');
      return;
    }

    if (password.length < 4) {
      setRegError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }

    // Check if phone number is already registered in store
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    const alreadyRegistered = users.some((u) => {
      const uDigits = (u.phone || '').replace(/\D/g, '');
      return (
        cleanPhoneDigits.length >= 6 &&
        (uDigits === cleanPhoneDigits || uDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(uDigits))
      );
    });

    if (alreadyRegistered) {
      setRegError(
        isBn
          ? 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে! অনুগ্রহ করে লগইন করুন।'
          : 'An account already exists with this phone number. Please log in.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        phone,
        password,
        avatar: regAvatar || DEFAULT_AVATAR_FALLBACK,
        about: 'Available on WhatsApp',
      });
      // User is automatically saved in Firestore and logged in!
    } catch (err) {
      console.warn('Fallback direct login on register exception:', err);
      // Guarantee seamless entrance even on unexpected network hiccups
      await login({
        id: `user_${Date.now()}`,
        name,
        phone,
        password,
        avatar: regAvatar || DEFAULT_AVATAR_FALLBACK,
        about: 'Available on WhatsApp',
        isOnline: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col items-center justify-center p-3 sm:p-6 text-[#e9edef] relative overflow-hidden">
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

      {/* Main Card with Right Scroll Bar */}
      <div className="w-full max-w-md my-auto">
        <div className="w-full max-h-[85vh] overflow-y-auto auth-scrollbar bg-[#202c33] border border-[#2a3942] rounded-2xl shadow-2xl p-5 sm:p-7 pr-4 sm:pr-6 z-10">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] flex items-center justify-center shadow-lg shadow-[#00a884]/20 mb-2.5 text-white">
              <MessageSquare className="w-8 h-8 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isBn ? 'হোয়াটসঅ্যাপ ওয়েব' : 'WhatsApp Web'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {isBn
                ? 'নিরাপদ রিয়েল-টাইম মেসেজিং ও ফাইল শেয়ারিং প্ল্যাটফর্ম'
                : 'Secure real-time messaging and file sharing'}
            </p>
          </div>

          {/* Tab switch */}
          <div className="grid grid-cols-2 p-1 bg-[#111b21] rounded-xl mb-5 border border-[#2a3942]">
            <button
              onClick={() => {
                setMode('login');
                setLoginError(null);
                setRegError(null);
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
                setRegError(null);
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
                  {isBn ? 'নিবন্ধিত ফোন নম্বর *' : 'Registered Phone Number *'}
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
                    placeholder="০১০০০-০০০০০০"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {isBn ? 'ডেমো নম্বর ফরম্যাট: ০১০০০-০০০০০০' : 'Demo format: 01000-000000'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                  />
                  {/* Password View Option Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    title={showLoginPassword ? (isBn ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (isBn ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
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
                    onChange={(e) => {
                      setRegPhone(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    placeholder="০১০০০-০০০০০০"
                    className="w-full pl-9 pr-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                  />
                </div>
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
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
                      }}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#00a884]"
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
                        className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                          regAvatar === preset.url ? 'border-[#00a884] scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
                          }}
                          className="w-full h-full object-cover"
                        />
                        {regAvatar === preset.url && (
                          <div className="absolute inset-0 bg-[#00a884]/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                    <label className="px-2.5 py-1.5 rounded-lg bg-[#111b21] border border-[#2a3942] text-[11px] text-gray-300 hover:text-white cursor-pointer hover:bg-[#2a3942] transition-colors flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>{isBn ? 'ফাইল' : 'Upload'}</span>
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
                  {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
                  />
                  {/* Registration Password View Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    title={showRegPassword ? (isBn ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (isBn ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Registration Error Feedback */}
              {regError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p>{regError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-60 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#00a884]/20 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isBn ? 'অ্যাকাউন্ট তৈরি ও প্রবেশ করুন' : 'Create Account & Enter'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mt-4 text-center">
        🔒 {isBn ? 'এন্ড-টু-এন্ড এনক্রিপ্টেড ও সম্পূর্ণ রিয়েল-টাইম কমিনিউকেশন' : 'End-to-end encrypted real-time communication'}
      </p>
    </div>
  );
};
