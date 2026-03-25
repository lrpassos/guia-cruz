import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { 
  getBusinessById, 
  updateBusiness, 
  getCategories,
  deleteBusiness,
  updateBusinessStatus
} from '../services/firestore';
import { Category, Business } from '../types';
import { Building, CheckCircle, Trash2, ShieldAlert, ShieldCheck, Upload, X, MapPin, Save, ArrowLeft } from 'lucide-react';

export const EditBusinessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [biz, cats] = await Promise.all([
          getBusinessById(id),
          getCategories()
        ]);
        
        if (biz) {
          setBusiness(biz);
          setBizForm({
            name: biz.name,
            description: biz.description,
            categoryId: biz.categoryId,
            address: biz.address,
            phone: biz.phone || '',
            whatsapp: biz.whatsapp || '',
            mapsUrl: biz.mapsUrl || '',
            photos: biz.photos,
            lat: biz.lat || 0,
            lng: biz.lng || 0
          });
        }
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching business details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('A imagem é muito grande! Por favor, escolha uma imagem com menos de 500KB.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setBizForm({ ...bizForm, photos: [base64] });
    } catch (error) {
      console.error('Error converting file:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    try {
      await updateBusiness(id, bizForm);
      setSuccess('Empresa atualizada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !business) return;
    try {
      await updateBusinessStatus(id, !business.isActive);
      setBusiness({ ...business, isActive: !business.isActive });
      setSuccess(business.isActive ? 'Empresa bloqueada' : 'Empresa desbloqueada');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir esta empresa permanentemente?')) return;
    
    try {
      await deleteBusiness(id);
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="Carregando..." showBack backTo="/admin">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Acesso Negado" showBack backTo="/">
        <div className="p-8 text-center text-red-500 font-bold">Você não tem permissão para acessar esta página.</div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout title="Não Encontrado" showBack backTo="/admin">
        <div className="p-8 text-center text-gray-500">Empresa não encontrada.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Editar Empresa" showBack backTo="/admin">
      <div className="px-4 pt-6 space-y-6 pb-24">
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 border border-green-100 animate-bounce">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleToggleStatus}
              className={`p-2 rounded-xl transition-colors ${
                business.isActive ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
              }`}
              title={business.isActive ? "Bloquear" : "Desbloquear"}
            >
              {business.isActive ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 bg-red-100 text-red-600 rounded-xl"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome da Empresa</label>
              <input 
                type="text" 
                value={bizForm.name}
                onChange={e => setBizForm({...bizForm, name: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Categoria</label>
              <select 
                value={bizForm.categoryId}
                onChange={e => setBizForm({...bizForm, categoryId: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecionar Categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Descrição</label>
              <textarea 
                value={bizForm.description}
                onChange={e => setBizForm({...bizForm, description: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Endereço</label>
              <input 
                type="text" 
                value={bizForm.address}
                onChange={e => setBizForm({...bizForm, address: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Foto Principal</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="URL da Foto" 
                  value={bizForm.photos[0]}
                  onChange={e => setBizForm({...bizForm, photos: [e.target.value]})}
                  className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <label className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {bizForm.photos[0] && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mt-2">
                  <img src={bizForm.photos[0]} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Telefone</label>
                <input 
                  type="text" 
                  value={bizForm.phone}
                  onChange={e => setBizForm({...bizForm, phone: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  value={bizForm.whatsapp}
                  onChange={e => setBizForm({...bizForm, whatsapp: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Link Google Maps</label>
              <input 
                type="text" 
                value={bizForm.mapsUrl}
                onChange={e => setBizForm({...bizForm, mapsUrl: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Salvar Alterações
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
};
