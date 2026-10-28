import React, { useState } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { X, UserPlus, Phone, Search, AlertCircle, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';
import { User } from '../types/whatsapp';

interface NewContactModalProps {
  onClose: () => void;
}

export const NewContactModal: React.FC<NewContactModalProps> = ({ onClose }) => {
  const { addContactByPhone, users, currentUser, language } = useWhatsApp();
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ user: User; message: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const isBn = language === 'bn';

  // Registered other users in store
  const availableStoreUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleSearchAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    const result = await addContactByPhone(phone.trim());
    setIsSearching(false);

    if (result.success && result.user) {
      setSuccessInfo({
        user: result.user,
        message: result.message,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickSelectNumber = (selectedPhone: string) => {
    setPhone(selectedPhone);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202c33] border border-[#2a3942] rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3942] mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-base font-bold text-white">
              {isBn ? 'নম্বর দিয়ে কন্টাক্ট এড করুন' : 'Add Contact by Number'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearchAndAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {isBn ? 'মোবাইল ফোন নম্বর লিখুন *' : 'Enter Phone Number *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={isBn ? 'যেমন: +880 1823-456789 বা 01823456789' : '+880 1823-456789'}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] transition-colors"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {isBn
                ? '🔒 শুধুমাত্র আমাদের স্টোরে পূর্বে সেভ থাকা নিবন্ধিত নম্বরের সাথে যোগাযোগ করা যাবে।'
                : 'Only registered phone numbers in the store can be added.'}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">
                  {isBn ? 'নম্বরটি স্টোরে পাওয়া যায়নি!' : 'Number Not Found!'}
                </p>
                <p className="text-[11px] text-red-300/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Info Card */}
          {successInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs flex items-center gap-3 animate-in fade-in">
              <img
                src={successInfo.user.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-emerald-400"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{successInfo.user.name}</p>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{successInfo.message}</span>
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!phone.trim() || isSearching}
            className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/20"
          >
            {isSearching ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>
              {isSearching
                ? isBn
                  ? 'স্টোরে খোঁজা হচ্ছে...'
                  : 'Checking store...'
                : isBn
                ? 'নম্বর চেক ও চ্যাট শুরু করুন'
                : 'Verify & Start Chat'}
            </span>
          </button>
        </form>

        {/* Registered Store Numbers helper panel */}
        <div className="mt-5 pt-4 border-t border-[#2a3942]">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            {isBn ? 'স্টোরে সেভ থাকা সক্রিয় নম্বরসমূহ:' : 'Registered Numbers in Store:'}
          </span>

          <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-thin pr-1">
            {availableStoreUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSelectNumber(u.phone)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#111b21]/70 hover:bg-[#111b21] border border-[#2a3942] hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={u.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-400">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">{u.phone}</p>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 shrink-0 flex items-center gap-0.5">
                  <span>{isBn ? 'ব্যবহার করুন' : 'Use'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
