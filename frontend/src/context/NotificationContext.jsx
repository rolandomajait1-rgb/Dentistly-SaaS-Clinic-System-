import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();


const DEFAULT_NOTIFICATIONS = [
  {
    id: 'mock-1',
    title: 'New Facebook Booking Request',
    description: 'Juan Dela Cruz requested Teeth Cleaning for today at 10:00 AM.',
    time: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    type: 'appointment_pending',
    read: false,
    icon: 'chat',
    actionTab: 'overview',
  },
  {
    id: 'mock-2',
    title: 'Google Calendar Synced',
    description: 'Clinic schedule has been synced with Google Calendar.',
    time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    type: 'system',
    read: true,
    icon: 'sync',
    actionTab: 'settings',
  },
  {
    id: 'mock-3',
    title: 'Facebook Chatbot Connected',
    description: 'Clinic Facebook Page connection verified and listening for webhooks.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: 'system',
    read: true,
    icon: 'facebook',
    actionTab: 'settings',
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch (e) {
      console.error('Error parsing clinic_notifications:', e);
      localStorage.removeItem('clinic_notifications');
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState([]);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Add toast alert to stack
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  // Remove toast from stack
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add persistent notification
  const addNotification = useCallback((title, description, type = 'info', icon = 'notifications', actionTab = null, appointmentId = null) => {
    setNotifications((prev) => {
      // Prevent duplicate notifications for the same appointment ID
      if (appointmentId && prev.some(n => n.appointmentId === appointmentId)) {
        return prev;
      }

      const id = Math.random().toString(36).substring(2, 9);
      const newNotif = {
        id,
        title,
        description,
        time: new Date().toISOString(),
        type,
        read: false,
        icon,
        actionTab,
        appointmentId,
      };
      
      // Auto-trigger a toast when a new notification comes in
      let toastType = 'info';
      if (type === 'appointment_approved' || type === 'success') toastType = 'success';
      if (type === 'appointment_cancelled' || type === 'error') toastType = 'error';
      if (type === 'appointment_pending' || type === 'warning') toastType = 'warning';
      
      showToast(`${title}: ${description}`, toastType);

      return [newNotif, ...prev];
    });
  }, [showToast]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  }, [showToast]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    showToast('Notifications history cleared', 'info');
  }, [showToast]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        toasts
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// ─── Toast Container & Item Components ──────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        .toasts-stack-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          pointer-events: none;
          max-width: 380px;
          width: calc(100% - 48px);
        }
        .toast-item {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 30px rgba(0, 78, 71, 0.08);
          border-left: 4px solid var(--toast-accent);
          transform-origin: bottom right;
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.3s ease;
        }
        .toast-item.dismissing {
          animation: toastSlideOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes toastSlideIn {
          from {
            transform: translateX(80px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(80px) scale(0.9);
            opacity: 0;
          }
        }
        .toast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--toast-accent);
          opacity: 0.6;
          animation: toastProgress linear forwards;
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="toasts-stack-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleClose = useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => onRemove(toast.id), 250);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(handleClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, handleClose]);

  const config = {
    success: { accent: '#006a61', bgIcon: '#e5f6f4', colorIcon: '#004e47', icon: 'check_circle' },
    error: { accent: '#ba1a1a', bgIcon: '#ffdad6', colorIcon: '#ba1a1a', icon: 'error' },
    warning: { accent: '#d97706', bgIcon: '#fef3c7', colorIcon: '#b45309', icon: 'warning' },
    info: { accent: '#556379', bgIcon: '#eff4ff', colorIcon: '#3a485c', icon: 'info' }
  }[toast.type] || { accent: '#004e47', bgIcon: '#e5f6f4', colorIcon: '#004e47', icon: 'info' };

  return (
    <div
      className={`toast-item ${isDismissing ? 'dismissing' : ''} p-4 rounded-xl flex items-start gap-3 relative overflow-hidden`}
      style={{ '--toast-accent': config.accent }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: config.bgIcon }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1", color: config.colorIcon }}
        >
          {config.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className="text-xs font-semibold leading-relaxed text-on-background wrap-break-word">
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-on-surface-variant/40 hover:text-on-surface hover:bg-black/5 rounded p-0.5 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
      </button>

      <div
        className="toast-progress-bar"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}
