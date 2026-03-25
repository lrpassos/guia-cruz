import { useState, useEffect } from 'react';
import { getAppSettings } from '../services/firestore';
import { AppSettings } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Guia Cruz',
    appLogo: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};
