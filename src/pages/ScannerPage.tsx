import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import QrScanner from 'react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: any) => {
    if (data) {
      const url = data.text;
      if (url.includes('/business/')) {
        const id = url.split('/business/')[1];
        navigate(`/business/${id}`);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError('Não foi possível acessar a câmera. Verifique as permissões.');
  };

  return (
    <Layout title="Escanear QR Code" showBack>
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <div className="w-full max-w-xs aspect-square bg-black rounded-3xl overflow-hidden relative border-4 border-blue-600 shadow-2xl">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-2xl animate-pulse"></div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900">Aponte para o QR Code</h3>
          <p className="text-gray-500 text-sm mt-2">Escaneie o código no estabelecimento para fazer check-in e ganhar pontos.</p>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4" /> {error}
          </div>
        )}
      </div>
    </Layout>
  );
};
