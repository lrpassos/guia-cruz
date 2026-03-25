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
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, Business, Review, Coupon, News, Banner, CheckIn, Notification as AppNotification } from '../types';

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addBusiness = async (business: Omit<Business, 'id' | 'rating' | 'reviewCount' | 'isActive'>) => {
  return addDoc(collection(db, 'businesses'), {
    ...business,
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isActive: true
  });
};

export const updateBusinessStatus = async (id: string, isActive: boolean) => {
  const docRef = doc(db, 'businesses', id);
  return updateDoc(docRef, { isActive });
};

export const updateBusiness = async (id: string, business: Partial<Business>) => {
  const docRef = doc(db, 'businesses', id);
  return updateDoc(docRef, business);
};

export const deleteBusiness = async (id: string) => {
  const docRef = doc(db, 'businesses', id);
  return deleteDoc(docRef);
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
  return addDoc(collection(db, 'categories'), {
    ...category,
    order: category.order || 0
  });
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(db, 'categories', id);
  return deleteDoc(docRef);
};

// Check-ins
export const addCheckIn = async (businessId: string, userId: string) => {
  const checkin = {
    businessId,
    userId,
    createdAt: new Date().toISOString()
  };
  await addDoc(collection(db, 'checkins'), checkin);
  
  // Increment user points
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    await updateDoc(userRef, {
      points: (userData.points || 0) + 10
    });
  }
};

export const getUserCheckIns = async (userId: string): Promise<CheckIn[]> => {
  const q = query(collection(db, 'checkins'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));
};

// Notifications (Push simulation)
export const sendNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: new Date().toISOString()
  });
};

export const getNotifications = (callback: (notifications: AppNotification[]) => void) => {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    callback(notifications);
  });
};

// Businesses
export const getFeaturedBusinesses = async (count: number = 5): Promise<Business[]> => {
  const q = query(
    collection(db, 'businesses'), 
    where('isFeatured', '==', true), 
    where('isActive', '==', true),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
};

export const getBusinessesByCategory = async (categoryId: string): Promise<Business[]> => {
  const q = query(
    collection(db, 'businesses'), 
    where('categoryId', '==', categoryId),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
  const docRef = doc(db, 'businesses', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Business) : null;
};

// Reviews
export const getReviewsByBusiness = (businessId: string, callback: (reviews: Review[]) => void) => {
  const q = query(
    collection(db, 'reviews'), 
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    callback(reviews);
  });
};

export const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: new Date().toISOString()
  });
};

// Coupons
export const getCouponsByBusiness = async (businessId: string): Promise<Coupon[]> => {
  const q = query(collection(db, 'coupons'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
};

// News
export const getLatestNews = async (count: number = 10): Promise<News[]> => {
  const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as News));
};

// Banners
export const getActiveBanners = async (): Promise<Banner[]> => {
  const q = query(collection(db, 'banners'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
};

export const getAllBanners = async (): Promise<Banner[]> => {
  const q = query(collection(db, 'banners'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
  return addDoc(collection(db, 'banners'), banner);
};

export const updateBannerStatus = async (id: string, active: boolean) => {
  const docRef = doc(db, 'banners', id);
  return updateDoc(docRef, { active });
};

export const deleteBanner = async (id: string) => {
  const docRef = doc(db, 'banners', id);
  return deleteDoc(docRef);
};
