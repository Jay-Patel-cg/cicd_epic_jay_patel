export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  isBlocked?: boolean;
  bookmarks?: Knowledge[];
}

export interface Session {
  _id: string;
  device: string;
  ip: string;
  lastActive: string;
}

export interface Knowledge {
  _id: string;
  instruction: string;
  output: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  knowledge: string;
  comment: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  knowledge: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalGuides: number;
  totalBookmarks: number;
  totalComments: number;
  totalReviews: number;
  systemUptimeSeconds: number;
  healthState: string;
}
