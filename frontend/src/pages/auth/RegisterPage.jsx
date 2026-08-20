import { useState, useEffect, useRef } from 'react';
import { register as apiRegister } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import assets from '../../assets';

export default function RegisterPage({ onRegister, onBack, onSwitchToLogin }) {
  const { showToast } = useNotifications();
  // step: 0 = Free Trial Overview, 1 = Clinic Details, 2 = Owner Credentials
  const [step, setStep] = useState(0);

  // Form State
  const [clinicName, setClinicName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [authData, setAuthData] = useState(null);
  
  const formRef = useRef(null);

  /* Entrance animation */
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, [step]);

  const handleBackClick = () => {
    setError('');
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    } else {
      onBack();
    }
  };

  /* Form submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!clinicName.trim() || !contactNumber.trim() || !address.trim()) {
        const msg = 'Please fill in all clinic details.';
        setError(msg);
        showToast(msg, 'warning');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!ownerName.trim() || !email.trim() || !password || !passwordConfirmation) {
        const msg = 'Please fill in all credentials.';
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
        setAuthData(data);
        setShowSuccessModal(true);
      } catch (err) {
        const errorMsg = err.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProceed = () => {
    if (authData) {
      onRegister(authData);
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
            <h3 className="text-[22px] font-bold text-[#004E47] mb-1.5 tracking-tight leading-snug">
              Registered Successfully!
            </h3>
            
            {/* Subtitle */}
            <p className="text-[13px] text-slate-600 mb-7 font-medium">
              Check your Email for verification
            </p>

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
        
        {/* Background Body Image (Body.png) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${assets.authBody || assets.authRectangle})` }}
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

        {/* Middle Content */}
        {step === 0 ? (
          /* Free Trial Typography Stack (Image 1) */
          <div className="relative z-10 my-auto py-12 max-w-lg">
            <div className="space-y-0.5 mb-6">
              <div className="text-[#032a24]/50 font-black text-[42px] xl:text-[50px] uppercase tracking-tight leading-[0.95]">
                FREE TRIAL
              </div>
              <div className="text-[#008f80]/80 font-black text-[42px] xl:text-[50px] uppercase tracking-tight leading-[0.95]">
                FREE TRIAL
              </div>
              <div className="text-white font-black text-[42px] xl:text-[50px] uppercase tracking-tight leading-[0.95] drop-shadow-sm">
                FREE TRIAL
              </div>
            </div>

            <h2 className="text-[28px] xl:text-[34px] font-black text-white leading-tight mb-3 drop-shadow-sm">
              The clinic software that gets out of your way.
            </h2>
            <p className="text-white/85 text-[15px] xl:text-[16px] font-medium leading-relaxed max-w-md drop-shadow-xs">
              Used by solo practitioners and multi-clinic groups across the Philippines.
            </p>
          </div>
        ) : (
          /* Registration Features View (Image 3) */
          <div className="relative z-10 my-auto py-12 max-w-lg">
            <h2 className="text-[38px] xl:text-[46px] font-black text-white leading-[1.12] tracking-tight mb-5 drop-shadow-sm">
              Launch your<br />
              clinic<br />
              in minutes.
            </h2>
            <p className="text-white/85 text-[15px] xl:text-[16px] font-medium leading-relaxed max-w-md mb-8 drop-shadow-xs">
              Join modern dental clinics using Pivodent to streamline operations, manage appointments, and deliver exceptional patient care.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                  <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <p className="text-[13.5px] font-bold text-white drop-shadow-xs">Free 30-day trial • No credit card required</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                  <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                    speed
                  </span>
                </div>
                <p className="text-[13.5px] font-bold text-white drop-shadow-xs">Setup in under 5 minutes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                  <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                    support_agent
                  </span>
                </div>
                <p className="text-[13.5px] font-bold text-white drop-shadow-xs">24/7 customer support included</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom: Security footnote */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-white/80" style={{ fontSize: '17px' }}>shield_lock</span>
          <span className="text-[12px] text-white/80 font-medium">
            256-bit TLS Encryption · HIPAA Compliant Infrastructure
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT  —  Form / Trial Panel (Matches user mockup)
      ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen bg-white relative">
        
        {/* Top: Back button */}
        <div className="flex justify-between items-center w-full">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {step === 0 ? 'Back to site' : step === 1 ? 'Back to trial details' : 'Back to clinic details'}
          </button>

          {/* Mobile Logo indicator */}
          <div className="lg:hidden">
            <img src={assets.pivodentLogo} alt="Pivodent" className="h-6 w-auto object-contain" />
          </div>
        </div>

        {/* Centered Panel Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div
            ref={formRef}
            className="w-full max-w-[460px]"
            style={{ opacity: 0, transform: 'translateY(16px)', transition: 'opacity 0.4s ease-out, transform 0.4s ease-out' }}
          >
            
            {/* ── SCREEN 1: 14 DAYS FREE TRIAL OVERVIEW (Image 1) ── */}
            {step === 0 && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-[36px] sm:text-[42px] font-black text-slate-950 tracking-tight leading-[1.08]">
                    14 days.<br />
                    No card needed.
                  </h1>
                  <p className="text-[14.5px] text-slate-500 font-medium mt-2">
                    Full Professional access from the moment you sign up.
                  </p>
                </div>

                {/* 3 Benefit Feature Cards */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/80">
                      <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900">Everything on Day 1</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Appointments, EHR, reminders — fully unlocked.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/80">
                      <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                        group
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900">Whole team included</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Add dentists, staff, and front desk — no seat limits.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/80">
                      <span className="material-symbols-outlined text-[#004E47]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                        shield
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900">Your data, always safe</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Trial ends without a plan? Read-only. Nothing deleted.</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="pt-3 pb-2">
                  <div className="relative flex justify-between items-center px-4">
                    {/* Connecting line */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-200" />
                    
                    {/* Step 1 */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#004E47] border-2 border-white ring-2 ring-[#004E47]/20" />
                      <span className="text-[11px] font-bold text-slate-800 mt-1.5">Day 1</span>
                      <span className="text-[9.5px] text-slate-400 font-medium">Full access</span>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#004E47] border-2 border-white ring-2 ring-[#004E47]/20" />
                      <span className="text-[11px] font-bold text-slate-800 mt-1.5">Day 7</span>
                      <span className="text-[9.5px] text-slate-400 font-medium">Check-in</span>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#e11d48] border-2 border-white ring-2 ring-[#e11d48]/20" />
                      <span className="text-[11px] font-bold text-slate-800 mt-1.5">Day 14</span>
                      <span className="text-[9.5px] text-slate-400 font-medium">Choose plan</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button: Start Free Trial */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-4 px-8 rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#004E47] to-[#00A86B] hover:from-[#003831] hover:to-[#008f5a] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,78,71,0.25)] hover:shadow-[0_10px_30px_rgba(0,78,71,0.35)] transition-all cursor-pointer group"
                  >
                    <span>Start Free Trial</span>
                    <span className="material-symbols-outlined text-[19px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>

                {/* Bottom Switch to Login */}
                <p className="text-center text-[13px] text-slate-500 pt-2 font-medium">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={onSwitchToLogin}
                    className="font-bold text-slate-900 hover:text-[#004E47] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}

            {/* ── SCREEN 2 & 3: CLINIC & OWNER REGISTRATION FORMS (Image 3) ── */}
            {step > 0 && (
              <div>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#004E47]">
                      {step === 1 ? 'Step 1 of 2: Clinic Details' : 'Step 2 of 2: Owner Credentials'}
                    </span>
                  </div>
                  <h1 className="text-[30px] sm:text-[34px] font-black text-slate-950 tracking-tight leading-tight">
                    {step === 1 ? 'Tell us about your clinic' : 'Create your credentials'}
                  </h1>
                  <p className="text-[14px] text-slate-500 font-medium mt-1">
                    {step === 1 ? 'Set up your clinic location and contact info.' : 'This will be used to log in to your admin workspace.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-[#004E47] transition-all duration-300 rounded-full"
                    style={{ width: `${(step / 2) * 100}%` }}
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-[13px] font-semibold bg-red-50 text-red-700 border border-red-200">
                    <span className="material-symbols-outlined text-red-600" style={{ fontSize: '18px' }}>error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  
                  {/* Step 1 Fields */}
                  {step === 1 && (
                    <>
                      {/* Clinic Name */}
                      <div>
                        <label htmlFor="reg-clinic-name" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Clinic Name
                        </label>
                        <input
                          id="reg-clinic-name"
                          type="text"
                          value={clinicName}
                          onChange={e => setClinicName(e.target.value)}
                          placeholder="e.g. Happy Smiles Dental Clinic"
                          required
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Contact Number */}
                      <div>
                        <label htmlFor="reg-contact" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Contact Number
                        </label>
                        <input
                          id="reg-contact"
                          type="tel"
                          value={contactNumber}
                          onChange={e => setContactNumber(e.target.value)}
                          placeholder="e.g. +63 912 345 6789"
                          required
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Clinic Address */}
                      <div>
                        <label htmlFor="reg-address" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Clinic Address
                        </label>
                        <textarea
                          id="reg-address"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="e.g. Unit 402 Medical Plaza, Makati City"
                          rows={2}
                          required
                          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs resize-none"
                        />
                      </div>

                      {/* Next Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full h-12 rounded-xl font-bold text-[13.5px] uppercase tracking-widest text-white bg-[#00453f] hover:bg-[#003430] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,69,63,0.22)] hover:shadow-[0_8px_25px_rgba(0,69,63,0.32)] transition-all cursor-pointer group"
                        >
                          <span>Next: Owner Credentials</span>
                          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 2 Fields */}
                  {step === 2 && (
                    <>
                      {/* Owner Full Name */}
                      <div>
                        <label htmlFor="reg-owner-name" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Owner Full Name
                        </label>
                        <input
                          id="reg-owner-name"
                          type="text"
                          value={ownerName}
                          onChange={e => setOwnerName(e.target.value)}
                          placeholder="e.g. Dr. Juan Santos"
                          required
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label htmlFor="reg-email" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@clinic.com"
                          autoComplete="email"
                          required
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label htmlFor="reg-password" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Password (min. 8 chars)
                        </label>
                        <div className="relative">
                          <input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            className="w-full h-12 pl-4 pr-11 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-[19px]">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="reg-confirm-password" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Confirm Password
                        </label>
                        <input
                          id="reg-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordConfirmation}
                          onChange={e => setPasswordConfirmation(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004E47] focus:ring-3 focus:ring-[#004E47]/10 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Submit / Create Account Button */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="h-12 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[13px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-12 rounded-xl font-bold text-[13.5px] uppercase tracking-widest text-white bg-[#00453f] hover:bg-[#003430] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,69,63,0.22)] hover:shadow-[0_8px_25px_rgba(0,69,63,0.32)] transition-all cursor-pointer group"
                        >
                          {isLoading ? (
                            <>
                              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              <span>Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Create Account</span>
                              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                                arrow_forward
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                {/* Bottom Switch to Login */}
                <p className="text-center text-[13px] text-slate-500 mt-6 font-medium">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={onSwitchToLogin}
                    className="font-bold text-slate-900 hover:text-[#004E47] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Legal spacer */}
        <div className="w-full text-center text-[11px] text-slate-400">
          © 2026 Pivodent SaaS. All rights reserved.
        </div>
      </div>
    </div>
  );
}

