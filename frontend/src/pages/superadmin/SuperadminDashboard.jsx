import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal';

const resolveSuperadminBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/dashboard\/?$/, '')}/api/superadmin`;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (window.location.port === '5173' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      return '/api/superadmin';
    }
    return `http://${hostname}:8000/api/superadmin`;
  }
  return '/api/superadmin';
};

const SUPERADMIN_API_URL = resolveSuperadminBaseUrl();

export default function SuperadminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('superadmin_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('superadmin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App data states
  const [stats, setStats] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, clinics, plans
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [deletingPlanId, setDeletingPlanId] = useState(null);

  // Plan modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [appointmentLimit, setAppointmentLimit] = useState(-1);
  const [staffLimit, setStaffLimit] = useState(-1);
  const [planFeatures, setPlanFeatures] = useState('');

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/stats`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  }, [getHeaders]);

  const fetchClinics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${SUPERADMIN_API_URL}/clinics`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setClinics(data);
      }
    } catch (err) {
      console.error('Error fetching clinics', err);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/plans`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Error fetching plans', err);
    }
  }, [getHeaders]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats();
      fetchClinics();
      fetchPlans();
    }
  }, [token, fetchStats, fetchClinics, fetchPlans]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Invalid admin email or password.');
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('superadmin_token', data.token);
      localStorage.setItem('superadmin_user', JSON.stringify(data.user));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    window.location.href = '/';
  };

  const handleToggleClinicStatus = async (clinicId, currentStatus) => {
    setActionError('');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/clinics/${clinicId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update clinic status');
      
      // Refresh
      fetchClinics();
      fetchStats();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleOpenPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.plan_name);
      setPlanCode(plan.plan_code);
      setPlanPrice(plan.monthly_price);
      setAppointmentLimit(plan.appointment_limit ?? -1);
      setStaffLimit(plan.staff_limit ?? -1);
      setPlanFeatures(plan.features ? plan.features.join(', ') : '');
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanCode('');
      setPlanPrice(0);
      setAppointmentLimit(-1);
      setStaffLimit(-1);
      setPlanFeatures('basic_booking, messenger_bot');
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setActionError('');

    const featuresArray = planFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      id: editingPlan?.id || null,
      plan_name: planName,
      plan_code: planCode,
      monthly_price: Number(planPrice),
      appointment_limit: Number(appointmentLimit),
      staff_limit: Number(staffLimit),
      features: featuresArray,
    };

    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save plan');
      }

      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeletePlan = (planId) => {
    setDeletingPlanId(planId);
  };

  const executeDeletePlan = async (planId) => {
    setActionError('');

    try {
      const res = await fetch(`${SUPERADMIN_API_URL}/plans/${planId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete plan');
      }

      fetchPlans();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // LOGIN UI
  // ────────────────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundColor: '#F5F8F7',
          fontFamily: "'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          className="w-full max-w-[480px] bg-white rounded-[24px] overflow-hidden"
          style={{
            border: '1px solid #E5EBE8',
            boxShadow: '0 18px 45px rgba(15, 62, 56, 0.07)',
          }}
        >
          {/* Main Form Body */}
          <div className="p-8 sm:p-10 pb-7">
            {/* Brand Logo & Super Admin Identifier */}
            <div className="flex items-center gap-3.5 mb-7">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DCE5E0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <img
                  src="https://raw.githubusercontent.com/rolandomajait1-rgb/Dentistly-SaaS-Clinic-System-/main/backend/public/images/email-brand-symbol-opt.png"
                  alt="Pivodent"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-extrabold tracking-wide text-base leading-tight"
                  style={{ color: '#064B42' }}
                >
                  PIVODENT
                </span>
                <span
                  className="font-bold text-[10px] tracking-[0.14em] uppercase"
                  style={{ color: '#064B42' }}
                >
                  SUPER ADMIN
                </span>
              </div>
            </div>

            {/* Headline Block */}
            <div className="mb-8">
              <h1
                className="text-[30px] sm:text-[32px] font-bold tracking-tight mb-2 leading-tight"
                style={{
                  color: '#0F3E38',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Super Admin Access
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: '#637570',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Restricted to authorized personnel only. Sign in securely to manage clinic operations and access sensitive settings.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div
                  className="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  className="block text-[11px] font-bold tracking-[0.08em] uppercase mb-1.5"
                  style={{ color: '#637570' }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#F7FAF9',
                    border: '1px solid #DCE5E0',
                    color: '#0F3E38',
                  }}
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  className="block text-[11px] font-bold tracking-[0.08em] uppercase mb-1.5"
                  style={{ color: '#637570' }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  className="w-full h-12 px-4 rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#F7FAF9',
                    border: '1px solid #DCE5E0',
                    color: '#0F3E38',
                  }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: '#637570' }}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#0F3E38] focus:ring-[#0F3E38] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="mailto:support@pivodent.io?subject=Super%20Admin%20Password%20Reset"
                  className="text-xs font-bold transition-colors hover:underline"
                  style={{ color: '#0F3E38' }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-12 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                style={{
                  backgroundColor: '#0F3E38',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* "or" Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1" style={{ backgroundColor: '#E5EBE8' }} />
              <span className="text-xs font-semibold lowercase" style={{ color: '#889895' }}>
                or
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: '#E5EBE8' }} />
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={() => alert('Single Sign-On (SSO) with Google Workspace is managed by platform security policies. Please use admin email credentials.')}
              className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors hover:bg-slate-50 cursor-pointer"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DCE5E0',
                color: '#1E2939',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Need Help Footnote */}
            <p className="text-center text-xs mt-4" style={{ color: '#637570' }}>
              Need help? Contact{' '}
              <a
                href="mailto:support@pivodent.io"
                className="hover:underline font-semibold"
                style={{ color: '#0F3E38' }}
              >
                support@pivodent.io
              </a>
            </p>
          </div>

          {/* Bottom Card Footer: CLINIC ACCESS Switcher */}
          <div
            className="px-8 py-5 flex items-center justify-between gap-4"
            style={{
              backgroundColor: '#F7FAF9',
              borderTop: '1px solid #E5EBE8',
            }}
          >
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.1em] uppercase block mb-1"
                style={{ color: '#889895' }}
              >
                CLINIC ACCESS
              </span>
              <span className="text-sm font-bold block leading-tight" style={{ color: '#0F3E38' }}>
                Clinic Login
              </span>
              <span className="text-xs block mt-0.5" style={{ color: '#637570' }}>
                Switch to clinic staff access
              </span>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 cursor-pointer shrink-0"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #DCE5E0',
                color: '#0F3E38',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span>Clinic Login</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // DASHBOARD UI
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-950" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="font-extrabold text-teal-400 leading-none">Control Tower</h1>
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1 block">Dental SaaS Platform</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', label: 'Platform Stats', icon: 'monitoring' },
            { id: 'clinics', label: 'Clinic Directory', icon: 'corporate_fare' },
            { id: 'plans', label: 'Plan Pricing', icon: 'payments' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <div className="mb-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Logged in as</p>
            <p className="text-xs font-bold truncate text-slate-300 mt-0.5">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-wider uppercase bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {activeTab === 'overview' && 'Platform Overview Console'}
              {activeTab === 'clinics' && 'Clinic Tenant Manager'}
              {activeTab === 'plans' && 'Subscription Plan Matrix'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'overview' && 'Monitoring overall system registration and health.'}
              {activeTab === 'clinics' && 'Review and toggle clinic status, tenant details, and verification files.'}
              {activeTab === 'plans' && 'Create, customize, and edit subscription options.'}
            </p>
          </div>
        </header>

        {actionError && (
          <div className="mb-6 p-3.5 bg-red-950/30 border border-red-800/40 rounded-xl text-red-400 text-xs font-bold flex gap-2 items-center">
            <span className="material-symbols-outlined text-sm">warning</span>
            {actionError}
          </div>
        )}

        {/* ── Tab: Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Tenant Clinics', value: stats?.stats?.totalClinics ?? 0, icon: 'storefront', gradient: 'from-blue-600 to-teal-500' },
                { label: 'Registered Patients', value: stats?.stats?.totalPatients ?? 0, icon: 'groups', gradient: 'from-teal-500 to-green-500' },
                { label: 'Total Appointments', value: stats?.stats?.totalAppointments ?? 0, icon: 'book_online', gradient: 'from-purple-600 to-pink-500' },
                { label: 'Active Trial Accounts', value: stats?.stats?.activeTrials ?? 0, icon: 'history', gradient: 'from-orange-500 to-amber-400' },
              ].map((card, i) => (
                <div key={i} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-lg shadow-black/40">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.gradient} opacity-[0.03] blur-3xl rounded-full`} />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-normal">
                      {card.label}
                    </span>
                    <span className="material-symbols-outlined text-slate-600">{card.icon}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-4 tracking-tight">{card.value}</h3>
                </div>
              ))}
            </div>

            {/* Plan Breakdown Cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/40">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Tenant Subscription Split</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats?.planBreakdown?.map((item, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.plan_name}</p>
                      <h4 className="text-xl font-black text-white mt-1">{item.count} clinics</h4>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-teal-400 text-sm">verified</span>
                    </div>
                  </div>
                ))}
                {(!stats?.planBreakdown || stats.planBreakdown.length === 0) && (
                  <div className="col-span-full py-8 text-center text-xs text-slate-500">
                    No active clinic subscriptions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Clinics ── */}
        {activeTab === 'clinics' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">Fetching clinic directory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60">
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic / Owner</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slug/Domain</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan / Sub</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chat Bot</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinics.map((clinic) => {
                      const isSuspended = clinic.status === 'suspended';
                      const bot = clinic.fb_page_integration;
                      return (
                        <tr key={clinic.id} className="border-b border-slate-800 hover:bg-slate-850/20 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{clinic.clinic_name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{clinic.owner_name}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs text-slate-300">{clinic.email}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{clinic.contact_number}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-bold text-teal-400 font-mono">
                              {clinic.tenant?.subdomain || 'none'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-xs font-semibold text-slate-300">
                              {clinic.subscription?.plan?.plan_name || 'No Plan'}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5 capitalize">
                              Sub status: {clinic.subscription?.status || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">
                            {bot ? (
                              <span className={`flex items-center gap-1 text-[10px] font-bold ${bot.is_active ? 'text-green-400' : 'text-slate-500'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {bot.fb_page_name || 'Connected'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500">Not Connected</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              clinic.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-900/30' :
                              clinic.status === 'suspended' ? 'bg-red-500/10 text-red-400 border border-red-900/30' :
                              'bg-orange-500/10 text-orange-400 border border-orange-900/30'
                            }`}>
                              {clinic.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleClinicStatus(clinic.id, clinic.status)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer border ${
                                isSuspended
                                  ? 'bg-green-500 hover:bg-green-450 text-slate-950 border-transparent'
                                  : 'bg-red-950/20 hover:bg-red-950/60 text-red-400 border-red-900/30'
                              }`}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {clinics.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-xs text-slate-500">
                          No clinics found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Plans ── */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenPlanModal()}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-black">add</span>
                Create Plan Option
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-black/40">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-extrabold text-white text-base">{plan.plan_name}</h4>
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-slate-400 mt-1 inline-block font-mono">
                          {plan.plan_code}
                        </span>
                      </div>
                      <span className="text-xl font-black text-teal-400">
                        ₱{Number(plan.monthly_price).toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-medium">/mo</span>
                      </span>
                    </div>

                    <ul className="space-y-2.5 border-t border-slate-800/60 pt-4 mb-6">
                      <li className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Appointment Limit:</span>
                        <span className="font-bold text-slate-300">
                          {plan.appointment_limit === null ? 'Unlimited' : `${plan.appointment_limit} / mo`}
                        </span>
                      </li>
                      <li className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Dentist/Staff Limit:</span>
                        <span className="font-bold text-slate-300">
                          {plan.staff_limit === null ? 'Unlimited' : `${plan.staff_limit} users`}
                        </span>
                      </li>
                      <li className="text-xs">
                        <span className="text-slate-500 font-medium block mb-1">Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.features?.map((feat, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-950 rounded text-[9px] font-bold text-slate-400 border border-slate-800">
                              {feat}
                            </span>
                          ))}
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 border-t border-slate-800/40 pt-4">
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className="flex-1 py-2 text-center bg-slate-800 hover:bg-slate-750 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Edit Option
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="py-2 px-3 text-center bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-slate-500">
                  No subscription plans created.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Plan Modal ── */}
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                <h3 className="font-extrabold text-base text-white">
                  {editingPlan ? 'Modify Plan Settings' : 'Create Subscription Plan'}
                </h3>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                      Plan Option Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      placeholder="Enterprise Plan"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                      Unique Plan Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      placeholder="ENTERPRISE"
                      value={planCode}
                      onChange={(e) => setPlanCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                    Monthly Price (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    placeholder="3999"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                      Monthly Appointment Limit (-1 for unlimited)
                    </label>
                    <input
                      type="number"
                      required
                      min="-1"
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      value={appointmentLimit}
                      onChange={(e) => setAppointmentLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                      Dentist / Staff User Limit (-1 for unlimited)
                    </label>
                    <input
                      type="number"
                      required
                      min="-1"
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      value={staffLimit}
                      onChange={(e) => setStaffLimit(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                    Feature Tags (comma-separated strings)
                  </label>
                  <textarea
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    rows="3"
                    placeholder="basic_booking, messenger_bot, sms_notifications"
                    value={planFeatures}
                    onChange={(e) => setPlanFeatures(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={deletingPlanId !== null}
        title="Delete Subscription Plan"
        message="Are you sure you want to delete this subscription plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          const planId = deletingPlanId;
          setDeletingPlanId(null);
          executeDeletePlan(planId);
        }}
        onCancel={() => setDeletingPlanId(null)}
      />

    </div>
  );
}
