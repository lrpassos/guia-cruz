import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { 
  addBusiness, 
  sendNotification, 
  getCategories, 
  getAllBusinesses, 
  addCategory,
  deleteCategory,
  updateBusinessStatus,
  updateBusiness,
  deleteBusiness,
  getAllBanners,
  addBanner,
  updateBannerStatus,
  deleteBanner,
  getAppSettings,
  updateAppSettings
} from '../services/firestore';
import { Category, Business, Banner, AppSettings } from '../types';
import { Plus, Send, Building, Bell, CheckCircle, Trash2, ShieldAlert, ShieldCheck, Grid, Image as ImageIcon, Edit2, X, MapPin, Upload, Eraser, Search, ChevronRight, RefreshCw, Settings, Save } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, deleteDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { seedDatabase } from '../lib/seed';

export const AdminPage: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appLogo: '',
    appName: 'Guia Cruz'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    icon: 'Grid',
    iconUrl: '',
    order: 0
  });

  // Business Form State
  const [bizForm, setBizForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    address: '',
    phone: '',
    whatsapp: '',
    mapsUrl: '',
    photos: [''],
    lat: 0,
    lng: 0
  });

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    imageUrl: '',
    link: '',
    active: true
  });

  // Notification Form State
  const [notifForm, setNotifForm] = useState({
    businessId: '',
    message: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [cats, bizs, bans, settings] = await Promise.all([
      getCategories(), 
      getAllBusinesses(),
      getAllBanners(),
      getAppSettings()
    ]);
    setCategories(cats);
    setBusinesses(bizs);
    setBanners(bans);
    if (settings) setAppSettings(settings);
    setLoading(false);
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('ATENÇÃO: Isso irá apagar TODAS as empresas, categorias e banners e restaurar o padrão (apenas Supermercados). Deseja continuar?')) return;
    
    setLoading(true);
    try {
      // Delete all collections
      const collections = ['businesses', 'categories', 'banners', 'news', 'coupons', 'reviews', 'checkins', 'notifications'];
      for (const coll of collections) {
        const snap = await getDocs(collection(db, coll));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, coll, d.id));
        }
      }
      
      // Reset seed flag
      await setDoc(doc(db, 'settings', 'system'), { seeded: false });
      
      // Re-seed
      await seedDatabase();
      
      setSuccess('Banco de dados resetado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Erro ao resetar banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'category' | 'business' | 'banner' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to 500KB to avoid Firestore limits
    if (file.size > 500 * 1024) {
      alert('A imagem é muito grande! Por favor, escolha uma imagem com menos de 500KB.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      if (type === 'category') {
        setCatForm({ ...catForm, iconUrl: base64 });
      } else if (type === 'business') {
        setBizForm({ ...bizForm, photos: [base64] });
      } else if (type === 'banner') {
        setBannerForm({ ...bannerForm, imageUrl: base64 });
      } else if (type === 'logo') {
        setAppSettings({ ...appSettings, appLogo: base64 });
      }
    } catch (error) {
      console.error('Error converting file:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAppSettings(appSettings);
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory(catForm);
      setSuccess('Categoria adicionada!');
      setCatForm({ name: '', icon: 'Grid', iconUrl: '', order: 0 });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBusiness(bizForm);
      setSuccess('Empresa adicionada com sucesso!');
      setBizForm({
        name: '',
        description: '',
        categoryId: '',
        address: '',
        phone: '',
        whatsapp: '',
        mapsUrl: '',
        photos: [''],
        lat: 0,
        lng: 0
      });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving business:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateBusinessStatus(id, !currentStatus);
      setSuccess(currentStatus ? 'Empresa bloqueada' : 'Empresa desbloqueada');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;
    try {
      await deleteBusiness(id);
      setSuccess('Empresa excluída');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBanner(bannerForm);
      setSuccess('Banner de publicidade adicionado!');
      setBannerForm({ imageUrl: '', link: '', active: true });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  const handleToggleBanner = async (id: string, currentStatus: boolean) => {
    try {
      await updateBannerStatus(id, !currentStatus);
      setSuccess(currentStatus ? 'Banner desativado' : 'Banner ativado');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating banner status:', error);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;
    try {
      await deleteBanner(id);
      setSuccess('Banner excluído');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBiz = businesses.find(b => b.id === notifForm.businessId);
    if (!selectedBiz) return;

    try {
      await sendNotification({
        businessId: notifForm.businessId,
        businessName: selectedBiz.name,
        message: notifForm.message
      });
      setSuccess('Notificação enviada!');
      setNotifForm({ businessId: '', message: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await deleteCategory(id);
      setSuccess('Categoria excluída');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleRemoveDuplicateCategories = async () => {
    if (!window.confirm('Deseja remover automaticamente as categorias com nomes repetidos?')) return;
    
    try {
      setLoading(true);
      const seenNames = new Set<string>();
      const duplicates: string[] = [];

      // Sort by order so we keep the one with the lowest order (usually the first one created/intended)
      const sortedCats = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (const cat of sortedCats) {
        const nameKey = cat.name.trim().toLowerCase();
        if (seenNames.has(nameKey)) {
          duplicates.push(cat.id);
        } else {
          seenNames.add(nameKey);
        }
      }

      if (duplicates.length === 0) {
        alert('Nenhuma categoria repetida encontrada.');
        return;
      }

      for (const id of duplicates) {
        await deleteCategory(id);
      }

      setSuccess(`${duplicates.length} categorias repetidas removidas!`);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="Admin" showBack backTo="/profile">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Acesso Negado" showBack backTo="/profile">
        <div className="p-8 text-center text-red-500 font-bold">Você não tem permissão para acessar esta página.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Painel Admin" showBack backTo="/profile">
      <div className="px-4 pt-6 space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-sm text-gray-500">Gerencie o sistema</p>
          </div>
          <button
            onClick={handleResetDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors text-sm font-medium"
            title="Resetar para o padrão (Apenas Supermercados)"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Resetar Banco
          </button>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 border border-green-100 animate-bounce">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        )}

        {/* App Settings */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> Configurações do App
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome do Aplicativo</label>
              <input 
                type="text" 
                value={appSettings.appName}
                onChange={e => setAppSettings({...appSettings, appName: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Guia Cruz"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Logomarca do App</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="URL da Logo ou Link Google Drive" 
                  value={appSettings.appLogo}
                  onChange={e => setAppSettings({...appSettings, appLogo: e.target.value})}
                  className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <label className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'logo')} />
                </label>
              </div>
              {appSettings.appLogo && (
                <div className="mt-2 p-4 bg-gray-50 rounded-2xl flex justify-center border border-gray-100">
                  <img src={appSettings.appLogo} alt="App Logo Preview" className="h-16 object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={savingSettings}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {savingSettings ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Configurações
            </button>
          </form>
        </section>

        {/* Add Category Form */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600" /> Cadastrar Categoria
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handleRemoveDuplicateCategories}
                className="text-xs font-bold text-orange-600 flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-xl active:scale-95 transition-all"
                title="Remover Nomes Repetidos"
              >
                <Eraser className="w-3 h-3" /> Limpar Repetidos
              </button>
            </div>
          </div>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome da Categoria" 
              value={catForm.name}
              onChange={e => setCatForm({...catForm, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              required
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="URL do Ícone ou Link Google Drive" 
                value={catForm.iconUrl}
                onChange={e => setCatForm({...catForm, iconUrl: e.target.value})}
                className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-sm"
                required
              />
              <label className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'category')} />
              </label>
            </div>
            {catForm.iconUrl && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={catForm.iconUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> Cadastrar Categoria
            </button>
          </form>

          {/* List Categories */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Categorias Atuais</h3>
            <div className="grid grid-cols-1 gap-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100">
                      <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Add/Edit Business Form */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> Adicionar Empresa
            </h2>
          </div>
          <form onSubmit={handleAddBusiness} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome da Empresa" 
              value={bizForm.name}
              onChange={e => setBizForm({...bizForm, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              required
            />
            <select 
              value={bizForm.categoryId}
              onChange={e => setBizForm({...bizForm, categoryId: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              required
            >
              <option value="">Selecionar Categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <textarea 
              placeholder="Descrição" 
              value={bizForm.description}
              onChange={e => setBizForm({...bizForm, description: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              rows={3}
              required
            />
            <input 
              type="text" 
              placeholder="Endereço Completo" 
              value={bizForm.address}
              onChange={e => setBizForm({...bizForm, address: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              required
            />
            <div className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="URL da Foto ou Link Google Drive" 
                  value={bizForm.photos[0]}
                  onChange={e => setBizForm({...bizForm, photos: [e.target.value]})}
                  className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-sm"
                />
                <label className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'business')} />
                </label>
              </div>
              {bizForm.photos[0] && (
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={bizForm.photos[0]} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Link do Google Maps" 
              value={bizForm.mapsUrl}
              onChange={e => {
                const url = e.target.value;
                setBizForm({...bizForm, mapsUrl: url});
                const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                  setBizForm(prev => ({...prev, mapsUrl: url, lat: parseFloat(match[1]), lng: parseFloat(match[2])}));
                }
              }}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
            />
            <p className="text-[10px] text-gray-400 px-1 -mt-2">
              Dica: Use o link completo do navegador para preencher as coordenadas automaticamente. Links curtos (maps.app.goo.gl) não contêm coordenadas.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="number" 
                step="any"
                placeholder="Latitude" 
                value={bizForm.lat || ''}
                onChange={e => setBizForm({...bizForm, lat: parseFloat(e.target.value)})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              />
              <input 
                type="number" 
                step="any"
                placeholder="Longitude" 
                value={bizForm.lng || ''}
                onChange={e => setBizForm({...bizForm, lng: parseFloat(e.target.value)})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Telefone" 
                value={bizForm.phone}
                onChange={e => setBizForm({...bizForm, phone: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              />
              <input 
                type="text" 
                placeholder="WhatsApp (ex: 5511...)" 
                value={bizForm.whatsapp}
                onChange={e => setBizForm({...bizForm, whatsapp: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> Cadastrar Empresa
            </button>
          </form>
        </section>

        {/* Manage Businesses */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Gerenciar Empresas</h2>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar empresa..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            {businesses
              .filter(biz => biz.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(biz => (
              <div 
                key={biz.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/edit-business/${biz.id}`)}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-bold text-gray-900 truncate">{biz.name}</h4>
                  <p className="text-xs text-gray-500">{biz.isActive ? 'Ativo' : 'Bloqueado'}</p>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => navigate(`/admin/edit-business/${biz.id}`)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-xl"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(biz.id, biz.isActive)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      biz.isActive ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                    )}
                    title={biz.isActive ? "Bloquear" : "Desbloquear"}
                  >
                    {biz.isActive ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(biz.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-xl"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {businesses.filter(biz => biz.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Nenhuma empresa encontrada.</p>
            )}
          </div>
        </section>

        {/* Advertising Banners */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600" /> Publicidade (Banners)
          </h2>
          <form onSubmit={handleAddBanner} className="space-y-4 mb-8">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="URL do Banner ou Link Google Drive" 
                value={bannerForm.imageUrl}
                onChange={e => setBannerForm({...bannerForm, imageUrl: e.target.value})}
                className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-sm"
                required
              />
              <label className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
              </label>
            </div>
            {bannerForm.imageUrl && (
              <div className="w-full h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={bannerForm.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <input 
              type="text" 
              placeholder="Link de Destino (Opcional)" 
              value={bannerForm.link}
              onChange={e => setBannerForm({...bannerForm, link: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
            />
            <button 
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> Adicionar Banner
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Banners Atuais</h3>
            {banners.map(banner => (
              <div key={banner.id} className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{banner.link || 'Sem link'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleBanner(banner.id, banner.active)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      banner.active ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                    )}
                  >
                    {banner.active ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <p className="text-center text-gray-400 text-sm italic py-4">Nenhum banner cadastrado.</p>
            )}
          </div>
        </section>

        {/* Send Push Notification Form */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" /> Enviar Notificação (Push)
          </h2>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <select 
              value={notifForm.businessId}
              onChange={e => setNotifForm({...notifForm, businessId: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              required
            >
              <option value="">Selecionar Empresa</option>
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
            <textarea 
              placeholder="Mensagem da notificação..." 
              value={notifForm.message}
              onChange={e => setNotifForm({...notifForm, message: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm"
              rows={3}
              required
            />
            <button 
              type="submit"
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" /> Enviar Notificação
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
