import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export const seedDatabase = async () => {
  const categoriesRef = collection(db, 'categories');
  const catSnap = await getDocs(query(categoriesRef, limit(1)));
  
  if (!catSnap.empty) return; // Already seeded

  console.log('Seeding database...');

  // Categories
  const categories = [
    { name: 'Restaurantes', icon: 'Utensils', color: '#ef4444', order: 1 },
    { name: 'Saúde', icon: 'HeartPulse', color: '#10b981', order: 2 },
    { name: 'Lojas', icon: 'ShoppingBag', color: '#f59e0b', order: 3 },
    { name: 'Serviços', icon: 'Wrench', color: '#3b82f6', order: 4 },
    { name: 'Beleza', icon: 'Sparkles', color: '#ec4899', order: 5 },
    { name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6', order: 6 },
    { name: 'Automotivo', icon: 'Car', color: '#6b7280', order: 7 },
    { name: 'Pet Shop', icon: 'Dog', color: '#d97706', order: 8 },
  ];

  const catIds: string[] = [];
  for (const cat of categories) {
    const docRef = await addDoc(categoriesRef, cat);
    catIds.push(docRef.id);
  }

  // Businesses
  const businesses = [
    {
      name: 'Pizzaria Bella Napoli',
      description: 'A melhor pizza artesanal da cidade com ingredientes importados da Itália.',
      categoryId: catIds[0],
      address: 'Rua das Flores, 123 - Centro',
      lat: -23.5505,
      lng: -46.6333,
      phone: '11999999999',
      whatsapp: '5511999999999',
      photos: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'],
      rating: 4.8,
      reviewCount: 124,
      isFeatured: true
    },
    {
      name: 'Clínica Sorriso',
      description: 'Atendimento odontológico completo para toda a sua família.',
      categoryId: catIds[1],
      address: 'Av. Paulista, 1000 - Bela Vista',
      lat: -23.5615,
      lng: -46.6553,
      phone: '1133333333',
      photos: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80'],
      rating: 4.9,
      reviewCount: 89,
      isFeatured: true
    },
    {
      name: 'Moda & Estilo',
      description: 'As últimas tendências da moda masculina e feminina com os melhores preços.',
      categoryId: catIds[2],
      address: 'Rua Oscar Freire, 500 - Jardins',
      lat: -23.5655,
      lng: -46.6663,
      whatsapp: '5511988888888',
      photos: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'],
      rating: 4.5,
      reviewCount: 56,
      isFeatured: false
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

  console.log('Seeding complete!');
};
