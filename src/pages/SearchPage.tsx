import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Business } from '../types';
import { Layout } from '../components/Layout';
import { BusinessCard } from '../components/BusinessCard';
import { Search as SearchIcon, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Simple client-side search for demo (Firestore doesn't support full-text search natively without Algolia/Elastic)
      const q = query(collection(db, 'businesses'), orderBy('name'));
      const snapshot = await getDocs(q);
      const allBiz = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
      
      const filtered = allBiz.filter(biz => 
        biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Busca" showBack backTo="/">
      <div className="px-4 pt-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-12 py-4 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            autoFocus
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-100 rounded-full"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {results.map(biz => (
              <BusinessCard key={biz.id} business={biz} variant="horizontal" />
            ))}
            {searchTerm.length >= 2 && results.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm italic">Nenhum resultado encontrado para "{searchTerm}"</p>
              </div>
            )}
            {searchTerm.length < 2 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm italic">Digite pelo menos 2 caracteres para buscar.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
