import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { updateAppointmentStatus } from '../../api';

// Format time to match Figma design (e.g. "9:18 AM", "Yesterday", or "Oct 6")
function formatTimeDisplay(dateString) {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// Category icon badges according to Figma specification
function renderNotificationBadge(type, title = '', iconName = '') {
  const t = (type || '').toLowerCase();
  const tit = (title || '').toLowerCase();

  // 1. Red Badge (No-show, Cancellation, Declined)
  if (t.includes('cancel') || tit.includes('no-show') || tit.includes('cancellation')) {
    return {
      bg: '#FEE2E2',
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="5" r="3" stroke="#B91C1C" strokeWidth="1.3" />
          <path d="M3 13C3 10.79 5.24 9 8 9C9.1 9 10.1 9.3 10.9 9.8" stroke="#B91C1C" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M11.5 12.5H14.5" stroke="#B91C1C" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  // 2. Purple Badge (Patient Escalation, Chatbot, Inquiries, Admin review)
  if (
    t.includes('chat') ||
    tit.includes('escalat') ||
    tit.includes('chatbot') ||
    tit.includes('inquiry') ||
    iconName === 'chat' ||
    iconName === 'facebook'
  ) {
    return {
      bg: '#EDE9FE',
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.33 8.67C13.33 11 10.95 12.67 8 12.67C7.1 12.67 6.25 12.5 5.5 12.2L2.67 13L3.45 10.5C2.95 9.95 2.67 9.3 2.67 8.67C2.67 6.34 5.05 4.67 8 4.67C10.95 4.67 13.33 6.34 13.33 8.67Z"
            stroke="#7C3AED"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };
  }

  // 3. Green Badge (Check-in, Approved, Confirmed, Completed)
  if (
    t.includes('approved') ||
    tit.includes('check-in') ||
    tit.includes('confirmed') ||
    tit.includes('completed')
  ) {
    return {
      bg: '#D1FAE5',
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.33 4.67L6.33 11.67L3 8.33"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };
  }

  // 4. Blue Badge (Subscription, Plan expiring, System announcements)
  if (
    t.includes('subscription') ||
    tit.includes('expir') ||
    tit.includes('plan') ||
    t.includes('system') ||
    iconName === 'sync'
  ) {
    return {
      bg: '#DBEAFE',
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3.33" width="12" height="9.33" rx="1.5" stroke="#1D4ED8" strokeWidth="1.3" />
          <path d="M2 6.67H14" stroke="#1D4ED8" strokeWidth="1.3" />
          <path d="M5 10H7" stroke="#1D4ED8" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  // 5. Amber Badge (Pending requests, default)
  return {
    bg: '#FEF3C7',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="5.33" stroke="#D97706" strokeWidth="1.3" />
        <path d="M8 5.33V8L10 10" stroke="#D97706" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  };
}

export default function NotificationCenter({ isOpen, onClose, setActiveTab }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    showToast,
    updateNotification,
    refreshNotifications,
  } = useNotifications();

  const [loadingId, setLoadingId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'history'
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle clicking a notification
  const handleItemClick = (n) => {
    markAsRead(n.id);
    if (n.actionTab) {
      setActiveTab(n.actionTab);
    }
    onClose();
  };

  // Inline approval actions for pending appointments
  const handleApprove = async (e, n) => {
    e.stopPropagation();
    setLoadingId(n.id);
    try {
      if (n.appointmentId) {
        await updateAppointmentStatus(n.appointmentId, 'Approved');
        showToast('Appointment approved successfully!', 'success');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
        showToast('Appointment approved successfully!', 'success');
      }
      updateNotification(n.id, {
        read: true,
        type: 'appointment_approved',
        title: 'Appointment Confirmed',
        description: n.description.replace('requested', 'confirmed for') + ' (Approved)',
      });
      if (refreshNotifications) setTimeout(refreshNotifications, 800);
    } catch (err) {
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
        await new Promise((resolve) => setTimeout(resolve, 600));
        showToast('Appointment declined/cancelled.', 'info');
      }
      updateNotification(n.id, {
        read: true,
        type: 'appointment_cancelled',
        title: 'Appointment Declined',
        description: n.description.replace('requested', 'declined for') + ' (Cancelled)',
      });
      if (refreshNotifications) setTimeout(refreshNotifications, 800);
    } catch (err) {
      showToast('Error updating appointment: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const displayedNotifications =
    filterMode === 'history'
      ? notifications
      : notifications.slice(0, 8);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[calc(100%+12px)] right-0 z-50 flex flex-col bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.10),0px_0px_4px_rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden border border-black/5 animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{
        width: 568,
        maxWidth: 'calc(100vw - 24px)',
        paddingTop: 15,
        paddingBottom: 15,
      }}
    >
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingLeft: 25,
          paddingRight: 25,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {/* Title + Unread Count Badge */}
        <div className="flex items-center gap-2.5">
          <span
            style={{
              color: '#0E3F39',
              fontSize: 14,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '700',
              lineHeight: '20px',
            }}
          >
            Notification
          </span>

          {unreadCount > 0 && (
            <div
              style={{
                width: 16,
                height: 16,
                background: '#E05252',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '700',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Actions on right: Mark all read + Close button */}
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-2.5 py-1 rounded-[10px] transition-colors cursor-pointer disabled:opacity-40 hover:bg-[#1A8A7A]/10"
            style={{
              color: '#1A8A7A',
              fontSize: 12,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '500',
              lineHeight: '16px',
            }}
          >
            Mark all read
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3L11 11M11 3L3 11" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Notification List ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 max-h-[460px] overflow-y-auto">
        {displayedNotifications.length === 0 ? (
          <div className="py-12 px-6 text-center text-[#99A1AF] flex flex-col items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" className="mb-2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-xs font-semibold text-[#1E2939]">All caught up!</p>
            <p className="text-[11px] text-[#99A1AF] mt-0.5">No notifications to display.</p>
          </div>
        ) : (
          displayedNotifications.map((notif) => {
            const badge = renderNotificationBadge(notif.type, notif.title, notif.icon);
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`w-full flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#F3F6FD]/70 ${
                  isUnread ? 'bg-[#F7F9FF]' : 'bg-white'
                }`}
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Left Category Icon Container */}
                <div className="pt-0.5 shrink-0">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: badge.bg,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {badge.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Title */}
                  <div className="w-full flex justify-between items-start gap-2">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: isUnread ? '600' : '500',
                        lineHeight: '16.5px',
                        wordWrap: 'break-word',
                      }}
                    >
                      {notif.title}
                    </span>
                  </div>

                  {/* Description */}
                  {notif.description && (
                    <div
                      style={{
                        paddingTop: 2,
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                        wordWrap: 'break-word',
                      }}
                    >
                      {notif.description}
                    </div>
                  )}

                  {/* Inline Approve/Decline for Pending Appointments */}
                  {notif.type === 'appointment_pending' && (
                    <div className="flex items-center gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleApprove(e, notif)}
                        disabled={loadingId === notif.id}
                        className="px-2.5 py-1 bg-[#0E3F39] text-white text-[11px] font-semibold rounded-md hover:bg-[#1A5C54] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loadingId === notif.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={(e) => handleDecline(e, notif)}
                        disabled={loadingId === notif.id}
                        className="px-2.5 py-1 border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    style={{
                      paddingTop: 6,
                      color: '#99A1AF',
                      fontSize: 12,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '400',
                      lineHeight: '16px',
                      wordWrap: 'break-word',
                    }}
                  >
                    {formatTimeDisplay(notif.time)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <div
        className="w-full flex items-center justify-center shrink-0"
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 12,
          paddingBottom: 12,
          borderTop: '1.33px solid #F3F4F6',
        }}
      >
        <button
          onClick={() => setFilterMode((prev) => (prev === 'all' ? 'history' : 'all'))}
          className="text-center transition-colors cursor-pointer hover:text-[#1A8A7A]"
          style={{
            color: '#9CA3AF',
            fontSize: 12,
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: '500',
            lineHeight: '16px',
            wordWrap: 'break-word',
          }}
        >
          {filterMode === 'history' ? 'Show recent notifications' : 'View notification history'}
        </button>
      </div>
    </div>
  );
}
