import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryIconProps {
  category: Category;
}

export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(({ category }) => {
  // Dynamically get the icon from lucide-react
  const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;

  return (
    <Link 
      to={`/category/${category.id}`}
      className="flex flex-col items-center gap-2 group"
    >
      <div 
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 overflow-hidden",
          "bg-white border border-gray-100 shadow-sm group-hover:border-blue-200"
        )}
        style={{ color: category.color || '#3b82f6' }}
      >
        {category.iconUrl ? (
          <img 
            src={category.iconUrl} 
            alt={category.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <IconComponent className="w-7 h-7" />
        )}
      </div>
      <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
        {category.name}
      </span>
    </Link>
  );
});
