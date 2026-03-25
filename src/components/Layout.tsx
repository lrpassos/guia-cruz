import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, BookOpen, User, Menu, ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, backTo }) => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Busca', path: '/search' },
    { icon: BookOpen, label: 'Notícias', path: '/news' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => backTo ? navigate(backTo) : window.history.back()} 
              className="p-2 -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {title || 'Guia Cruz'}
          </h1>
        </div>
        {user && (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {user.name.charAt(0)}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
