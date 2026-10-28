import { User, Chat, Message, UserStory } from '../types/whatsapp';

export const AVATAR_MAN = '/assets/images/avatar_bangladeshi_man_1793183719675.jpg';
export const AVATAR_WOMAN = '/assets/images/avatar_bangladeshi_woman_1793183720591.jpg';
export const STATUS_CAFE = '/assets/images/status_coffee_cafe_1793183721066.jpg';

// Known IDs of demo records to prevent them from showing after login
export const DEMO_USER_IDS = new Set([
  'user_me',
  'user_sadia',
  'user_rakib',
  'user_faiza',
  'user_fahim',
  'user_1',
  'user_2',
  'user_3',
  'user_4',
  'user_5',
]);

export const DEMO_CHAT_IDS = new Set([
  'chat_group_friends',
  'chat_sadia',
  'chat_group_office',
  'chat_rakib',
  'chat_faiza',
  'chat_1',
  'chat_2',
  'chat_3',
  'chat_4',
  'chat_5',
]);

export const isDemoId = (id?: string | null): boolean => {
  if (!id) return false;
  if (DEMO_USER_IDS.has(id) || DEMO_CHAT_IDS.has(id)) return true;
  if (id.startsWith('mock_')) return true;
  return false;
};

// No demo data after login: all initial arrays are completely clean/empty
export const INITIAL_USERS: User[] = [];
export const INITIAL_CHATS: Chat[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_STORIES: UserStory[] = [];
