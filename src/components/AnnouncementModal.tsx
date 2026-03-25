import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { getActiveAnnouncement } from '../services/firestore';
import { Announcement } from '../types';

export const AnnouncementModal: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAnnouncement = async () => {
      try {
        const active = await getActiveAnnouncement();
        if (!active || !active.active) return;

        // Frequency Control: Show once per day, or if the announcement has been updated
        const lastShownDate = localStorage.getItem('last_announcement_shown_date');
        const lastShownUpdate = localStorage.getItem('last_announcement_updated_at');
        const today = new Date().toDateString();

        if (lastShownDate === today && lastShownUpdate === active.updatedAt) {
          return;
        }

        setAnnouncement(active);
        setIsOpen(true);
        
        localStorage.setItem('last_announcement_shown_date', today);
        localStorage.setItem('last_announcement_updated_at', active.updatedAt);
      } catch (error) {
        console.error('Error checking announcement:', error);
      }
    };

    checkAnnouncement();
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && announcement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border border-gray-800"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container (1:1 Aspect Ratio) */}
            <div className="aspect-square w-full bg-gray-800 overflow-hidden">
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* CTA Button (Optional) */}
            {announcement.link && (
              <div className="p-6 pt-4">
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                >
                  Ver Oferta <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
