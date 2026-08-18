import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LIVE_ACTIVITIES = [
  { clinic: 'Happy Smiles Dental, Makati', action: 'booked an appointment', time: '2 min ago', avatar: 'HS', color: '#14b8a6' },
  { clinic: 'Bright Dental Clinic, QC', action: 'sent 12 SMS reminders', time: '5 min ago', avatar: 'BD', color: '#6366f1' },
  { clinic: 'CebuSmile Dental Group', action: 'completed patient charting', time: '8 min ago', avatar: 'CS', color: '#f43f5e' },
  { clinic: 'Dr. Cruz Dental, BGC', action: 'received chatbot booking', time: '11 min ago', avatar: 'DC', color: '#f59e0b' },
  { clinic: 'PediDental Clinic, Pasig', action: 'generated prescription', time: '14 min ago', avatar: 'PC', color: '#8b5cf6' },
];

export default function LiveNotifications() {
  const [liveNotifications, setLiveNotifications] = useState([]);

  /* Cycle through live notifications */
  useEffect(() => {
    const showNotification = () => {
      const randomActivity = LIVE_ACTIVITIES[Math.floor(Math.random() * LIVE_ACTIVITIES.length)];
      const id = Date.now();
      setLiveNotifications(prev => [...prev, { ...randomActivity, id }]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setLiveNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    // Show first notification after 3 seconds, then every 8-12 seconds
    const initialDelay = setTimeout(showNotification, 3000);
    const interval = setInterval(() => {
      showNotification();
    }, 8000 + Math.random() * 4000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {liveNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/60 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center gap-3 min-w-[320px] max-w-[360px]"
          >
            {/* Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[12px] shrink-0"
              style={{ backgroundColor: notif.color }}
            >
              {notif.avatar}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-on-background font-semibold truncate">{notif.clinic}</p>
              <p className="text-[11px] text-on-surface-variant">{notif.action}</p>
            </div>
            {/* Time & Pulse */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-on-surface-variant font-semibold">{notif.time}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
