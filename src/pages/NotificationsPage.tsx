import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { fetchExternalNews } from '../services/newsService';
import { News } from '../types';
import { Bell, Calendar, ExternalLink } from 'lucide-react';

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
      <div className="px-4 pt-6 space-y-6 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                {item.photo && (
                  <div className="aspect-video w-full bg-gray-100">
                    <img 
                      src={item.photo} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{item.content}</p>
                  
                  {(item as any).link && (
                    <a 
                      href={(item as any).link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline"
                    >
                      Ler notícia completa <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
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
