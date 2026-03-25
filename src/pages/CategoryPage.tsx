import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBusinessesByCategory, getCategories } from '../services/firestore';
import { Business, Category } from '../types';
import { Layout } from '../components/Layout';
import { BusinessCard } from '../components/BusinessCard';

export const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [bizs, cats] = await Promise.all([
          getBusinessesByCategory(id),
          getCategories()
        ]);
        setBusinesses(bizs);
        setCategory(cats.find(c => c.id === id) || null);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Carregando..." showBack>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={category?.name || 'Categoria'} showBack>
      <div className="px-4 pt-6 space-y-4">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} variant="horizontal" />
        ))}
        {businesses.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm italic">Nenhuma empresa encontrada nesta categoria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
