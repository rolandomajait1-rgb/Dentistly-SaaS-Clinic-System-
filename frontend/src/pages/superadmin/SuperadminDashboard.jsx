import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal';

const SUPERADMIN_API_URL = 'http://127.0.0.1:8000/api/superadmin';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-slate-950 font-black" style={{ fontSize: '28px' }}>
                shield_person
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-center text-white tracking-tight mb-1">
            SaaS Control Tower
          </h2>
          <p className="text-slate-400 text-xs text-center font-medium tracking-wide uppercase mb-8">
            Platform Operator Login
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-400 text-xs font-bold flex gap-2 items-center">
                <span className="material-symbols-outlined text-sm">error</span>
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1.5">
                Operator Email
              </label>
              <input
                type="email"
                required
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                placeholder="admin@dentalsaas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1.5">
                Secure Token Key
              </label>
              <input
                type="password"
                required
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 mt-4 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-extrabold rounded-lg text-sm tracking-widest uppercase transition-colors shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Access Control Deck'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <a href="/" className="text-xs text-slate-500 hover:text-teal-400 transition-colors font-semibold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to main portal
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
