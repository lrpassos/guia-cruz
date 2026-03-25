export interface Category {
  id: string;
  name: string;
  icon: string;
  iconUrl?: string;
  color?: string;
  order?: number;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  address: string;
  lat?: number;
  lng?: number;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  photos: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  mapsUrl?: string;
  ownerUid?: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  businessId: string;
  title: string;
  description: string;
  code: string;
  expiryDate: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  photo?: string;
  date: string;
  link?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  active: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  points?: number;
}

export interface CheckIn {
  id: string;
  businessId: string;
  userId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  businessId: string;
  businessName: string;
  message: string;
  createdAt: string;
}

export interface AppSettings {
  appLogo?: string;
  appName?: string;
}

export interface Announcement {
  id: string;
  imageUrl: string;
  link?: string;
  active: boolean;
  updatedAt: string;
}
