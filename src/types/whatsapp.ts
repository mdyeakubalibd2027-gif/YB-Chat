export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  about: string;
  password?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text?: string;
  mediaType?: 'text' | 'image' | 'file' | 'audio';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  audioDuration?: number;
  timestamp: number;
  status: MessageStatus;
  reaction?: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[];
  admins?: string[];
  description?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isTyping?: boolean;
}

export interface StoryItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  caption?: string;
  backgroundColor?: string;
  timestamp: number;
}

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: StoryItem[];
  allViewed?: boolean;
  updatedAt: number;
}

export interface NotificationToast {
  id: string;
  title: string;
  body: string;
  avatar: string;
  chatId: string;
}
