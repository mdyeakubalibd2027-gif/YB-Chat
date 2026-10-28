import React, { useState } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { X, Users, Check, ArrowRight } from 'lucide-react';

interface NewGroupModalProps {
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ onClose }) => {
  const { users, currentUser, createGroup, language } = useWhatsApp();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1); // 1: Select members, 2: Group name

  const isBn = language === 'bn';
  const availableUsers = users.filter((u) => u.id !== currentUser?.id);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    createGroup(groupName.trim(), selectedUserIds, description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202c33] border border-[#2a3942] rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3942] mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-base font-bold text-white">
              {step === 1
                ? isBn
                  ? 'গ্রুপ সদস্য যুক্ত করুন'
                  : 'Add Group Members'
                : isBn
                ? 'নতুন গ্রুপের নাম দিন'
                : 'New Group Name'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <p className="text-xs text-gray-400 mb-3">
              {isBn
                ? `${selectedUserIds.length} জন সদস্য নির্বাচিত হয়েছেন`
                : `${selectedUserIds.length} members selected`}
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
              {availableUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#00a884]/20 border border-[#00a884]/40'
                        : 'hover:bg-[#111b21]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#00a884] border-[#00a884] text-white'
                          : 'border-gray-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedUserIds.length === 0}
              className="w-full mt-5 py-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isBn ? 'পরবর্তী ধাপ' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isBn ? 'গ্রুপের নাম *' : 'Group Name *'}
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={isBn ? 'যেমন: বন্ধুমহল 🇧🇩' : 'e.g. Friends Circle'}
                className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isBn ? 'গ্রুপ বিবরণ (ঐচ্ছিক)' : 'Group Description (Optional)'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={isBn ? 'গ্রুপের উদ্দেশ্য ও নিয়মাবলী...' : 'Group purpose...'}
                className="w-full px-3.5 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-[#111b21] hover:bg-[#2a3942] text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                {isBn ? 'পেছনে যান' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={!groupName.trim()}
                className="flex-1 py-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isBn ? 'গ্রুপ তৈরি করুন' : 'Create Group'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
