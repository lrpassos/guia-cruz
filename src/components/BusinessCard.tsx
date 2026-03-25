import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Business } from '../types';
import { cn } from '../lib/utils';

interface BusinessCardProps {
  business: Business;
  variant?: 'horizontal' | 'vertical';
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, variant = 'vertical' }) => {
  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/business/${business.id}`}
        className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 transition-all active:scale-[0.98]"
      >
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            src={business.photos[0] || `https://picsum.photos/seed/${business.id}/200`} 
            alt={business.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{business.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{business.rating.toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({business.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] truncate">{business.address}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/business/${business.id}`}
      className="block w-48 flex-shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-100 transition-all active:scale-[0.98]"
    >
      <div className="h-32 bg-gray-100 relative">
        <img 
          src={business.photos[0] || `https://picsum.photos/seed/${business.id}/400`} 
          alt={business.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {business.isFeatured && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Destaque
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-gray-900 truncate">{business.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{business.rating.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">({business.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-gray-500">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] truncate">{business.address}</span>
        </div>
      </div>
    </Link>
  );
};
