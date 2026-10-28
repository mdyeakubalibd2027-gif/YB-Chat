import { User, Chat, Message, UserStory } from '../types/whatsapp';

export const AVATAR_MAN = '/assets/images/avatar_bangladeshi_man_1793183719675.jpg';
export const AVATAR_WOMAN = '/assets/images/avatar_bangladeshi_woman_1793183720591.jpg';
export const STATUS_CAFE = '/assets/images/status_coffee_cafe_1793183721066.jpg';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_me',
    name: 'তানভীর আহমেদ (Tanvir)',
    phone: '+880 1712-345678',
    email: 'tanvir@example.com',
    avatar: AVATAR_MAN,
    about: 'আসসালামু আলাইকুম! জরুরি প্রয়োজনে কল করুন।',
    isOnline: true,
  },
  {
    id: 'user_sadia',
    name: 'সাদিয়া জাহান (Sadia)',
    phone: '+880 1823-456789',
    email: 'sadia@example.com',
    avatar: AVATAR_WOMAN,
    about: 'Design is intelligence made visible ✨',
    isOnline: true,
  },
  {
    id: 'user_rakib',
    name: 'রাকিব হাসান (Rakib)',
    phone: '+880 1934-567890',
    email: 'rakib@example.com',
    avatar: AVATAR_MAN,
    about: 'কাজের মধ্যে আছি 💻',
    isOnline: false,
    lastSeen: 'আজ সকাল ১০:২৫',
  },
  {
    id: 'user_faiza',
    name: 'ফায়জা চৌধুরী (Faiza)',
    phone: '+880 1645-678901',
    email: 'faiza@example.com',
    avatar: AVATAR_WOMAN,
    about: 'Always learning something new 📚',
    isOnline: true,
  },
  {
    id: 'user_fahim',
    name: 'ফাহিম মোর্শেদ (Fahim)',
    phone: '+880 1556-789012',
    email: 'fahim@example.com',
    avatar: AVATAR_MAN,
    about: 'Never give up on your dreams 🚀',
    isOnline: false,
    lastSeen: 'গতকাল রাত ১১:৪৫',
  },
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat_group_friends',
    type: 'group',
    name: 'বন্ধুমহল আড্ডা 🇧🇩',
    avatar: '',
    participants: ['user_me', 'user_sadia', 'user_rakib', 'user_faiza', 'user_fahim'],
    admins: ['user_me', 'user_sadia'],
    description: 'আমাদের কলেজ ফ্রেন্ডস গ্রুপ। শুক্রবার আড্ডা ও প্রজেক্ট নিয়ে আলোচনা।',
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: 'chat_sadia',
    type: 'direct',
    name: 'সাদিয়া জাহান (Sadia)',
    avatar: AVATAR_WOMAN,
    participants: ['user_me', 'user_sadia'],
    unreadCount: 0,
    isPinned: true,
  },
  {
    id: 'chat_group_office',
    type: 'group',
    name: 'Tech Innovators BD 💻',
    avatar: '',
    participants: ['user_me', 'user_rakib', 'user_fahim'],
    admins: ['user_rakib'],
    description: 'Frontend & UI Engineering Discussion',
    unreadCount: 2,
    isPinned: false,
  },
  {
    id: 'chat_rakib',
    type: 'direct',
    name: 'রাকিব হাসান (Rakib)',
    avatar: AVATAR_MAN,
    participants: ['user_me', 'user_rakib'],
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'chat_faiza',
    type: 'direct',
    name: 'ফায়জা চৌধুরী (Faiza)',
    avatar: AVATAR_WOMAN,
    participants: ['user_me', 'user_faiza'],
    unreadCount: 0,
    isPinned: false,
  },
];

const now = Date.now();

export const INITIAL_MESSAGES: Message[] = [
  // Chat with Sadia
  {
    id: 'msg_s1',
    chatId: 'chat_sadia',
    senderId: 'user_sadia',
    senderName: 'সাদিয়া জাহান',
    text: 'আসসালামু আলাইকুম তানভীর ভাই! প্রজেক্টের ডিজাইন ফাইলগুলো কি দেখেছেন?',
    timestamp: now - 3600000 * 2,
    status: 'read',
  },
  {
    id: 'msg_s2',
    chatId: 'chat_sadia',
    senderId: 'user_me',
    senderName: 'তানভীর আহমেদ',
    text: 'ওয়ালাইকুমুস সালাম সাদিয়া! হ্যাঁ, ইউআই ও কালার প্যালেট চমৎকার হয়েছে। মোবাইল রেসপনসিভনেসও পারফেক্ট।',
    timestamp: now - 3600000 * 1.8,
    status: 'read',
  },
  {
    id: 'msg_s3',
    chatId: 'chat_sadia',
    senderId: 'user_sadia',
    senderName: 'সাদিয়া জাহান',
    text: 'অসংখ্য ধন্যবাদ! আমি ক্যাফেতে বসে বাকি স্ক্রিনগুলো রিভিয়ু করছি ☕',
    timestamp: now - 3600000 * 1.5,
    status: 'read',
  },
  {
    id: 'msg_s4',
    chatId: 'chat_sadia',
    senderId: 'user_sadia',
    senderName: 'সাদিয়া জাহান',
    mediaType: 'image',
    mediaUrl: STATUS_CAFE,
    text: 'আজকের কাজের পরিবেশ বেশ শান্ত!',
    timestamp: now - 3600000 * 1.4,
    status: 'read',
  },
  {
    id: 'msg_s5',
    chatId: 'chat_sadia',
    senderId: 'user_me',
    senderName: 'তানভীর আহমেদ',
    text: 'খুব সুন্দর! আজকের মিটিংয়ে উপস্থাপনের জন্য সবকিছু প্রস্তুত রাখি।',
    timestamp: now - 3600000 * 0.5,
    status: 'read',
  },

  // Group: বন্ধুমহল
  {
    id: 'msg_g1',
    chatId: 'chat_group_friends',
    senderId: 'user_fahim',
    senderName: 'ফাহিম মোর্শেদ',
    text: 'দোস্তরা, আগামী শুক্রবার ধানমন্ডি লেকে কে কে আসছিস?',
    timestamp: now - 3600000 * 4,
    status: 'read',
  },
  {
    id: 'msg_g2',
    chatId: 'chat_group_friends',
    senderId: 'user_rakib',
    senderName: 'রাকিব হাসান',
    text: 'ইনশাআল্লাহ আমি আসব। বিকেলে চা আর আড্ডা হবে!',
    timestamp: now - 3600000 * 3,
    status: 'read',
  },
  {
    id: 'msg_g3',
    chatId: 'chat_group_friends',
    senderId: 'user_faiza',
    senderName: 'ফায়জা চৌধুরী',
    text: 'আমিও আসছি! সবাই যেন সময়মতো উপস্থিত থাকি।',
    timestamp: now - 1800000,
    status: 'read',
  },

  // Tech Innovators BD
  {
    id: 'msg_t1',
    chatId: 'chat_group_office',
    senderId: 'user_rakib',
    senderName: 'রাকিব হাসান',
    mediaType: 'file',
    mediaName: 'Project_Architecture_Specification.pdf',
    mediaSize: '2.4 MB',
    text: 'নতুন সিস্টেম আর্কিটেকচার ডক শেয়ার করলাম, রিভিয়ু করবেন।',
    timestamp: now - 7200000,
    status: 'read',
  },
  {
    id: 'msg_t2',
    chatId: 'chat_group_office',
    senderId: 'user_fahim',
    senderName: 'ফাহিম মোর্শেদ',
    text: 'ডকুমেন্ট ডাউনলোড করেছি, আজ রাতের মধ্যেই ফিডব্যাক দিচ্ছি।',
    timestamp: now - 3600000,
    status: 'read',
  },

  // Rakib Direct
  {
    id: 'msg_r1',
    chatId: 'chat_rakib',
    senderId: 'user_rakib',
    senderName: 'রাকিব হাসান',
    text: 'তানভীর ভাই, ক্লাউড ডেপ্লয়মেন্টের কি অবস্থা?',
    timestamp: now - 86400000,
    status: 'read',
  },
  {
    id: 'msg_r2',
    chatId: 'chat_me_r',
    senderId: 'user_me',
    senderName: 'তানভীর আহমেদ',
    text: 'সব টেস্ট পাস করেছে এবং লাইভ সার্ভারে সাকসেসফুলি ডেপ্লয় হয়েছে 👍',
    timestamp: now - 85000000,
    status: 'read',
  },
];

export const INITIAL_STORIES: UserStory[] = [
  {
    userId: 'user_sadia',
    userName: 'সাদিয়া জাহান (Sadia)',
    userAvatar: AVATAR_WOMAN,
    updatedAt: now - 1800000,
    stories: [
      {
        id: 'st_1',
        type: 'image',
        content: STATUS_CAFE,
        caption: 'Morning productive vibe at local cafe ☕✨',
        timestamp: now - 1800000,
      },
      {
        id: 'st_2',
        type: 'text',
        content: '“Creativity is intelligence having fun.” - Albert Einstein',
        backgroundColor: '#075e54',
        timestamp: now - 1200000,
      },
    ],
  },
  {
    userId: 'user_rakib',
    userName: 'রাকিব হাসান (Rakib)',
    userAvatar: AVATAR_MAN,
    updatedAt: now - 7200000,
    stories: [
      {
        id: 'st_3',
        type: 'text',
        content: 'Debugging code with warm tea 🍵\nNever stop building!',
        backgroundColor: '#128c7e',
        timestamp: now - 7200000,
      },
    ],
  },
  {
    userId: 'user_faiza',
    userName: 'ফায়জা চৌধুরী (Faiza)',
    userAvatar: AVATAR_WOMAN,
    updatedAt: now - 14400000,
    stories: [
      {
        id: 'st_4',
        type: 'text',
        content: 'Finished reading a wonderful book today 📖 Highly recommended!',
        backgroundColor: '#1f2c34',
        timestamp: now - 14400000,
      },
    ],
  },
];
