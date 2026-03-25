import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBusinessById, getReviewsByBusiness, addReview, getCouponsByBusiness, addCheckIn } from '../services/firestore';
import { Business, Review, Coupon } from '../types';
import { Layout } from '../components/Layout';
import { Star, MapPin, Phone, MessageCircle, Send, Navigation, Info, Tag, Share2, QrCode, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export const BusinessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, login } = useAuth();
  const { settings } = useSettings();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showQr, setShowQr] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [biz, cpn] = await Promise.all([
        getBusinessById(id),
        getCouponsByBusiness(id)
      ]);
      setBusiness(biz);
      setCoupons(cpn);
      setLoading(false);
    };
    fetchData();

    const unsubscribe = getReviewsByBusiness(id, setReviews);
    return () => unsubscribe();
  }, [id]);

  const handleCheckIn = async () => {
    if (!user || !id) {
      login();
      return;
    }
    try {
      await addCheckIn(id, user.uid);
      setCheckedIn(true);
      setTimeout(() => setCheckedIn(false), 3000);
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const shareBusiness = (platform: string) => {
    const url = window.location.href;
    const text = `Confira ${business?.name} no ${settings?.appName || 'Guia Cruz'}!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;

    try {
      await addReview({
        businessId: id,
        userId: user.uid,
        userName: user.name,
        rating: newRating,
        comment: newComment
      });
      setNewComment('');
      setNewRating(5);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Carregando..." showBack>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout title="Não encontrado" showBack>
        <div className="p-8 text-center text-gray-500">Empresa não encontrada.</div>
      </Layout>
    );
  }

  return (
    <Layout title={business.name} showBack>
      {/* Photo Gallery (Simplified) */}
      <div className="h-64 bg-gray-200">
        <img 
          src={business.photos[0] || `https://picsum.photos/seed/${business.id}/800`} 
          alt={business.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-gray-700">{business.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({business.reviewCount} avaliações)</span>
              </div>
            </div>
            {business.isFeatured && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                Destaque
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all">
                <Phone className="w-4 h-4" /> Ligar
              </a>
            )}
            {business.whatsapp && (
              <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button 
              onClick={handleCheckIn}
              disabled={checkedIn}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95",
                checkedIn ? "bg-green-50 text-green-600 border border-green-100" : "bg-blue-50 text-blue-600 border border-blue-100"
              )}
            >
              {checkedIn ? <CheckCircle2 className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
              {checkedIn ? 'Check-in Realizado!' : 'Fazer Check-in'}
            </button>
            <button 
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-3 rounded-2xl font-bold text-sm border border-gray-100 active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
          </div>

          {showQr && (
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl flex flex-col items-center animate-in fade-in slide-in-from-top-4">
              <h4 className="text-sm font-bold text-gray-700 mb-4">Compartilhe ou Escaneie</h4>
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <QRCodeSVG value={window.location.href} size={150} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => shareBusiness('whatsapp')} className="p-3 bg-green-50 rounded-full text-green-600"><MessageCircle className="w-6 h-6" /></button>
                <button onClick={() => shareBusiness('facebook')} className="p-3 bg-blue-50 rounded-full text-blue-600"><Share2 className="w-6 h-6" /></button>
                <button onClick={() => shareBusiness('twitter')} className="p-3 bg-sky-50 rounded-full text-sky-600"><Share2 className="w-6 h-6" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coupons Section */}
      {coupons.length > 0 && (
        <section className="mt-8 px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" /> Cupons & Promoções
          </h3>
          <div className="space-y-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-blue-50 border-2 border-dashed border-blue-200 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full"></div>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full"></div>
                <h4 className="font-bold text-blue-900">{coupon.title}</h4>
                <p className="text-xs text-blue-700 mt-1">{coupon.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="bg-white px-3 py-1 rounded-lg font-mono font-bold text-blue-600 border border-blue-100">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium">
                    Expira em: {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="mt-8 px-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" /> Sobre
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {business.description}
        </p>
      </section>

      {/* Location */}
      <section className="mt-8 px-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-400" /> Localização
        </h3>
        <p className="text-gray-600 text-sm mb-4">{business.address}</p>
        <div className="h-64 bg-gray-100 rounded-2xl overflow-hidden relative">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${business.lat && business.lng ? `${business.lat},${business.lng}` : encodeURIComponent(business.address)}`}
          ></iframe>
          {/* Fallback if no API key is provided or if it fails */}
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
            src={`https://maps.google.com/maps?q=${business.lat && business.lng ? `${business.lat},${business.lng}` : encodeURIComponent(business.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          ></iframe>
          <a 
            href={business.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${business.lat && business.lng ? `${business.lat},${business.lng}` : encodeURIComponent(business.address)}`}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg font-bold text-xs flex items-center gap-2"
          >
            <Navigation className="w-3 h-3" /> Como chegar
          </a>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-8 px-4 pb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Avaliações</h3>
        
        {user ? (
          <form onSubmit={handleSubmitReview} className="bg-white p-4 rounded-2xl border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setNewRating(star)}
                >
                  <Star className={cn("w-6 h-6", star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                </button>
              ))}
            </div>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="O que você achou desta empresa?"
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              rows={3}
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="mt-3 w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Enviar Avaliação
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 p-6 rounded-2xl text-center mb-6">
            <p className="text-sm text-gray-500 mb-3">Faça login para avaliar esta empresa.</p>
            <button onClick={login} className="text-blue-600 font-bold text-sm">Entrar agora</button>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{review.userName}</h4>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={cn("w-2.5 h-2.5", star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-400 text-sm italic py-4">Seja o primeiro a avaliar!</p>
          )}
        </div>
      </section>
    </Layout>
  );
};
