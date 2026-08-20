import { useState, useEffect, useRef, useCallback } from 'react';
import { login as apiLogin, googleLogin as apiGoogleLogin } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import assets from '../../assets';

const FEATURES = [
  { icon: 'calendar_month',  label: 'Smart Scheduling',   desc: 'Appointment Booking' },
  { icon: 'clinical_notes',  label: 'Patient Records',    desc: 'HIPAA-compliant data management' },
  { icon: 'desktop_windows', label: 'Live Queue Console', desc: 'Real-time patient flow control' },
];

export default function LoginPage({ onLogin, onBack, onSwitchToRegister }) {
  const { showToast } = useNotifications();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [authData, setAuthData]         = useState(null);
  const formRef = useRef(null);

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  /* Entrance animation */
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  /* Google OAuth button */
  const handleGoogleLoginResponse = useCallback(async (response) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGoogleLogin(response.credential);
      setAuthData(data);
      setShowSuccessModal(true);
    } catch (err) {
      const errorMsg = err.message || 'Google login failed.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const init = () => {
      if (typeof window.google === 'undefined' || !window.google.accounts) return false;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1093847291038-dummyclientid.apps.googleusercontent.com';
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleLoginResponse });
      const btn = document.getElementById('googleSignInBtn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline', size: 'large', width: 340,
          shape: 'pill', logo_alignment: 'center', text: 'signin_with'
        });
        setIsGoogleLoaded(true);
      }
      return true;
    };
    if (!init()) {
      let attempts = 0;
      const t = setInterval(() => { if (init() || ++attempts > 10) clearInterval(t); }, 500);
      return () => clearInterval(t);
    }
  }, [handleGoogleLoginResponse]);

  /* Form submit */
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
    try {
      const data = await apiLogin(email, password);
      setAuthData(data);
      setShowSuccessModal(true);
    } catch (err) {
      const errorMsg = err.message || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (authData) {
      onLogin(authData);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-900 font-sans relative overflow-x-hidden">
      
      {/* ════════════════════════════════════════════════
          SUCCESS MODAL (Matches user reference design)
      ════════════════════════════════════════════════ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[3px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 sm:p-9 max-w-[390px] w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative border border-slate-100/80 flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={handleProceed}
              className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pivodent Logo */}
            <div className="mb-6 mt-2">
              <img src={assets.pivodentLogo} alt="Pivodent" className="h-14 w-auto object-contain mx-auto" />
            </div>

            {/* Title */}
            <h3 className="text-[22px] font-bold text-[#004E47] mb-7 tracking-tight leading-snug">
              Log in Successfully!
            </h3>

            {/* Checkmark Action Button */}
            <button
              onClick={handleProceed}
              className="bg-[#00B074] hover:bg-[#009e68] active:bg-[#008c5c] text-white w-36 h-11 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,176,116,0.35)] hover:shadow-[0_6px_18px_rgba(0,176,116,0.45)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          LEFT  —  Brand Visual Panel (Matches user mockup)
      ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden select-none">
        
        {/* Background Dentist Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${assets.authRectangle || assets.authBg})` }}
        />
        {/* Dark Teal Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${assets.authContainerGradient})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#001e1b]/80 via-[#004e47]/65 to-transparent pointer-events-none" />

        {/* Top: White Pill Badge with Logo */}
        <div className="relative z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center bg-white px-5 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-white/80 transition-transform hover:scale-102 cursor-pointer"
          >
            <img src={assets.pivodentLogo} alt="Pivodent Logo" className="h-9 w-auto object-contain block" />
          </button>
        </div>

        {/* Middle: Headline + Paragraph */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h2 className="text-[38px] xl:text-[46px] font-black text-white leading-[1.12] tracking-tight mb-5 drop-shadow-sm">
            Orchestrate<br />
            healthcare<br />
            with clarity.
          </h2>
          <p className="text-white/85 text-[15px] xl:text-[16px] font-medium leading-relaxed max-w-md drop-shadow-xs">
            The precision-built dental management platform trusted by modern clinics to eliminate administrative friction.
          </p>
        </div>

        {/* Bottom: 3 Rounded Feature Icons List */}
        <div className="relative z-10 space-y-3.5">
          {FEATURES.map(({ icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
              </div>
              <div>
                <p className="text-[13.5px] font-bold text-white leading-tight drop-shadow-xs">{label}</p>
                <p className="text-[12px] text-white/80 font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT  —  Form Panel (Matches user mockup)
      ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen bg-white relative">
        
        {/* Top: Back to site button */}
        <div className="flex justify-between items-center w-full">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to site
          </button>

          {/* Mobile Logo indicator */}
          <div className="lg:hidden">
            <img src={assets.pivodentLogo} alt="Pivodent" className="h-6 w-auto object-contain" />
          </div>
        </div>

        {/* Centered Form Body */}
        <div className="flex-1 flex items-center justify-center py-10">
          <div
            ref={formRef}
            className="w-full max-w-[420px]"
            style={{ opacity: 0, transform: 'translateY(16px)', transition: 'opacity 0.4s ease-out, transform 0.4s ease-out' }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[34px] sm:text-[38px] font-black text-slate-950 tracking-tight leading-tight mb-2">
                Welcome back
              </h1>
              <p className="text-[14.5px] text-slate-500 font-medium">
                Sign in to your <strong className="text-slate-900 font-bold">Pivodent</strong> workspace.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-[13px] font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: '18px' }}>error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label 
                  htmlFor="login-email" 
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@clinic.com"
                    autoComplete="email"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label 
                    htmlFor="login-password" 
                    className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-[11.5px] font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full h-12 pl-4 pr-11 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-[13.5px] uppercase tracking-widest text-white bg-[#00453f] hover:bg-[#003430] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,69,63,0.22)] hover:shadow-[0_8px_25px_rgba(0,69,63,0.32)] transition-all cursor-pointer group"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider OR */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google OAuth Button - Single Rendering */}
            <div className="w-full">
              <div id="googleSignInBtn" className={isGoogleLoaded ? 'w-full flex justify-center' : 'hidden'} />
              {!isGoogleLoaded && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.google?.accounts?.id) {
                      window.google.accounts.id.prompt();
                    } else {
                      showToast('Google Sign-In is initializing...', 'info');
                    }
                  }}
                  className="w-full h-12 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-[14px] flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            {/* Bottom: Switch to Register */}
            <p className="text-center text-[13px] text-slate-500 mt-8 font-medium">
              Don&apos;t have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchToRegister}
                className="font-bold text-slate-900 hover:text-[#004E47] transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Placeholder / Legal spacer */}
        <div className="w-full text-center text-[11px] text-slate-400">
          © 2026 Pivodent SaaS. All rights reserved.
        </div>
      </div>
    </div>
  );
}

