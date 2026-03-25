import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Settings, Award, MapPin, Bell, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, login, logout, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Layout title="Perfil">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Perfil" showBack backTo="/">
      <div className="px-4 pt-8">
        {!user ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao Guia Cruz</h2>
            <p className="text-gray-500 text-sm mb-8">Faça login para salvar favoritos, avaliar empresas e ganhar pontos.</p>
            <button 
              onClick={login}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <LogIn className="w-5 h-5" /> Entrar com Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-xs">{user.email}</p>
                <div className="mt-2 flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit">
                  <Award className="w-3 h-3" /> {user.points || 0} Pontos
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              {isAdmin && (
                <Link to="/admin" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-700">Painel Administrativo</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              )}
              
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">Meus Check-ins</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <Link to="/news" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">Notificações</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Sair da Conta</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
