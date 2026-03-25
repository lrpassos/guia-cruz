import { collection, addDoc, getDocs, query, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const seedDatabase = async () => {
  try {
    const seedRef = doc(db, 'settings', 'system');
    const seedSnap = await getDoc(seedRef);
    
    if (seedSnap.exists() && seedSnap.data().seeded) return;

    console.log('Seeding database...');

    const categoriesRef = collection(db, 'categories');

    // Categories
    const categories = [
      { name: 'Supermercados', icon: 'ShoppingCart', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png', order: 1 },
    ];

    const catIds: string[] = [];
    for (const cat of categories) {
      const docRef = await addDoc(categoriesRef, cat);
      catIds.push(docRef.id);
    }

    // Businesses
    const businesses = [
      {
        name: 'Supermercado Central',
        description: 'O melhor supermercado da região com produtos frescos e preços baixos.',
        categoryId: catIds[0],
        address: 'Rua Principal, 100 - Centro',
        lat: -23.5505,
        lng: -46.6333,
        phone: '11999999999',
        whatsapp: '5511999999999',
        photos: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
        rating: 5.0,
        reviewCount: 1,
        isFeatured: true,
        isActive: true
      }
    ];

    for (const biz of businesses) {
      const bizRef = await addDoc(collection(db, 'businesses'), biz);
      
      // Add a coupon for the first business
      if (biz.name === 'Pizzaria Bella Napoli') {
        await addDoc(collection(db, 'coupons'), {
          businessId: bizRef.id,
          title: '10% de Desconto',
          description: 'Válido para pizzas grandes de segunda a quinta.',
          code: 'BELLA10',
          expiryDate: '2026-12-31T23:59:59Z'
        });
      }
    }

    // Banners
    await addDoc(collection(db, 'banners'), {
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      link: '/category/' + catIds[0],
      active: true
    });

    // News
    await addDoc(collection(db, 'news'), {
      title: 'Festival de Gastronomia Local começa este final de semana!',
      content: 'Venha saborear os melhores pratos da nossa região no parque central.',
      photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      date: new Date().toISOString()
    });

    // Mark as seeded
    await setDoc(doc(db, 'settings', 'system'), { seeded: true });

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
    // Gracefully continue as this is a background task
  }
};
