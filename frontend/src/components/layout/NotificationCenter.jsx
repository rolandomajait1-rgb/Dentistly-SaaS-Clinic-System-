import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/time';
import { updateAppointmentStatus } from '../../api';
import {
  BellSlash,
  CheckCircle,
  XCircle,
  Clock,
  Chat,
  ArrowsClockwise,
  Check,
  CircleNotch,
} from '@phosphor-icons/react';

export default function NotificationCenter({ isOpen, onClose, setActiveTab }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    showToast,
  } = useNotifications();

  const [activeTab, setLocalActiveTab] = useState('all'); // 'all', 'unread'
  const [loadingId, setLoadingId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click was on the bell button to avoid double toggle
        if (!event.target.closest('.notification-bell-btn')) {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications
  const displayedNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  // Handle clicking a notification
  const handleItemClick = (n) => {
    markAsRead(n.id);
    if (n.actionTab) {
      setActiveTab(n.actionTab);
    }
  };

  // Inline approval actions
  const handleApprove = async (e, n) => {
    e.stopPropagation(); // prevent triggering item click
    setLoadingId(n.id);
    
    try {
      if (n.appointmentId) {
        // Real database appointment approval
        await updateAppointmentStatus(n.appointmentId, 'Approved');
        showToast('Appointment approved successfully!', 'success');
      } else {
        // Mock appointment approval helper (for demo data)
        await new Promise((resolve) => setTimeout(resolve, 800));
        showToast('Mock appointment approved successfully!', 'success');
      }
      
      // Update notification text in the UI to reflect it is approved
      n.read = true;
      n.type = 'appointment_approved';
      n.title = 'Appointment Confirmed';
      n.description = n.description.replace('requested', 'confirmed for') + ' (Approved)';
      n.icon = 'check_circle';
      
    } catch (err) {
      console.error(err);
      showToast('Error approving appointment: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (e, n) => {
    e.stopPropagation();
    setLoadingId(n.id);
    
    try {
      if (n.appointmentId) {
        await updateAppointmentStatus(n.appointmentId, 'Cancelled');
        showToast('Appointment declined/cancelled.', 'info');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        showToast('Mock appointment declined/cancelled.', 'info');
      }
      
      n.read = true;
      n.type = 'appointment_cancelled';
      n.title = 'Appointment Declined';
      n.description = n.description.replace('requested', 'declined for') + ' (Cancelled)';
      n.icon = 'cancel';
      
    } catch (err) {
      console.error(err);
      showToast('Error updating appointment: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  // Get icon and color styling based on notification type/icon name
  const getIconConfig = (iconName, type) => {
    let bg = 'bg-surface-container';
    let color = 'text-on-surface-variant';
    let IconComponent = Clock;

    if (type === 'appointment_approved') {
      bg = 'bg-[#e5f6f4]'; color = 'text-primary'; IconComponent = CheckCircle;
    } else if (type === 'appointment_cancelled') {
      bg = 'bg-error-container'; color = 'text-error'; IconComponent = XCircle;
    } else if (type === 'appointment_pending') {
      bg = 'bg-[#fdf6e3]'; color = 'text-amber-700'; IconComponent = Clock;
    } else if (iconName === 'chat' || iconName === 'facebook') {
      bg = 'bg-[#eff4ff]'; color = 'text-[#1877f2]'; IconComponent = Chat;
    } else if (iconName === 'sync') {
      bg = 'bg-surface-container-high'; color = 'text-primary'; IconComponent = ArrowsClockwise;
    }

    return { bg, color, IconComponent };
  };

  return (
    <>
      <style>{`
        .notification-dropdown-panel {
          position: absolute;
          top: 60px;
          right: 0;
          width: 380px;
          max-height: 520px;
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 16px 40px rgba(0, 78, 71, 0.08);
          z-index: 1000;
          transform-origin: top right;
          animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes dropdownSlideIn {
          from {
            transform: scale(0.95) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .notification-dropdown-panel {
            position: fixed;
            top: 64px;
            left: 12px;
            right: 12px;
            width: calc(100% - 24px);
            max-height: calc(100vh - 80px);
          }
        }

        .notification-item-row {
          transition: background-color 0.15s ease;
        }
        .notification-item-row:hover {
          background-color: rgba(0, 78, 71, 0.03);
        }
        
        .notification-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
        }
      `}</style>

      <div ref={dropdownRef} className="notification-dropdown-panel overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-on-surface text-base">Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              disabled={notifications.filter(n => !n.read).length === 0}
              className="text-[10px] font-bold tracking-wider uppercase text-primary hover:underline disabled:opacity-40 cursor-pointer"
            >
              Mark all read
            </button>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant hover:text-error disabled:opacity-40 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex px-3 bg-surface-bright/50 border-b border-outline-variant/50 shrink-0">
          <button
            onClick={() => setLocalActiveTab('all')}
            className={`flex-1 py-2 text-center text-[10px] font-extrabold tracking-widest uppercase border-b-2 cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setLocalActiveTab('unread')}
            className={`flex-1 py-2 text-center text-[10px] font-extrabold tracking-widest uppercase border-b-2 cursor-pointer transition-all ${
              activeTab === 'unread'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-outline-variant/30">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center text-on-surface-variant flex flex-col items-center justify-center">
              <BellSlash size={40} weight="duotone" className="text-outline-variant/60 mb-2" />
              <p className="text-sm font-semibold">All caught up! 🎉</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">No notifications to display.</p>
            </div>
          ) : (
            displayedNotifications.map((notif) => {
              const { bg, color, IconComponent } = getIconConfig(notif.icon, notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`notification-item-row p-4 flex gap-3 cursor-pointer relative ${
                    !notif.read ? 'bg-primary/2' : ''
                  }`}
                >
                  {/* Left Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <IconComponent size={18} weight="duotone" className={color} />
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-xs font-extrabold text-on-surface truncate pr-2">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/70 shrink-0 mt-0.5 font-medium">
                        {formatRelativeTime(notif.time)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-normal wrap-break-word">
                      {notif.description}
                    </p>

                    {/* Inline action buttons for pending appointments */}
                    {notif.type === 'appointment_pending' && (
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleApprove(e, notif)}
                          disabled={loadingId === notif.id}
                          className="px-3 py-1 bg-primary text-white text-[10px] font-black tracking-wider uppercase rounded-lg hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {loadingId === notif.id ? (
                            <CircleNotch size={12} weight="bold" className="animate-spin" />
                          ) : (
                            <Check size={12} weight="bold" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={(e) => handleDecline(e, notif)}
                          disabled={loadingId === notif.id}
                          className="px-3 py-1 border border-outline text-on-surface-variant text-[10px] font-extrabold tracking-wider uppercase rounded-lg hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Unread Glow Indicator */}
                  {!notif.read && (
                    <div className="absolute right-4 bottom-4">
                      <div className="notification-unread-dot" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-outline-variant bg-surface-bright flex justify-center shrink-0">
          <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">
            Dental Appointment Webhook Live
          </span>
        </div>
      </div>
    </>
  );
}
