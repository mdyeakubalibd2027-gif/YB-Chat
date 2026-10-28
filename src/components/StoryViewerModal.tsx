import React, { useState, useEffect, useRef } from 'react';
import { UserStory, StoryItem } from '../types/whatsapp';
import { X, ChevronLeft, ChevronRight, Send, Heart, Pause, Play } from 'lucide-react';
import { useWhatsApp } from '../context/WhatsAppContext';

interface StoryViewerModalProps {
  userStory: UserStory;
  onClose: () => void;
  onNextUserStory?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  userStory,
  onClose,
  onNextUserStory,
}) => {
  const { sendMessage, chats, currentUser, language } = useWhatsApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentItem: StoryItem | undefined = userStory.stories[currentIndex];
  const STORY_DURATION_MS = 5000;
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const isBn = language === 'bn';

  // Handle progression timer
  useEffect(() => {
    setProgress(0);
    lastTickRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setProgress((prev) => {
        const next = prev + (delta / STORY_DURATION_MS) * 100;
        if (next >= 100) {
          if (currentIndex < userStory.stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Done with this user's stories
            if (onNextUserStory) {
              onNextUserStory();
            } else {
              onClose();
            }
            return 100;
          }
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, userStory, onClose, onNextUserStory]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < userStory.stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      if (onNextUserStory) {
        onNextUserStory();
      } else {
        onClose();
      }
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Find direct chat with this user
    const directChat = chats.find(
      (c) => c.type === 'direct' && c.participants.includes(userStory.userId)
    );

    if (directChat) {
      sendMessage({
        chatId: directChat.id,
        text: `[স্ট্যাটাস রিপ্লাই]: ${replyText.trim()}`,
      });
    }

    setReplyText('');
    onClose();
  };

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-2 sm:p-4 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md h-full max-h-[820px] bg-[#111b21] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
        {/* Top Progress Segment Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {userStory.stories.map((story, idx) => {
            let widthPercent = 0;
            if (idx < currentIndex) widthPercent = 100;
            else if (idx === currentIndex) widthPercent = progress;

            return (
              <div
                key={story.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* User Header */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5">
            <img
              src={userStory.userAvatar}
              alt=""
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
            />
            <div>
              <p className="text-sm font-bold truncate leading-tight">
                {userStory.userName}
              </p>
              <p className="text-[11px] text-white/80">
                {new Date(currentItem.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused((p) => !p);
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Story Content Canvas */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {currentItem.type === 'image' ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <img
                src={currentItem.content}
                alt="Story"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              {currentItem.caption && (
                <div className="absolute bottom-16 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl text-center text-sm font-medium text-white">
                  {currentItem.caption}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ backgroundColor: currentItem.backgroundColor || '#075e54' }}
              className="w-full h-full flex items-center justify-center p-8 text-center text-white"
            >
              <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap max-w-xs drop-shadow-md">
                {currentItem.content}
              </p>
            </div>
          )}

          {/* Left / Right Tap Navigation Triggers */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-opacity opacity-0 hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-opacity opacity-0 hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Status Reply Box (only for other users) */}
        {userStory.userId !== currentUser?.id && (
          <div className="p-3 bg-[#111b21] border-t border-white/10 z-30">
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isBn ? 'রিপ্লাই পাঠান...' : 'Reply to status...'}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00a884]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#00a884] text-white hover:bg-[#02906f]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
