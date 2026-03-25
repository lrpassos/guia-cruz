import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { fetchExternalNews } from '../services/newsService';
import { News } from '../types';
import { Calendar } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExternalNews();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout title="Notícias" showBack backTo="/">
      <div className="px-4 pt-6 space-y-4 pb-12">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {news.slice(0, 8).map((item) => (
              <a 
                key={item.id} 
                href={item.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
              >
                {item.photo && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={item.photo} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-3 leading-snug mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </a>
            ))}
            {news.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm italic">Nenhuma notícia encontrada no momento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
