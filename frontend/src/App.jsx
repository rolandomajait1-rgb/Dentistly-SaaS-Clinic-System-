import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ScheduleCalendar from './pages/dashboard/ScheduleCalendar';
import QueueManager from './pages/dashboard/QueueManager';
import PatientRecords from './pages/dashboard/PatientRecords';
import ClinicSettings from './pages/dashboard/settings/ClinicSettings';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import PublicBookingPortal from './pages/booking/PublicBookingPortal';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import { logout } from './api';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import NotificationCenter from './components/layout/NotificationCenter';
import ConfirmModal from './components/ui/ConfirmModal';
import assets from './assets';


const NAV_ITEMS = [
  { id: 'overview',  label: 'Dashboard',         icon: 'dashboard' },
  { id: 'patients',  label: 'Patient Records',    icon: 'clinical_notes' },
  { id: 'schedule',  label: 'Appointment Desk',   icon: 'calendar_month' },
  { id: 'queue',     label: 'Queue Manager',      icon: 'analytics' },
  { id: 'settings',  label: 'Settings',           icon: 'settings' },
];

export function AppContent() {
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
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
      case 'schedule': return 'Appointment Schedule';
      case 'queue': return 'Queue Console';
      case 'patients': return 'Patient Records';
      case 'settings': return 'Clinic Profile & API Config';
      default: return 'Dashboard';
    }
  };

  if (view === 'superadmin') {
    return <SuperadminDashboard />;
  }

  if (view === 'public-booking') {
    return <PublicBookingPortal />;
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onLogin={() => setView('login')}
        onGetStarted={() => setView('register')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (view === 'login') {
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        onBack={() => setView('landing')}
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onRegister={handleLoginSuccess}
        onBack={() => setView('landing')}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative dot-pattern">

        {/* ── Top App Bar ── */}
        <header className="flex justify-between items-center w-full px-6 h-16 border-b border-outline-variant/40 shadow-xs shrink-0 z-50 bg-white/80 dark:bg-[#0a100f]/80 backdrop-blur-md">
          {/* Mobile menu toggle (hidden on desktop) */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-lg font-bold text-primary tracking-tight">{clinic?.clinic_name || 'Happy Smiles'}</span>
          </div>

          {/* Page Title Breadcrumb (desktop) */}
          <div className="hidden md:flex items-center gap-2 mr-4 shrink-0">
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
              {clinic?.clinic_name || 'Happy Smiles'}
            </span>
            <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
              {getPageHeaderTitle()}
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md relative group">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant group-focus-within:text-primary transition-colors" style={{ fontSize: '20px' }}>search</span>
            <input
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#0a100f]/60 border border-outline-variant/55 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-all shadow-xs"
              placeholder="Search patients, appointments..."
              type="text"
            />
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-bell-btn p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer"
              >
                <span className="material-symbols-outlined">notifications</span>
                {/* Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors hidden sm:block">
              <span className="material-symbols-outlined">help_outline</span>
            </button>

            <div className="h-8 w-px bg-outline-variant/50 hidden sm:block" />

            {/* User Avatar Button */}
            <button className="flex items-center gap-2 hover:bg-surface-container p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant/50">
                <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>person</span>
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-xs font-bold text-on-surface leading-none">{user?.name || 'Dr. Juan Santos'}</span>
                <span className="text-[10px] text-on-surface-variant leading-none mt-0.5 uppercase font-bold tracking-wider">{user?.role || 'Owner'}</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant hidden lg:block" style={{ fontSize: '18px' }}>arrow_drop_down</span>
            </button>
          </div>
        </header>

        {/* Scrollable content canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1280px] mx-auto">
            {renderTabContent()}
          </div>

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

          {/* Footer */}
          <footer className="mt-12 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 gap-4 mx-auto bg-surface-container-lowest">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-base font-bold text-primary">{clinic?.clinic_name || 'Happy Smiles Dental'}</span>
              <p className="text-[11px] text-on-surface-variant mt-1">© 2026 Dental Appointment Chatbot System · All Rights Reserved</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {['Privacy', 'Terms', 'Support'].map(link => (
                <a key={link} href="#" className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-colors">{link}</a>
              ))}
            </div>
          </footer>
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
