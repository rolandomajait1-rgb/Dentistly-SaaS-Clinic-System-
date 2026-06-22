import { useState, useEffect, useRef, useCallback } from 'react';
import { login as apiLogin, googleLogin as apiGoogleLogin } from '../../api';
import { useNotifications } from '../../context/NotificationContext';

const FEATURES = [
  { icon: 'calendar_month',  label: 'Smart Scheduling',      desc: 'AI-optimized appointment routing' },
  { icon: 'clinical_notes',  label: 'Patient Records',       desc: 'HIPAA-compliant data management' },
  { icon: 'analytics',       label: 'Live Queue Console',    desc: 'Real-time patient flow control' },
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<12ms', label: 'Avg. Latency' },
  { value: '256-bit', label: 'TLS Encryption' },
];

export default function LoginPage({ onLogin, onBack, onSwitchToRegister }) {
  const { showToast } = useNotifications();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const formRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  /* ── Google OAuth button ── */
  const handleGoogleLoginResponse = useCallback(async (response) => {
    setIsLoading(true);
    setError('');
    showToast('Signing in with Google...', 'info');
    try {
      const data = await apiGoogleLogin(response.credential);
      showToast('Welcome back!', 'success');
      setTimeout(() => onLogin(data), 500);
    } catch (err) {
      const errorMsg = err.message || 'Google login failed.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onLogin, showToast]);

  useEffect(() => {
    const init = () => {
      if (typeof window.google === 'undefined') return false;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1093847291038-dummyclientid.apps.googleusercontent.com';
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleLoginResponse });
      const btn = document.getElementById('googleSignInBtn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline', size: 'large', width: 340,
          shape: 'pill', logo_alignment: 'center',
        });
      }
      return true;
    };
    if (!init()) {
      let attempts = 0;
      const t = setInterval(() => { if (init() || ++attempts > 10) clearInterval(t); }, 500);
      return () => clearInterval(t);
    }
  }, [handleGoogleLoginResponse]);

  /* ── Form submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { 
      const msg = 'Please fill in all fields.';
      setError(msg);
      showToast(msg, 'warning');
      return; 
    }
    setIsLoading(true);
    showToast('Signing in...', 'info');
    try {
      const data = await apiLogin(email, password);
      showToast('Welcome back!', 'success');
      setTimeout(() => onLogin(data), 500);
    } catch (err) {
      const errorMsg = err.message || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--color-surface-bright)' }}>



      {/* ════════════════════════════════════════════════
          LEFT  —  Brand Panel
      ════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #003d37 0%, #004e47 40%, #006458 100%)' }}
      >
        {/* Decorative mesh blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #a1f1e5 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #6bd8cb 0%, transparent 70%)' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Top: Logo */}
        <div className="relative z-10 px-12 pt-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-[26px] font-black tracking-tight text-white">ClinicSync</span>
            <span className="material-symbols-outlined text-white/30 group-hover:text-white/60 transition-colors text-sm">open_in_new</span>
          </button>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 px-12 py-16 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 w-fit"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed">Clinical OS · v4.2</span>
          </div>

          <h2 className="text-[34px] font-black text-white leading-[1.1] mb-4">
            Orchestrate<br />
            <span className="text-primary-fixed-dim">healthcare</span><br />
            with clarity.
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed mb-8 max-w-sm">
            The precision-built dental management platform trusted by modern clinics to eliminate administrative friction.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white leading-none mb-0.5">{label}</p>
                  <p className="text-[11px] text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Mini Card Preview (Figma Style) */}
        <div className="absolute right-[-30px] top-[40%] w-[280px] glass-panel-dark rounded-2xl p-5 border border-white/10 shadow-2xl animate-float pointer-events-none hidden xl:block z-20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed-dim">Next Patient</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <p className="text-[15px] font-bold text-white mb-0.5">Dr. Sarah Jenkins</p>
          <p className="text-[11px] text-white/50 mb-3">10:30 AM · Dental Restoration</p>
          <div className="flex gap-2">
            <span className="px-2.5 py-0.5 bg-white/10 text-white/80 text-[9px] rounded font-bold uppercase">Ch 02</span>
            <span className="px-2.5 py-0.5 bg-primary-fixed/20 text-primary-fixed text-[9px] rounded font-bold uppercase">Active</span>
          </div>
        </div>

        {/* Bottom: Stats bar */}
        <div className="relative z-10 px-12 pb-8">
          <div className="h-px bg-white/10 mb-6" />
          <div className="flex gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-[16px] font-black text-white font-mono leading-none">{value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT  —  Form Panel
      ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">

        {/* Soft background blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-40 blur-[100px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle, rgba(161,241,229,0.25) 0%, transparent 70%)' }} />

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Back
          </button>
          <span className="text-[22px] font-black tracking-tight" style={{ color: 'var(--color-primary)' }}>ClinicSync</span>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <div
            ref={formRef}
            className="w-full max-w-[400px]"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Header */}
            <div className="mb-6">
              {/* Back link — desktop only */}
              <button
                onClick={onBack}
                className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-8 transition-colors cursor-pointer group"
                style={{ color: 'var(--color-outline)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-outline)'}
              >
                <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform" style={{ fontSize: '15px' }}>arrow_back</span>
                Back to site
              </button>

              <h1 className="text-[26px] font-black leading-tight mb-1.5" style={{ color: 'var(--color-on-background)' }}>
                Welcome back
              </h1>
              <p className="text-[13px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                Sign in to your ClinicSync workspace.
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-[13px] font-semibold"
                style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)', border: '1px solid rgba(186,26,26,0.15)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--color-on-surface-variant)' }}>
                  Email Address
                </label>
                <div className="relative rounded-xl transition-all duration-200"
                  style={{
                    border: `1.5px solid ${focusedField === 'email' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    background: 'var(--color-surface-container-lowest)',
                  }}>
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: '18px', color: focusedField === 'email' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                    mail
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@clinic.com"
                    autoComplete="email"
                    className="w-full h-11 pl-11 pr-4 bg-transparent text-[14px] outline-none"
                    style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--color-on-surface-variant)' }}>
                    Password
                  </label>
                  <button type="button" className="text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-xl transition-all duration-200"
                  style={{
                    border: `1.5px solid ${focusedField === 'password' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    background: 'var(--color-surface-container-lowest)',
                  }}>
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: '18px', color: focusedField === 'password' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full h-11 pl-11 pr-12 bg-transparent text-[14px] outline-none"
                    style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: 'var(--color-outline)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-outline)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer group mt-1"
                style={{
                  background: isLoading ? 'var(--color-primary-container)' : 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow: isLoading ? 'none' : '0 6px 20px rgba(0,78,71,0.25)',
                }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,78,71,0.35)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 6px 20px rgba(0,78,71,0.25)'; }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-outline)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
            </div>

            {/* Google button */}
            <div className="flex justify-center min-h-[44px]" id="googleSignInBtn" />

            {/* Sign-up nudge */}
            <p className="text-center text-[12px] mt-4" style={{ color: 'var(--color-on-surface-variant)' }}>
              Don&apos;t have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchToRegister}
                className="font-bold cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}
              >
                Create Account
              </button>
            </p>

            {/* Security footnote */}
            <div className="flex items-center justify-center gap-2 mt-5 pt-5"
              style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--color-outline)' }}>shield_lock</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-outline)' }}>
                256-bit TLS · HIPAA Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
