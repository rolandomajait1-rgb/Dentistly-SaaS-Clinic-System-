import { useState, useEffect, useRef } from 'react';
import { register as apiRegister } from '../../api';
import { useNotifications } from '../../context/NotificationContext';

export default function RegisterPage({ onRegister, onBack, onSwitchToLogin }) {
  const { showToast } = useNotifications();
  const [clinicName, setClinicName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);
  const formRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  const handleBackClick = () => {
    if (step === 2) {
      setStep(1);
      setError('');
    } else {
      onBack();
    }
  };

  /* ── Form submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Step 1 Validation: Clinic Details
      if (!clinicName || !contactNumber || !address) {
        const msg = 'Please fill in all clinic details fields.';
        setError(msg);
        showToast(msg, 'warning');
        return;
      }
      setStep(2);
      return;
    }

    // Step 2 Validation: Credentials & Submission
    if (!ownerName || !email || !password || !passwordConfirmation) {
      const msg = 'Please fill in all owner credential fields.';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }

    if (password !== passwordConfirmation) {
      const msg = 'Passwords do not match.';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }

    setIsLoading(true);
    showToast('Creating your clinic account...', 'info');
    try {
      const data = await apiRegister({
        clinic_name: clinicName,
        owner_name: ownerName,
        email,
        password,
        password_confirmation: passwordConfirmation,
        contact_number: contactNumber,
        address,
      });
      showToast('Welcome to ClinicSync!', 'success');
      setTimeout(() => onRegister(data), 500);
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
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

        {/* Middle: Headline */}
        <div className="relative z-10 px-12 py-16 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 w-fit"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed">Get Started</span>
          </div>

          <h2 className="text-[34px] font-black text-white leading-[1.1] mb-4">
            Launch your<br />
            <span className="text-primary-fixed-dim">clinic</span><br />
            in minutes.
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed mb-8 max-w-sm">
            Join modern dental clinics using ClinicSync to streamline operations, manage appointments, and deliver exceptional patient care.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <p className="text-[12px] font-bold text-white">Free 30-day trial • No credit card required</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  speed
                </span>
              </div>
              <p className="text-[12px] font-bold text-white">Setup in under 5 minutes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  support_agent
                </span>
              </div>
              <p className="text-[12px] font-bold text-white">24/7 customer support included</p>
            </div>
          </div>
        </div>

        {/* Bottom: Security */}
        <div className="relative z-10 px-12 pb-8">
          <div className="h-px bg-white/10 mb-6" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6bd8cb' }}>shield_lock</span>
            <span className="text-[11px] text-white/60">
              Your data is encrypted and HIPAA compliant
            </span>
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
          <button onClick={handleBackClick} className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide cursor-pointer"
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
            className="w-full max-w-[480px]"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Header */}
            <div className="mb-6">
              {/* Back link — desktop only */}
              <button
                onClick={handleBackClick}
                className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-8 transition-colors cursor-pointer group"
                style={{ color: 'var(--color-outline)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-outline)'}
              >
                <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform" style={{ fontSize: '15px' }}>arrow_back</span>
                Back to site
              </button>

              <h1 className="text-[26px] font-black leading-tight mb-1.5" style={{ color: 'var(--color-on-background)' }}>
                Create your clinic
              </h1>
              <p className="text-[13px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                Set up your ClinicSync workspace in minutes.
              </p>
            </div>

            {/* Step Stepper */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-outline)' }}>
                  <span>Step {step} of 2</span>
                  <span>{step === 1 ? 'Clinic Details' : 'Owner Credentials'}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 rounded-full" 
                    style={{ width: `${(step / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-[13px] font-semibold animate-fadeIn"
                style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)', border: '1px solid rgba(186,26,26,0.15)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {step === 1 && (
                <div className="space-y-4 animate-slideUp">
                  {/* Clinic Name */}
                  <div>
                    <label htmlFor="clinic-name" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Clinic Name
                    </label>
                    <div className="relative rounded-xl transition-all duration-200"
                      style={{
                        border: `1.5px solid ${focusedField === 'clinicName' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        boxShadow: focusedField === 'clinicName' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                        background: 'var(--color-surface-container-lowest)',
                      }}>
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ fontSize: '18px', color: focusedField === 'clinicName' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                        business
                      </span>
                      <input
                        id="clinic-name"
                        type="text"
                        value={clinicName}
                        onChange={e => setClinicName(e.target.value)}
                        onFocus={() => setFocusedField('clinicName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Bright Smile Dental Clinic"
                        className="w-full h-11 pl-11 pr-4 bg-transparent text-[14px] outline-none"
                        style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contact-number" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Contact Number
                    </label>
                    <div className="relative rounded-xl transition-all duration-200"
                      style={{
                        border: `1.5px solid ${focusedField === 'contactNumber' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        boxShadow: focusedField === 'contactNumber' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                        background: 'var(--color-surface-container-lowest)',
                      }}>
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ fontSize: '18px', color: focusedField === 'contactNumber' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                        phone
                      </span>
                      <input
                        id="contact-number"
                        type="tel"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        onFocus={() => setFocusedField('contactNumber')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="+63 912 345 6789"
                        className="w-full h-11 pl-11 pr-4 bg-transparent text-[14px] outline-none"
                        style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Clinic Address
                    </label>
                    <div className="relative rounded-xl transition-all duration-200"
                      style={{
                        border: `1.5px solid ${focusedField === 'address' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        boxShadow: focusedField === 'address' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                        background: 'var(--color-surface-container-lowest)',
                      }}>
                      <span className="material-symbols-outlined absolute left-3.5 top-3.5"
                        style={{ fontSize: '18px', color: focusedField === 'address' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                        location_on
                      </span>
                      <textarea
                        id="address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onFocus={() => setFocusedField('address')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="123 Main Street, Makati City, Metro Manila"
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-[14px] outline-none resize-none"
                        style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-6"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      boxShadow: '0 6px 20px rgba(0,78,71,0.25)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,78,71,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,78,71,0.25)'; }}
                  >
                    Next: Setup Credentials
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-slideUp">
                  {/* Owner Name */}
                  <div>
                    <label htmlFor="owner-name" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Your Full Name
                    </label>
                    <div className="relative rounded-xl transition-all duration-200"
                      style={{
                        border: `1.5px solid ${focusedField === 'ownerName' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        boxShadow: focusedField === 'ownerName' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                        background: 'var(--color-surface-container-lowest)',
                      }}>
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ fontSize: '18px', color: focusedField === 'ownerName' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                        person
                      </span>
                      <input
                        id="owner-name"
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        onFocus={() => setFocusedField('ownerName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Dr. Juan Dela Cruz"
                        className="w-full h-11 pl-11 pr-4 bg-transparent text-[14px] outline-none"
                        style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="register-email" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
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
                        id="register-email"
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
                    <label htmlFor="register-password" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Password
                    </label>
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
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        autoComplete="new-password"
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}>
                      Confirm Password
                    </label>
                    <div className="relative rounded-xl transition-all duration-200"
                      style={{
                        border: `1.5px solid ${focusedField === 'confirmPassword' ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        boxShadow: focusedField === 'confirmPassword' ? '0 0 0 3px rgba(0,78,71,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                        background: 'var(--color-surface-container-lowest)',
                      }}>
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ fontSize: '18px', color: focusedField === 'confirmPassword' ? 'var(--color-primary)' : 'var(--color-outline)', transition: 'color 0.2s' }}>
                        lock
                      </span>
                      <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordConfirmation}
                        onChange={e => setPasswordConfirmation(e.target.value)}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full h-11 pl-11 pr-4 bg-transparent text-[14px] outline-none"
                        style={{ color: 'var(--color-on-surface)', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 rounded-xl font-bold text-[13px] uppercase tracking-wide border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-2 h-11 rounded-xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
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
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Sign-in link */}
            <p className="text-center text-[12px] mt-6" style={{ color: 'var(--color-on-surface-variant)' }}>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchToLogin}
                className="font-bold cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign In
              </button>
            </p>

            {/* Terms footnote */}
            <p className="text-center text-[10px] mt-4 pt-4" style={{ color: 'var(--color-outline)', borderTop: '1px solid var(--color-outline-variant)' }}>
              By creating an account, you agree to our{' '}
              <button type="button" className="underline cursor-pointer hover:opacity-70">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="underline cursor-pointer hover:opacity-70">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
