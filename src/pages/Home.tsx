import React, { useEffect, useState } from 'react';
import { 
  getCategories, 
  getFeaturedBusinesses, 
  getActiveBanners
} from '../services/firestore';
import { fetchExternalNews } from '../services/newsService';
import { Category, Business, Banner, News } from '../types';
import { Layout } from '../components/Layout';
import { BusinessCard } from '../components/BusinessCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { ChevronRight, Search, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Business[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, feats, bans, nws] = await Promise.all([
          getCategories(),
          getFeaturedBusinesses(),
          getActiveBanners(),
          fetchExternalNews()
        ]);
        setCategories(cats);
        setFeatured(feats);
        setBanners(bans);
        setNews(nws.slice(0, 3));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Search Bar & Scan */}
      <div className="px-4 pt-4 flex gap-3">
        <Link to="/search" className="flex-1 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm font-medium">O que você está procurando?</span>
        </Link>
        <Link to="/scan" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all">
          <QrCode className="w-6 h-6" />
        </Link>
      </div>

      {/* Categories Grid */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Categorias</h2>
          <Link to="/categories" className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            Ver todas <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {categories.slice(0, 8).map((cat) => (
            <CategoryIcon key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Banners Slider (Simplified) */}
      {banners.length > 0 && (
        <section className="mt-8 px-4">
          <div className="overflow-hidden rounded-2xl aspect-[21/9] bg-gray-100 shadow-sm">
            {banners[0].link ? (
              <a href={banners[0].link} target="_blank" rel="noopener noreferrer">
                <img 
                  src={banners[0].imageUrl} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <img 
                src={banners[0].imageUrl} 
                alt="Banner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      <section className="mt-8 pb-12">
        <div className="px-4 flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Destaques</h2>
          <Link to="/featured" className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
          {featured.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
          {featured.length === 0 && (
            <div className="w-full py-12 text-center text-gray-400 text-sm italic">
              Nenhuma empresa em destaque no momento.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};
