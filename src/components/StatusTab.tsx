import React, { useState, useRef } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { Plus, Camera, Edit3, X, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import { UserStory } from '../types/whatsapp';
import { StoryViewerModal } from './StoryViewerModal';

export const StatusTab: React.FC = () => {
  const { currentUser, stories, myStory, postStory, theme, language } = useWhatsApp();
  const [activeViewingStory, setActiveViewingStory] = useState<UserStory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'text' | 'image'>('text');

  // Text story states
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState('#075e54');

  // Image story states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const bgColors = [
    '#075e54', // WhatsApp Teal
    '#128c7e', // WhatsApp Emerald
    '#0f3460', // Deep Royal Blue
    '#4a154b', // Slack Aubergine / Purple
    '#7b1113', // Rich Crimson
    '#212529', // Onyx Dark
  ];

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
          setCreateMode('image');
          setShowCreateModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = () => {
    if (createMode === 'text' && textContent.trim()) {
      postStory({
        type: 'text',
        content: textContent.trim(),
        backgroundColor: selectedBg,
      });
    } else if (createMode === 'image' && imagePreview) {
      postStory({
        type: 'image',
        content: imagePreview,
        caption: imageCaption.trim(),
      });
    }

    setTextContent('');
    setImagePreview(null);
    setImageCaption('');
    setShowCreateModal(false);
  };

  const otherStories = stories.filter((s) => s.userId !== currentUser?.id);

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-y-auto ${
        isDark ? 'bg-[#111b21] text-white' : 'bg-white text-gray-900'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />

      {/* Top Header */}
      <div
        className={`px-4 py-4 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-gray-200'
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight">
          {isBn ? 'স্ট্যাটাস' : 'Status'}
        </h2>
        <div className="flex items-center gap-2">
          {/* Create Text Status Button */}
          <button
            onClick={() => {
              setCreateMode('text');
              setShowCreateModal(true);
            }}
            title={isBn ? 'টেক্সট স্ট্যাটাস লিখুন' : 'Text Status'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Create Photo Status Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title={isBn ? 'ছবি স্ট্যাটাস দিন' : 'Photo Status'}
            className="p-2 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-6">
        {/* My Status Section */}
        <div>
          <div
            onClick={() => {
              if (myStory && myStory.stories.length > 0) {
                setActiveViewingStory(myStory);
              } else {
                setCreateMode('text');
                setShowCreateModal(true);
              }
            }}
            className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors ${
              isDark ? 'hover:bg-[#202c33]' : 'hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <img
                src={currentUser?.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className={`w-14 h-14 rounded-full object-cover ${
                  myStory && myStory.stories.length > 0
                    ? 'ring-2 ring-[#00a884] ring-offset-2 ring-offset-[#111b21]'
                    : ''
                }`}
              />
              {(!myStory || myStory.stories.length === 0) && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00a884] text-white flex items-center justify-center border-2 border-[#111b21]">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {isBn ? 'আমার স্ট্যাটাস' : 'My Status'}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {myStory && myStory.stories.length > 0
                  ? isBn
                    ? `${myStory.stories.length}টি আপডেট আছে · দেখতে ট্যাপ করুন`
                    : `${myStory.stories.length} updates · Tap to view`
                  : isBn
                  ? 'স্ট্যাটাস আপডেট যোগ করতে ট্যাপ করুন'
                  : 'Tap to add status update'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Updates Header */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            {isBn ? 'সাম্প্রতিক স্ট্যাটাস আপডেট' : 'Recent Updates'}
          </p>

          {otherStories.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#202c33]/50 border border-[#2a3942]">
              <Sparkles className="w-8 h-8 text-[#00a884] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-medium text-gray-300">
                {isBn ? 'এখনও কোনো কন্টাক্ট স্ট্যাটাস দেননি' : 'No recent updates from contacts'}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {isBn
                  ? 'আপনার কন্টাক্টরা ছবি বা টেক্সট স্ট্যাটাস দিলে তা এখানে ২৪ ঘণ্টার জন্য দেখতে পারবেন।'
                  : 'Status updates shared by your contacts will appear here for 24 hours.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {otherStories.map((story) => {
                const latestStoryTime = new Date(story.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={story.userId}
                    onClick={() => setActiveViewingStory(story)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-[#202c33]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={story.userAvatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-full object-cover ring-2 ring-[#00a884] ring-offset-2 ring-offset-[#111b21]"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate text-white">
                        {story.userName}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {isBn ? `আজ ${latestStoryTime}` : `Today at ${latestStoryTime}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeViewingStory && (
        <StoryViewerModal
          userStory={activeViewingStory}
          onClose={() => setActiveViewingStory(null)}
          onNextUserStory={() => {
            const nextIdx = otherStories.findIndex((s) => s.userId === activeViewingStory.userId) + 1;
            if (nextIdx < otherStories.length) {
              setActiveViewingStory(otherStories[nextIdx]);
            } else {
              setActiveViewingStory(null);
            }
          }}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#202c33] border border-[#2a3942] rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3942] mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {createMode === 'text'
                  ? isBn
                    ? 'টেক্সট স্ট্যাটাস তৈরি করুন'
                    : 'Create Text Status'
                  : isBn
                  ? 'ছবি স্ট্যাটাস শেয়ার করুন'
                  : 'Share Photo Status'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createMode === 'text' ? (
              <div className="space-y-4">
                {/* Live Preview canvas */}
                <div
                  style={{ backgroundColor: selectedBg }}
                  className="w-full h-56 rounded-xl flex items-center justify-center p-6 text-center text-white transition-colors"
                >
                  <p className="text-xl font-bold leading-relaxed whitespace-pre-wrap">
                    {textContent || (isBn ? 'এখানে আপনার কথা লিখুন...' : 'Type your status here...')}
                  </p>
                </div>

                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={isBn ? 'আপনার স্ট্যাটাসে কী লিখবেন?' : 'What is on your mind?'}
                  rows={3}
                  className="w-full p-3 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
                />

                {/* Color Palette Selector */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    {isBn ? 'ব্যাকগ্রাউন্ড কালার নির্বাচন করুন:' : 'Choose Background Color:'}
                  </p>
                  <div className="flex items-center gap-2">
                    {bgColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedBg(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          selectedBg === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {imagePreview && (
                  <div className="rounded-xl overflow-hidden max-h-64 flex items-center justify-center bg-black">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-64 object-contain"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder={isBn ? 'ক্যাপশন লিখুন (ঐচ্ছিক)...' : 'Add a caption...'}
                  className="w-full px-3 py-2 bg-[#111b21] border border-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884]"
                />
              </div>
            )}

            <button
              onClick={handlePublishStory}
              disabled={createMode === 'text' ? !textContent.trim() : !imagePreview}
              className="w-full mt-4 py-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isBn ? 'স্ট্যাটাস পোস্ট করুন' : 'Post Status'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
