import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ScheduleCalendar from './pages/dashboard/ScheduleCalendar';
import QueueManager from './pages/dashboard/QueueManager';
import PatientRecords from './pages/dashboard/PatientRecords';
import ReportsAnalytics from './pages/dashboard/ReportsAnalytics';
import StaffUsers from './pages/dashboard/StaffUsers';
import ClinicSettings from './pages/dashboard/settings/ClinicSettings';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import PublicBookingPortal from './pages/booking/PublicBookingPortal';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import { logout, verifyEmail } from './api';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import NotificationCenter from './components/layout/NotificationCenter';
import ConfirmModal from './components/ui/ConfirmModal';
import assets from './assets';


const NAV_ITEMS = [
  { id: 'overview',  label: 'Dashboard',           icon: 'dashboard' },
  { id: 'schedule',  label: 'Appointments',        icon: 'calendar_month' },
  { id: 'patients',  label: 'Patients',            icon: 'clinical_notes' },
  { id: 'reports',   label: 'Reports & Analytics', icon: 'analytics' },
  { id: 'staff',     label: 'Staff & Users',       icon: 'group' },
  { id: 'settings',  label: 'Clinic Settings',     icon: 'settings' },
];

export function AppContent() {
  const { unreadCount, showToast } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerifiedSuccessModal, setShowVerifiedSuccessModal] = useState(false);
  const [verifyErrorModal, setVerifyErrorModal] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/superadmin')) {
      return 'superadmin';
    }
    if (path.startsWith('/book/')) {
      return 'public-booking';
    }
    const saved = localStorage.getItem('user');
    return saved ? 'dashboard' : 'landing';
  });

  useEffect(() => {
    if (view !== 'landing' && theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, view]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [clinic, setClinic] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing clinic from localStorage:', e);
      localStorage.removeItem('clinic');
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      return 'settings';
    }
    return 'overview';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showWizard, setShowWizard] = useState(() => {
    const savedClinic = localStorage.getItem('clinic');
    if (!savedClinic) return false;
    try {
      const parsed = JSON.parse(savedClinic);
      const completed = localStorage.getItem(`onboarding_completed_${parsed.id}`);
      if (completed === 'true') return false;
      const hasSetup = parsed.notification_settings?.chatbot_welcome_template;
      return !hasSetup;
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = (data) => {
    setUser(data.user);
    setClinic(data.clinic);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('clinic', JSON.stringify(data.clinic));
    localStorage.setItem('token', data.token);

    // Check if new clinic needs onboarding
    const completed = localStorage.getItem(`onboarding_completed_${data.clinic.id}`);
    const hasSetup = data.clinic.notification_settings?.chatbot_welcome_template;
    if (completed !== 'true' && !hasSetup) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }

    setView('dashboard');
  };

  /* Email Verification Token Detector */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const isVerifyPath = window.location.pathname.startsWith('/verify-email') || params.has('token');

    if (token && isVerifyPath) {
      // Clear token from browser URL cleanly without reload
      window.history.replaceState({}, document.title, window.location.pathname.startsWith('/verify-email') ? '/' : window.location.pathname);

      verifyEmail(token)
        .then((data) => {
          handleLoginSuccess(data);
          setShowVerifiedSuccessModal(true);
          showToast('Email verified successfully! Welcome to Pivodent.', 'success');
        })
        .catch((err) => {
          setVerifyErrorModal(err.message || 'The email verification link is invalid or has expired.');
          showToast(err.message || 'Verification failed.', 'error');
        });
    }
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setClinic(null);
      localStorage.removeItem('user');
      localStorage.removeItem('clinic');
      localStorage.removeItem('token');
      setView('landing');
    }
  };

  const triggerLogout = () => {
    setShowLogoutConfirm(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview 
            clinicId={clinic?.id} 
            setActiveTab={setActiveTab}
            user={user}
          />
        );
      case 'schedule':
        return (
          <ScheduleCalendar 
            clinicId={clinic?.id} 
            user={user}
          />
        );
      case 'queue':
        return (
          <QueueManager 
            clinicId={clinic?.id} 
          />
        );
      case 'patients':
        return (
          <PatientRecords 
            clinicId={clinic?.id} 
            user={user}
          />
        );
      case 'reports':
        return (
          <ReportsAnalytics 
            clinicId={clinic?.id} 
            user={user}
          />
        );
      case 'staff':
        return (
          <StaffUsers 
            clinicId={clinic?.id} 
            user={user}
          />
        );
      case 'settings':
        return (
          <ClinicSettings 
            clinicId={clinic?.id}
            onClinicUpdate={(updatedClinic) => {
              setClinic(updatedClinic);
              localStorage.setItem('clinic', JSON.stringify(updatedClinic));
            }}
            onLaunchWizard={() => {
              sessionStorage.setItem('onboarding_step', '1');
              setShowWizard(true);
            }}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-400">
            <h3 className="text-xl font-bold">Tab not found</h3>
          </div>
        );
    }
  };

  const getPageHeaderTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview Dashboard';
      case 'schedule': return 'Appointments';
      case 'queue': return 'Queue Console';
      case 'patients': return 'Patients';
      case 'reports': return 'Reports & Analytics';
      case 'staff': return 'Users';
      case 'settings': return 'Clinic Profile & API Config';
      default: return 'Dashboard';
    }
  };

  const renderModals = () => (
    <>
      {/* EMAIL VERIFICATION SUCCESS MODAL */}
      {showVerifiedSuccessModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 sm:p-9 max-w-[390px] w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.18)] relative border border-slate-100/80 flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={() => setShowVerifiedSuccessModal(false)}
              className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pivodent Logo */}
            <div className="mb-5 mt-2">
              <img src={assets.pivodentLogo} alt="Pivodent" className="h-14 w-auto object-contain mx-auto" />
            </div>

            {/* Title */}
            <h3 className="text-[22px] font-bold text-[#004E47] mb-1.5 tracking-tight leading-snug">
              Registered Successfully!
            </h3>
            
            <p className="text-[13px] text-slate-600 mb-7 font-medium">
              Your email has been verified. Welcome to Pivodent!
            </p>

            {/* Checkmark Action Button */}
            <button
              onClick={() => setShowVerifiedSuccessModal(false)}
              className="bg-[#00B074] hover:bg-[#009e68] active:bg-[#008c5c] text-white w-36 h-11 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,176,116,0.35)] hover:shadow-[0_6px_18px_rgba(0,176,116,0.45)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* VERIFY ERROR MODAL */}
      {verifyErrorModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-[390px] w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.18)] relative border border-slate-100 flex flex-col items-center">
            <button
              onClick={() => setVerifyErrorModal('')}
              className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 mt-2">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-[20px] font-bold text-slate-900 mb-2">
              Verification Failed
            </h3>
            <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
              {verifyErrorModal}
            </p>

            <button
              onClick={() => {
                setVerifyErrorModal('');
                setView('login');
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white w-full h-11 rounded-full font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (view === 'superadmin') {
    return (
      <>
        {renderModals()}
        <SuperadminDashboard />
      </>
    );
  }

  if (view === 'public-booking') {
    return (
      <>
        {renderModals()}
        <PublicBookingPortal />
      </>
    );
  }

  if (view === 'landing') {
    return (
      <>
        {renderModals()}
        <LandingPage
          onLogin={() => setView('login')}
          onGetStarted={() => setView('register')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </>
    );
  }

  if (view === 'login') {
    return (
      <>
        {renderModals()}
        <LoginPage
          onLogin={handleLoginSuccess}
          onBack={() => setView('landing')}
          onSwitchToRegister={() => setView('register')}
        />
      </>
    );
  }

  if (view === 'register') {
    return (
      <>
        {renderModals()}
        <RegisterPage
          onRegister={handleLoginSuccess}
          onBack={() => setView('landing')}
          onSwitchToLogin={() => setView('login')}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      {renderModals()}
      {showWizard && (
        <OnboardingWizard 
          clinicData={clinic} 
          onComplete={() => {
            setShowWizard(false);
            localStorage.setItem(`onboarding_completed_${clinic?.id}`, 'true');
            window.location.reload();
          }}
        />
      )}
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={triggerLogout}
        clinic={clinic}
        user={user}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-[#0a100f] shadow-2xl border-r border-outline-variant/40">
            {/* Close button inside drawer */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Sidebar navigation list inside drawer */}
            <div className="flex-1 flex flex-col h-full pt-12 pb-4 overflow-y-auto">
              <div className="px-6 pb-4 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/20 overflow-hidden">
                  <img src={assets.pivodentLogo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h1 className="font-extrabold text-primary dark:text-[#85d5c9] tracking-tight leading-none text-lg">
                    {clinic?.clinic_name || 'Happy Smiles'}
                  </h1>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mt-0.5">
                    Dental System
                  </p>
                </div>
              </div>

              <nav className="flex-1 space-y-0.5 px-3 pt-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-primary/5 text-primary dark:bg-primary-container/10 dark:text-[#85d5c9] font-black'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-outline-variant/30 px-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    triggerLogout();
                  }}
                  className="w-full flex items-center gap-2 justify-center py-3 text-[11px] font-bold tracking-wider uppercase text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-all duration-150 cursor-pointer"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content body */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative" style={{ background: '#F0F4F3' }}>

        {/* ── Top App Bar ── */}
        <header
          className="flex justify-between items-center w-full px-8 shrink-0 z-40 bg-white"
          style={{ height: 76, borderBottom: '1px rgba(0, 0, 0, 0.10) solid' }}
        >
          {/* Mobile menu toggle (hidden on desktop) */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <span
                style={{
                  color: '#99A1AF',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  lineHeight: '16px',
                }}
              >
                clinic owner
              </span>
              <span
                style={{
                  color: '#0E3F39',
                  fontSize: 18,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '600',
                  lineHeight: '28px',
                }}
              >
                {getPageHeaderTitle()}
              </span>
            </div>
          </div>

          {/* Page Title (desktop) */}
          <div className="hidden md:flex flex-col">
            <span
              style={{
                color: '#99A1AF',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: '500',
                textTransform: 'uppercase',
                lineHeight: '16px',
              }}
            >
              clinic owner
            </span>
            <h2
              style={{
                color: '#0E3F39',
                fontSize: 18,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: '600',
                lineHeight: '28px',
              }}
            >
              {getPageHeaderTitle()}
            </h2>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-5 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-bell-btn p-2 hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer flex items-center justify-center"
                aria-label="Notifications"
              >
                <img src={assets.iconBell} alt="Notifications" className="w-[18px] h-[18px] object-contain" />
                {/* Red dot badge */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: '#E05252',
                    borderRadius: '50%',
                  }}
                />
              </button>
              
              <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
                setActiveTab={setActiveTab}
              />
            </div>

            {/* User Avatar Pill */}
            <div className="flex items-center gap-2.5 select-none">
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: '#1A8A7A',
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
                  }}
                >
                  {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span
                  style={{
                    color: '#1E2939',
                    fontSize: 14,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '600',
                    lineHeight: '20px',
                  }}
                >
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Owner'}
                </span>
                <span
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '400',
                    lineHeight: '16px',
                  }}
                >
                  {user?.email || 'admin@pivodent.com'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content canvas */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col min-w-0" style={{ background: '#F0F4F3' }}>
          {renderTabContent()}

          {/* Confirm Modal */}
          <ConfirmModal
            isOpen={showLogoutConfirm}
            title="Confirm Logout"
            message="Are you sure you want to log out of the Dental System? You will need to log back in to access your clinic."
            confirmText="Log out"
            cancelText="Cancel"
            type="danger"
            onConfirm={() => {
               setShowLogoutConfirm(false);
               handleLogout();
            }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
