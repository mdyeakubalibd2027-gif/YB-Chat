import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Chat, Message, UserStory, NotificationToast, MessageStatus } from '../types/whatsapp';
import { INITIAL_USERS, INITIAL_CHATS, INITIAL_MESSAGES, INITIAL_STORIES } from '../utils/mockData';
import { playSentSound, playReceiveSound, playRingtone } from '../utils/audio';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';

export interface CallState {
  active: boolean;
  type: 'audio' | 'video';
  partnerName: string;
  partnerAvatar: string;
  chatId: string;
  status: 'calling' | 'connected' | 'ended';
  duration: number;
  isMuted: boolean;
  isCameraOff: boolean;
}

interface WhatsAppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  messages: Message[];
  activeChat: Chat | null;
  activeChatId: string | null;
  stories: UserStory[];
  myStory: UserStory | null;
  notifications: NotificationToast[];
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  language: 'bn' | 'en';
  callState: CallState | null;
  isFirebaseConnected: boolean;
  login: (user: User) => void;
  register: (data: { name: string; phone: string; email?: string; avatar?: string; about?: string; password?: string }) => Promise<User | void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setActiveChatId: (id: string | null) => void;
  sendMessage: (payload: {
    chatId: string;
    text?: string;
    mediaType?: 'text' | 'image' | 'file' | 'audio';
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: string;
    audioDuration?: number;
  }) => void;
  createGroup: (name: string, memberIds: string[], description?: string) => Promise<string>;
  addContact: (name: string, phone: string, about?: string) => Promise<string>;
  addContactByPhone: (phone: string) => Promise<{ success: boolean; message: string; chatId?: string; user?: User }>;
  postStory: (story: { type: 'text' | 'image'; content: string; caption?: string; backgroundColor?: string }) => void;
  markMessagesAsRead: (chatId: string) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleLanguage: () => void;
  startCall: (chatId: string, type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallCamera: () => void;
  dismissNotification: (id: string) => void;
  reactToMessage: (messageId: string, reaction: string) => void;
  deleteMessage: (messageId: string) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | null>(null);

const LOCAL_STORAGE_KEY = 'whatsapp_user_session';

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user session persisted locally (null by default so Login/Registration is always shown first)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'user_me') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [stories, setStories] = useState<UserStory[]>(INITIAL_STORIES);

  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [callState, setCallState] = useState<CallState | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Sync current user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // safe fallback
    }
  }, [currentUser]);

  // Seed Firestore initial data if collections are empty
  const seedInitialDataToFirestore = useCallback(async () => {
    try {
      // Seed users
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }
      // Seed chats
      for (const c of INITIAL_CHATS) {
        await setDoc(doc(db, 'chats', c.id), c, { merge: true });
      }
      // Seed messages
      for (const m of INITIAL_MESSAGES) {
        await setDoc(doc(db, 'messages', m.id), m, { merge: true });
      }
    } catch (err) {
      console.warn('Initial seed skipped or completed:', err);
    }
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeChats: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeStories: (() => void) | undefined;

    try {
      // 1. Real-time Users
      const usersRef = collection(db, 'users');
      unsubscribeUsers = onSnapshot(
        usersRef,
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const usersMap = new Map<string, User>();
            snapshot.forEach((docSnap) => {
              const u = docSnap.data() as User;
              if (u && u.id) {
                usersMap.set(u.id, u);
              }
            });
            setUsers(Array.from(usersMap.values()));
          } else {
            seedInitialDataToFirestore();
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      );

      // 2. Real-time Chats
      const chatsRef = collection(db, 'chats');
      unsubscribeChats = onSnapshot(
        chatsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const chatsMap = new Map<string, Chat>();
            snapshot.forEach((docSnap) => {
              const c = docSnap.data() as Chat;
              if (c && c.id) {
                chatsMap.set(c.id, c);
              }
            });
            setChats(Array.from(chatsMap.values()));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'chats');
        }
      );

      // 3. Real-time Messages
      const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
      unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const messagesMap = new Map<string, Message>();
            snapshot.forEach((docSnap) => {
              const m = docSnap.data() as Message;
              if (m && m.id) {
                messagesMap.set(m.id, m);
              }
            });
            setMessages(Array.from(messagesMap.values()));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'messages');
        }
      );

      // 4. Real-time Stories
      const storiesRef = collection(db, 'stories');
      unsubscribeStories = onSnapshot(
        storiesRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const rawStories: {
              id: string;
              userId: string;
              userName: string;
              userAvatar: string;
              type: 'text' | 'image';
              content: string;
              caption?: string;
              backgroundColor?: string;
              timestamp: number;
            }[] = [];
            snapshot.forEach((docSnap) => {
              rawStories.push(docSnap.data() as any);
            });

            // Group stories by userId
            const userStoryMap = new Map<string, UserStory>();
            rawStories.forEach((st) => {
              if (!userStoryMap.has(st.userId)) {
                userStoryMap.set(st.userId, {
                  userId: st.userId,
                  userName: st.userName,
                  userAvatar: st.userAvatar,
                  stories: [],
                  updatedAt: st.timestamp,
                  allViewed: false,
                });
              }
              userStoryMap.get(st.userId)!.stories.push({
                id: st.id,
                type: st.type,
                content: st.content,
                caption: st.caption,
                backgroundColor: st.backgroundColor,
                timestamp: st.timestamp,
              });
            });

            setStories(Array.from(userStoryMap.values()));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'stories');
        }
      );
    } catch (err) {
      console.warn('Real-time connection listener notice:', err);
    }

    return () => {
      unsubscribeUsers?.();
      unsubscribeChats?.();
      unsubscribeMessages?.();
      unsubscribeStories?.();
    };
  }, [seedInitialDataToFirestore]);

  // Set active chat and update unread count
  const setActiveChatId = useCallback(
    async (id: string | null) => {
      setActiveChatIdState(id);
      if (id && currentUser) {
        setChats((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );

        // Update messages as read in local state
        setMessages((prev) =>
          prev.map((m) =>
            m.chatId === id && m.senderId !== currentUser.id && m.status !== 'read'
              ? { ...m, status: 'read' as MessageStatus }
              : m
          )
        );

        // Update in Firestore
        try {
          const unreadMsgs = messages.filter(
            (m) => m.chatId === id && m.senderId !== currentUser.id && m.status !== 'read'
          );
          for (const m of unreadMsgs) {
            await updateDoc(doc(db, 'messages', m.id), { status: 'read' });
          }
        } catch {
          // ignore offline
        }
      }
    },
    [currentUser, messages]
  );

  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const myStory = useMemo(() => {
    if (!currentUser) return null;
    return stories.find((s) => s.userId === currentUser.id) || null;
  }, [currentUser, stories]);

  // Notification Toast
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const triggerNotification = useCallback(
    (title: string, body: string, avatar: string, chatId: string) => {
      const toast: NotificationToast = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        body,
        avatar,
        chatId,
      };
      setNotifications((prev) => [toast, ...prev.slice(0, 2)]);
      if (soundEnabled) {
        playReceiveSound();
      }
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== toast.id));
      }, 5000);
    },
    [soundEnabled]
  );

  // Send message with Firestore real-time sync
  const sendMessage = useCallback(
    async (payload: {
      chatId: string;
      text?: string;
      mediaType?: 'text' | 'image' | 'file' | 'audio';
      mediaUrl?: string;
      mediaName?: string;
      mediaSize?: string;
      audioDuration?: number;
    }) => {
      if (!currentUser) return;

      const newMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newMsg: Message = {
        id: newMsgId,
        chatId: payload.chatId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: payload.text,
        mediaType: payload.mediaType || 'text',
        mediaUrl: payload.mediaUrl,
        mediaName: payload.mediaName,
        mediaSize: payload.mediaSize,
        audioDuration: payload.audioDuration,
        timestamp: Date.now(),
        status: 'sent',
      };

      // Optimistic local update
      setMessages((prev) => [...prev, newMsg]);
      if (soundEnabled) {
        playSentSound();
      }

      // Save message to Firestore
      try {
        await setDoc(doc(db, 'messages', newMsgId), newMsg);
        await updateDoc(doc(db, 'chats', payload.chatId), {
          lastMessage: newMsg,
          updatedAt: Date.now(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `messages/${newMsgId}`);
      }

      // Transition delivered
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'messages', newMsgId), { status: 'delivered' });
        } catch {
          // ignore
        }
      }, 600);

      // Transition read
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'messages', newMsgId), { status: 'read' });
        } catch {
          // ignore
        }
      }, 1500);

      // Auto-reply simulation for demo contacts
      const targetChat = chats.find((c) => c.id === payload.chatId);
      if (!targetChat) return;

      let responder: User | undefined;
      if (targetChat.type === 'direct') {
        const partnerId = targetChat.participants.find((p) => p !== currentUser.id);
        responder = users.find((u) => u.id === partnerId);
      } else {
        const others = targetChat.participants.filter((p) => p !== currentUser.id);
        const randomOtherId = others[Math.floor(Math.random() * others.length)];
        responder = users.find((u) => u.id === randomOtherId);
      }

      if (responder) {
        // Typing indicator
        setTimeout(async () => {
          setChats((prev) =>
            prev.map((c) => (c.id === payload.chatId ? { ...c, isTyping: true } : c))
          );
        }, 1000);

        // Reply
        setTimeout(async () => {
          setChats((prev) =>
            prev.map((c) => (c.id === payload.chatId ? { ...c, isTyping: false } : c))
          );

          const repliesBn = [
            'আসসালামু আলাইকুম! মেসেজ পেয়েছি, ধন্যবাদ।',
            'হ্যাঁ, আমি ফাইলটি দেখছি এবং একটু পর জানাচ্ছি 👍',
            'অনেক চমৎকার হয়েছে! চালিয়ে যান।',
            'ঠিক আছে, মিটিংয়ে এই বিষয়টি তুলে ধরা হবে।',
            'ধন্যবাদ! সবকিছু ঠিকঠাক রয়েছে।',
          ];
          const repliesEn = [
            'Got your message, thanks for the update!',
            'Everything looks good from my side 👍',
            'Received, will review this right away.',
          ];

          const replyPool = language === 'bn' ? repliesBn : repliesEn;
          const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];

          const replyId = `msg_reply_${Date.now()}`;
          const replyMsg: Message = {
            id: replyId,
            chatId: payload.chatId,
            senderId: responder!.id,
            senderName: responder!.name,
            text: replyText,
            timestamp: Date.now(),
            status: 'read',
          };

          try {
            await setDoc(doc(db, 'messages', replyId), replyMsg);
            await updateDoc(doc(db, 'chats', payload.chatId), {
              lastMessage: replyMsg,
              updatedAt: Date.now(),
            });
          } catch {
            // fallback local
            setMessages((prev) => [...prev, replyMsg]);
          }

          if (activeChatId !== payload.chatId) {
            triggerNotification(
              targetChat.type === 'group' ? `${targetChat.name} • ${responder!.name}` : responder!.name,
              replyText,
              targetChat.type === 'group' ? (targetChat.avatar || responder!.avatar) : responder!.avatar,
              payload.chatId
            );
          } else if (soundEnabled) {
            playReceiveSound();
          }
        }, 3000);
      }
    },
    [currentUser, chats, users, soundEnabled, language, activeChatId, triggerNotification]
  );

  // Create Group in Firestore
  const createGroup = useCallback(
    async (name: string, memberIds: string[], description?: string) => {
      if (!currentUser) return '';
      const newGroupId = `chat_group_${Date.now()}`;
      const allMembers = Array.from(new Set([currentUser.id, ...memberIds]));

      const initialGroupMsg: Message = {
        id: `msg_grp_init_${Date.now()}`,
        chatId: newGroupId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `গ্রুপ "${name}" তৈরি করা হয়েছে 🎉`,
        timestamp: Date.now(),
        status: 'read',
      };

      const newGroup: Chat = {
        id: newGroupId,
        type: 'group',
        name,
        avatar: '',
        participants: allMembers,
        admins: [currentUser.id],
        description: description || 'নতুন গ্রুপ চ্যাট',
        lastMessage: initialGroupMsg,
        unreadCount: 0,
        isPinned: false,
      };

      // Firestore persistence
      try {
        await setDoc(doc(db, 'chats', newGroupId), newGroup);
        await setDoc(doc(db, 'messages', initialGroupMsg.id), initialGroupMsg);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `chats/${newGroupId}`);
      }

      setChats((prev) => (prev.some((c) => c.id === newGroupId) ? prev : [newGroup, ...prev]));
      setMessages((prev) => (prev.some((m) => m.id === initialGroupMsg.id) ? prev : [...prev, initialGroupMsg]));
      setActiveChatId(newGroupId);

      return newGroupId;
    },
    [currentUser, setActiveChatId]
  );

  // Add Contact in Firestore
  const addContact = useCallback(
    async (name: string, phone: string, about?: string) => {
      if (!currentUser) return '';
      const newUserId = `user_${Date.now()}`;
      const newContact: User = {
        id: newUserId,
        name,
        phone,
        avatar: currentUser.avatar,
        about: about || 'Hey there! I am using WhatsApp.',
        isOnline: true,
      };

      const newChatId = `chat_direct_${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        type: 'direct',
        name,
        avatar: newContact.avatar,
        participants: [currentUser.id, newUserId],
        unreadCount: 0,
        isPinned: false,
      };

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'users', newUserId), newContact);
        await setDoc(doc(db, 'chats', newChatId), newChat);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${newUserId}`);
      }

      setUsers((prev) => (prev.some((u) => u.id === newUserId) ? prev : [...prev, newContact]));
      setChats((prev) => (prev.some((c) => c.id === newChatId) ? prev : [newChat, ...prev]));
      setActiveChatId(newChatId);

      return newChatId;
    },
    [currentUser, setActiveChatId]
  );

  // Add Contact only if phone exists in store / database
  const addContactByPhone = useCallback(
    async (rawPhone: string): Promise<{ success: boolean; message: string; chatId?: string; user?: User }> => {
      if (!currentUser) {
        return { success: false, message: 'লগইন করা নেই।' };
      }

      const cleanTargetDigits = rawPhone.replace(/\D/g, '');
      if (cleanTargetDigits.length < 5) {
        return { success: false, message: 'অনুগ্রহ করে একটি সঠিক ও পূর্ণাঙ্গ মোবাইল নম্বর লিখুন।' };
      }

      // Check if trying to add own number
      const cleanMyDigits = currentUser.phone.replace(/\D/g, '');
      if (
        cleanMyDigits === cleanTargetDigits ||
        cleanMyDigits.endsWith(cleanTargetDigits) ||
        cleanTargetDigits.endsWith(cleanMyDigits)
      ) {
        return { success: false, message: 'এটি আপনার নিজের নম্বর! অন্য কোনো নম্বর যোগ করুন।' };
      }

      // Search in registered users store
      const foundUser = users.find((u) => {
        if (u.id === currentUser.id) return false;
        const uDigits = u.phone.replace(/\D/g, '');
        return (
          uDigits === cleanTargetDigits ||
          uDigits.endsWith(cleanTargetDigits) ||
          cleanTargetDigits.endsWith(uDigits)
        );
      });

      if (!foundUser) {
        return {
          success: false,
          message: 'এই নম্বরটি আমাদের স্টোরে নিবন্ধিত নেই! শুধুমাত্র নিবন্ধিত ব্যবহারকারীদের নম্বর দিয়ে কন্টাক্ট যোগ করা যাবে।',
        };
      }

      // Check if a direct chat with this user already exists
      const existingChat = chats.find(
        (c) =>
          c.type === 'direct' &&
          c.participants.includes(currentUser.id) &&
          c.participants.includes(foundUser.id)
      );

      if (existingChat) {
        setActiveChatId(existingChat.id);
        return {
          success: true,
          message: `${foundUser.name}-এর সাথে চ্যাট আগে থেকেই বিদ্যমান।`,
          chatId: existingChat.id,
          user: foundUser,
        };
      }

      // Create new direct chat
      const newChatId = `chat_direct_${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        type: 'direct',
        name: foundUser.name,
        avatar: foundUser.avatar,
        participants: [currentUser.id, foundUser.id],
        unreadCount: 0,
        isPinned: false,
      };

      try {
        await setDoc(doc(db, 'chats', newChatId), newChat);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `chats/${newChatId}`);
      }

      setChats((prev) => (prev.some((c) => c.id === newChatId) ? prev : [newChat, ...prev]));
      setActiveChatId(newChatId);

      return {
        success: true,
        message: `${foundUser.name} সফলভাবে কন্টাক্ট ও চ্যাটে যুক্ত হয়েছেন!`,
        chatId: newChatId,
        user: foundUser,
      };
    },
    [currentUser, users, chats, setActiveChatId]
  );

  // Post Story in Firestore
  const postStory = useCallback(
    async (storyData: { type: 'text' | 'image'; content: string; caption?: string; backgroundColor?: string }) => {
      if (!currentUser) return;

      const storyId = `story_${Date.now()}`;
      const storyPayload = {
        id: storyId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: storyData.type,
        content: storyData.content,
        caption: storyData.caption || '',
        backgroundColor: storyData.backgroundColor || '#075e54',
        timestamp: Date.now(),
      };

      try {
        await setDoc(doc(db, 'stories', storyId), storyPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `stories/${storyId}`);
      }
    },
    [currentUser]
  );

  // Update Profile in Firestore
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, ...updates, updatedAt: Date.now() };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

      try {
        await setDoc(doc(db, 'users', currentUser.id), updatedUser, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
      }
    },
    [currentUser]
  );

  // Login
  const login = useCallback(
    async (user: User) => {
      const loggedUser = { ...user, isOnline: true, updatedAt: Date.now() };
      setCurrentUser(loggedUser);
      setActiveChatIdState(null);

      try {
        await setDoc(doc(db, 'users', user.id), loggedUser, { merge: true });
      } catch {
        // safe
      }
    },
    []
  );

  // Register in Firestore
  const register = useCallback(
    async (data: { name: string; phone: string; email?: string; avatar?: string; about?: string; password?: string }) => {
      const newUserId = `user_${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        avatar: data.avatar || INITIAL_USERS[0].avatar,
        about: data.about || 'Available on WhatsApp',
        password: data.password || '123456',
        isOnline: true,
      };

      try {
        await setDoc(doc(db, 'users', newUserId), newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${newUserId}`);
      }

      setUsers((prev) => (prev.some((u) => u.id === newUserId) ? prev : [...prev, newUser]));
      setCurrentUser(newUser);
      setActiveChatIdState(null);
      return newUser;
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          isOnline: false,
          lastSeen: 'কিছুক্ষণ আগে',
        });
      } catch {
        // safe
      }
    }
    setCurrentUser(null);
    setActiveChatIdState(null);
  }, [currentUser]);

  // Message Reactions & Delete
  const reactToMessage = useCallback(async (messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, reaction: m.reaction === reaction ? undefined : reaction } : m
      )
    );
    try {
      await updateDoc(doc(db, 'messages', messageId), { reaction });
    } catch {
      // safe
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch {
      // safe
    }
  }, []);

  const markMessagesAsRead = useCallback(
    async (chatId: string) => {
      if (!currentUser) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.chatId === chatId && m.senderId !== currentUser.id && m.status !== 'read'
            ? { ...m, status: 'read' as MessageStatus }
            : m
        )
      );
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
      try {
        const unread = messages.filter(
          (m) => m.chatId === chatId && m.senderId !== currentUser.id && m.status !== 'read'
        );
        for (const msg of unread) {
          await updateDoc(doc(db, 'messages', msg.id), { status: 'read' });
        }
      } catch {
        // safe
      }
    },
    [currentUser, messages]
  );

  // Calls Simulation
  const startCall = useCallback(
    (chatId: string, type: 'audio' | 'video') => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const stopRingtone = playRingtone();

      setCallState({
        active: true,
        type,
        partnerName: chat.name,
        partnerAvatar: chat.avatar || (users[1] ? users[1].avatar : ''),
        chatId,
        status: 'calling',
        duration: 0,
        isMuted: false,
        isCameraOff: false,
      });

      const timer = setTimeout(() => {
        stopRingtone();
        setCallState((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }, 2500);

      return () => {
        stopRingtone();
        clearTimeout(timer);
      };
    },
    [chats, users]
  );

  const endCall = useCallback(() => {
    setCallState(null);
  }, []);

  const toggleCallMute = useCallback(() => {
    setCallState((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  }, []);

  const toggleCallCamera = useCallback(() => {
    setCallState((prev) => (prev ? { ...prev, isCameraOff: !prev.isCameraOff } : null));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState && callState.status === 'connected') {
      interval = setInterval(() => {
        setCallState((prev) => (prev ? { ...prev, duration: prev.duration + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState?.status]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  }, []);

  return (
    <WhatsAppContext.Provider
      value={{
        currentUser,
        users,
        chats,
        messages,
        activeChat,
        activeChatId,
        stories,
        myStory,
        notifications,
        theme,
        soundEnabled,
        language,
        callState,
        isFirebaseConnected,
        login,
        register,
        logout,
        updateProfile,
        setActiveChatId,
        sendMessage,
        createGroup,
        addContact,
        addContactByPhone,
        postStory,
        markMessagesAsRead,
        toggleTheme,
        toggleSound,
        toggleLanguage,
        startCall,
        endCall,
        toggleCallMute,
        toggleCallCamera,
        dismissNotification,
        reactToMessage,
        deleteMessage,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};
