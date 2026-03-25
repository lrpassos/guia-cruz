import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Category, Business, Review, Coupon, News, Banner, Notification as AppNotification, AppSettings, Announcement } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

// Simple in-memory cache
const cache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const cacheKey = 'categories';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const path = 'categories';
  try {
    const q = query(collection(db, path), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addBusiness = async (business: Omit<Business, 'id' | 'rating' | 'reviewCount' | 'isActive'>) => {
  const path = 'businesses';
  try {
    return await addDoc(collection(db, path), {
      ...business,
      rating: 0,
      reviewCount: 0,
      isFeatured: false,
      isActive: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateBusinessStatus = async (id: string, isActive: boolean) => {
  const path = `businesses/${id}`;
  try {
    const docRef = doc(db, 'businesses', id);
    return await updateDoc(docRef, { isActive });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateBusiness = async (id: string, business: Partial<Business>) => {
  const path = `businesses/${id}`;
  try {
    const docRef = doc(db, 'businesses', id);
    return await updateDoc(docRef, business);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteBusiness = async (id: string) => {
  const path = `businesses/${id}`;
  try {
    const docRef = doc(db, 'businesses', id);
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
  const path = 'categories';
  try {
    return await addDoc(collection(db, path), {
      ...category,
      order: category.order || 0
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteCategory = async (id: string) => {
  const path = `categories/${id}`;
  try {
    const docRef = doc(db, 'categories', id);
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Notifications (Push simulation)
export const sendNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
  const path = 'notifications';
  try {
    return await addDoc(collection(db, path), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getNotifications = (callback: (notifications: AppNotification[]) => void) => {
  const path = 'notifications';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    callback(notifications);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// Businesses
export const getAllBusinesses = async (): Promise<Business[]> => {
  const path = 'businesses';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getFeaturedBusinesses = async (count: number = 5): Promise<Business[]> => {
  const cacheKey = `featured_${count}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const path = 'businesses';
  try {
    const q = query(
      collection(db, path), 
      where('isFeatured', '==', true), 
      where('isActive', '==', true),
      limit(count)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getBusinessesByCategory = async (categoryId: string): Promise<Business[]> => {
  const path = 'businesses';
  try {
    const q = query(
      collection(db, path), 
      where('categoryId', '==', categoryId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
  const path = `businesses/${id}`;
  try {
    const docRef = doc(db, 'businesses', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Business) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

// Reviews
export const getReviewsByBusiness = (businessId: string, callback: (reviews: Review[]) => void) => {
  const path = 'reviews';
  const q = query(
    collection(db, path), 
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    callback(reviews);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  const path = 'reviews';
  try {
    return await addDoc(collection(db, path), {
      ...review,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Coupons
export const getCouponsByBusiness = async (businessId: string): Promise<Coupon[]> => {
  const path = 'coupons';
  try {
    const q = query(collection(db, path), where('businessId', '==', businessId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// News
export const getLatestNews = async (count: number = 10): Promise<News[]> => {
  const path = 'news';
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as News));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Banners
export const getActiveBanners = async (): Promise<Banner[]> => {
  const cacheKey = 'active_banners';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const path = 'banners';
  try {
    const q = query(collection(db, path), where('active', '==', true));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllBanners = async (): Promise<Banner[]> => {
  const path = 'banners';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
  const path = 'banners';
  try {
    return await addDoc(collection(db, path), banner);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateBannerStatus = async (id: string, active: boolean) => {
  const path = `banners/${id}`;
  try {
    const docRef = doc(db, 'banners', id);
    return await updateDoc(docRef, { active });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteBanner = async (id: string) => {
  const path = `banners/${id}`;
  try {
    const docRef = doc(db, 'banners', id);
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Settings
export const getAppSettings = async (): Promise<AppSettings | null> => {
  const path = 'settings/global';
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateAppSettings = async (settings: AppSettings) => {
  const path = 'settings/global';
  try {
    const docRef = doc(db, 'settings', 'global');
    return await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Announcements
export const getActiveAnnouncement = async (): Promise<Announcement | null> => {
  const path = 'announcements';
  try {
    const q = query(collection(db, path), where('active', '==', true), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Announcement;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateAnnouncement = async (announcement: Omit<Announcement, 'id' | 'updatedAt'>) => {
  const path = 'announcements/current';
  try {
    const docRef = doc(db, 'announcements', 'current');
    return await setDoc(docRef, {
      ...announcement,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
