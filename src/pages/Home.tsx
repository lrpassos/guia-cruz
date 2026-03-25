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
import { motion, AnimatePresence } from 'motion/react';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Business[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, feats, bans] = await Promise.all([
          getCategories(),
          getFeaturedBusinesses(),
          getActiveBanners()
        ]);
        setCategories(cats);
        setFeatured(feats);
        setBanners(bans);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNews = async () => {
      try {
        const nws = await fetchExternalNews();
        setNews(nws.slice(0, 3));
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchData();
    fetchNews();
  }, []);

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
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="w-12 h-2 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          ) : (
            categories.slice(0, 8).map((cat) => (
              <CategoryIcon key={cat.id} category={cat} />
            ))
          )}
        </div>
      </section>

      {/* Banners Carousel */}
      {loading ? (
        <section className="mt-8 px-4">
          <div className="aspect-[21/9] bg-gray-100 rounded-2xl animate-pulse shadow-sm" />
        </section>
      ) : banners.length > 0 && (
        <section className="mt-8 px-4">
          <div className="relative overflow-hidden rounded-2xl aspect-[21/9] bg-gray-100 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={banners[currentBanner].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {banners[currentBanner].link ? (
                  <a href={banners[currentBanner].link} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={banners[currentBanner].imageUrl} 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                ) : (
                  <img 
                    src={banners[currentBanner].imageUrl} 
                    alt="Banner" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Dots Indicator */}
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentBanner ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
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
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-48 h-56 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
            ))
          ) : (
            featured.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))
          )}
          {!loading && featured.length === 0 && (
            <div className="w-full py-12 text-center text-gray-400 text-sm italic">
              Nenhuma empresa em destaque no momento.
            </div>
          )}
        </div>
      </section>

      {/* News Section (Lazy Loaded) */}
      <section className="mt-4 px-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Últimas Notícias</h2>
          <Link to="/news" className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            Ver todas <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {loadingNews ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, idx) => (
              <Link key={idx} to="/news" className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-50 shadow-sm active:scale-[0.98] transition-all">
                {item.photo && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={item.photo} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">{item.date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};
