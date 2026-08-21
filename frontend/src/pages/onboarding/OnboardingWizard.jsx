import { useState, useEffect } from 'react';
import { updateSettings, addService } from '../../api';
import { useNotifications } from '../../context/NotificationContext';

export default function OnboardingWizard({ clinicData, onComplete }) {
  const { showToast } = useNotifications();
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      return 4; // return to Step 4 on OAuth callback
    }
    const savedStep = sessionStorage.getItem('onboarding_step');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Clinic Profile States
  const [clinicName, setClinicName] = useState(clinicData?.clinic_name || '');
  const [clinicPhone, setClinicPhone] = useState(clinicData?.contact_number || '');
  const [clinicHours, setClinicHours] = useState('09:00 AM - 06:00 PM');
  const [clinicAddress, setClinicAddress] = useState(clinicData?.address || '');

  // Step 2: Service Presets States
  const [selectedPresets, setSelectedPresets] = useState({
    cleaning: true,
    checkup: true,
    filling: true,
    extraction: true,
    whitening: false,
    rootcanal: false,
  });

  const presetTreatments = [
    { id: 'checkup', name: 'General Check-up', price: 300, category: 'General Dentistry', desc: 'Comprehensive dental examination and assessment' },
    { id: 'cleaning', name: 'Teeth Cleaning', price: 600, category: 'General Dentistry', desc: 'Professional teeth cleaning to remove plaque and tartar' },
    { id: 'filling', name: 'Tooth Filling (Pasta)', price: 800, category: 'Restorative Dentistry', desc: 'Cavity filling using high-quality composite material' },
    { id: 'extraction', name: 'Tooth Extraction (Bunot)', price: 500, category: 'Oral Surgery', desc: 'Safe and painless tooth extraction procedure' },
    { id: 'whitening', name: 'Teeth Whitening', price: 3000, category: 'Cosmetic Dentistry', desc: 'Professional whitening treatment for a brighter smile' },
    { id: 'rootcanal', name: 'Root Canal Therapy', price: 5000, category: 'Endodontics', desc: 'Root canal therapy to treat and save infected teeth' },
  ];

  // Step 3: Chatbot States
  const [chatbotWelcome, setChatbotWelcome] = useState(
    "👋 Hi! Welcome to {clinic_name}! \n\nI'm your dental assistant. I can help you book appointments, check your schedule, or answer questions. \n\nLet's get started! 😊"
  );
  const [chatbotInstructions, setChatbotInstructions] = useState(
    "We offer premium dental care at affordable pricing. Teeth cleaning starts at ₱600. We accept Cash, GCash, and Maxicare HMO."
  );

  // Step 4: OAuth connection states
  const [fbConnected, setFbConnected] = useState(() => !!clinicData?.fb_page_integration?.is_active);
  const [fbPages, setFbPages] = useState([]);
  const [selectingFbPage, setSelectingFbPage] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const [oauthSuccess, setOauthSuccess] = useState('');

  // OAuth Callback Checker Effect
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state) {
        const provider = localStorage.getItem('oauth_provider');
        if (!provider) return;

        setOauthLoading(true);
        setOauthError('');
        setOauthSuccess('');

        try {
          localStorage.removeItem('oauth_provider');
          const token = localStorage.getItem('token');
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

          if (provider === 'facebook') {
            const res = await fetch(`${apiBaseUrl}/dashboard/facebook/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ code, state })
            });

            if (!res.ok) throw new Error('Facebook authentication failed.');
            const data = await res.json();
            setFbPages(data.pages || []);
            setSelectingFbPage(true);
            setOauthSuccess('Select a Facebook page to connect.');
          }
        } catch (err) {
          setOauthError(err.message);
        } finally {
          setOauthLoading(false);
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleConnectFacebook = async () => {
    setOauthLoading(true);
    setOauthError('');
    setOauthSuccess('');
    try {
      localStorage.setItem('oauth_provider', 'facebook');
      sessionStorage.setItem('onboarding_step', '4');
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

      const res = await fetch(`${apiBaseUrl}/dashboard/facebook/auth-url`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to get Facebook authentication URL');
      const data = await res.json();
      window.location.href = data.auth_url;
    } catch (err) {
      setOauthError(err.message);
      setOauthLoading(false);
    }
  };


  const handlePageSelect = async (page) => {
    setOauthLoading(true);
    setOauthError('');
    setOauthSuccess('');

    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

      const res = await fetch(`${apiBaseUrl}/dashboard/facebook/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page_id: page.id,
          page_name: page.name,
          page_access_token: page.access_token,
        })
      });

      if (!res.ok) throw new Error('Failed to connect Facebook page.');

      setFbConnected(true);
      setSelectingFbPage(false);
      setOauthSuccess('Facebook page connected successfully!');
    } catch (err) {
      setOauthError(err.message);
    } finally {
      setOauthLoading(false);
    }
  };

  // Live Phone Template Parser
  const parsePreview = (template) => {
    if (!template) return '';
    return template
      .replace(/{clinic_name}/g, clinicName || 'Happy Smiles Clinic')
      .replace(/{patient_name}/g, 'John Doe')
      .replace(/{owner_name}/g, 'Dr. Santos')
      .replace(/{clinic_phone}/g, clinicPhone || '0912-345-6789')
      .replace(/{clinic_address}/g, clinicAddress || '123 Makati Ave, Manila');
  };

  const handleTogglePreset = (id) => {
    setSelectedPresets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNextStep = () => {
    if (step === 1 && (!clinicName || !clinicPhone || !clinicAddress)) {
      showToast('Please fill in all profile fields.', 'warning');
      return;
    }
    const next = step + 1;
    setStep(next);
    sessionStorage.setItem('onboarding_step', next.toString());
  };

  const handlePrevStep = () => {
    const prev = step - 1;
    setStep(prev);
    sessionStorage.setItem('onboarding_step', prev.toString());
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      // 1. Save treatments catalog based on presets selected
      const selectedList = presetTreatments.filter(t => selectedPresets[t.id]);
      for (const treatment of selectedList) {
        try {
          await addService(treatment.name, treatment.price);
        } catch (err) {
          console.error(`Error adding preset service ${treatment.name}:`, err);
        }
      }

      // 2. Save settings payload to database
      await updateSettings({
        clinic_name: clinicName,
        contact_number: clinicPhone,
        address: clinicAddress,
        notification_settings: {
          sms_enabled: true,
          email_enabled: true,
          google_calendar_enabled: false,
          google_calendar_id: '',
          chatbot_enabled: true,
          chatbot_welcome_template: chatbotWelcome,
          chatbot_instructions: chatbotInstructions,
        }
      });

      sessionStorage.removeItem('onboarding_step');
      showToast('Welcome aboard! Your clinic onboarding setup is complete.', 'success');
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      showToast('Error completing onboarding setup: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-outline-variant rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Wizard Form Side (Left) */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              SaaS Clinic Onboarding Setup
            </div>
            
            {/* Stepper Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="flex-1 flex items-center gap-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-300 w-full ${
                    step >= num ? 'bg-primary' : 'bg-surface-container-high'
                  }`} />
                </div>
              ))}
              <span className="text-[10px] font-bold text-on-surface-variant uppercase ml-2 select-none">
                Step {step} of 4
              </span>
            </div>
          </div>

          {/* Steps Content */}
          <div className="flex-1 py-4">
            
            {/* STEP 1: Profile Details */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-black text-on-surface">Tell us about your Clinic 🏥</h3>
                <p className="text-xs text-on-surface-variant mb-4">Let's start with basic details so we can configure your bot and appointment alerts automatically.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Clinic Name</label>
                    <input 
                      type="text" 
                      value={clinicName} 
                      onChange={e => setClinicName(e.target.value)}
                      placeholder="e.g. Happy Smiles Dental Center" 
                      className="w-full px-3 py-2 border rounded-md text-sm bg-surface-bright border-outline-variant text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Contact Phone Number</label>
                    <input 
                      type="text" 
                      value={clinicPhone} 
                      onChange={e => setClinicPhone(e.target.value)}
                      placeholder="e.g. 09123456789" 
                      className="w-full px-3 py-2 border rounded-md text-sm bg-surface-bright border-outline-variant text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Business Operating Hours</label>
                      <input 
                        type="text" 
                        value={clinicHours} 
                        onChange={e => setClinicHours(e.target.value)}
                        placeholder="e.g. 09:00 AM - 06:00 PM" 
                        className="w-full px-3 py-2 border rounded-md text-sm bg-surface-bright border-outline-variant text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Clinic Address</label>
                      <input 
                        type="text" 
                        value={clinicAddress} 
                        onChange={e => setClinicAddress(e.target.value)}
                        placeholder="e.g. Makati City, Manila" 
                        className="w-full px-3 py-2 border rounded-md text-sm bg-surface-bright border-outline-variant text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Treatment Catalog Presets */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-black text-on-surface">Select treatments you offer 🦷</h3>
                <p className="text-xs text-on-surface-variant mb-4">Choose from standard dental catalog packages to populate your pricing list instantly. You can edit prices later.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                  {presetTreatments.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleTogglePreset(t.id)}
                      className={`p-3 border rounded-xl flex items-start gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                        selectedPresets[t.id] 
                          ? 'border-primary bg-primary/5 shadow-xs' 
                          : 'border-outline-variant bg-surface-bright hover:border-on-surface-variant'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedPresets[t.id]} 
                        readOnly
                        className="w-4 h-4 accent-primary rounded mt-0.5" 
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-on-surface leading-none">{t.name}</p>
                        <p className="text-[10px] text-primary font-black">₱{t.price.toLocaleString()}</p>
                        <p className="text-[10px] text-on-surface-variant leading-tight">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Chatbot Customizer & Live Phone Simulator Intro */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-black text-on-surface">Setup Chatbot Auto-Response 🤖</h3>
                <p className="text-xs text-on-surface-variant mb-4">Customize the welcome greeting and guidelines for your Messenger chatbot. See the preview on the right update live!</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Chatbot Welcome Greeting Template</label>
                    <textarea 
                      value={chatbotWelcome} 
                      onChange={e => setChatbotWelcome(e.target.value)}
                      rows="4"
                      className="w-full p-2.5 bg-surface-bright border border-outline-variant rounded-md text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Clinic Persona instructions / promos</label>
                    <textarea 
                      value={chatbotInstructions} 
                      onChange={e => setChatbotInstructions(e.target.value)}
                      rows="3"
                      className="w-full p-2.5 bg-surface-bright border border-outline-variant rounded-md text-xs font-mono"
                      placeholder="e.g. Cleanings are 10% off today!"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Integrations (OAuth) */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-on-surface">Connect Channels (Optional) 🌐</h3>
                  <p className="text-xs text-on-surface-variant">Activate 1-Click Messenger chatbot replies and Google Calendar sync integrations.</p>
                </div>
                
                {/* OAuth Error Alert */}
                {oauthError && (
                  <div className="flex gap-3 p-4 bg-error-container border border-error/20 rounded-lg animate-fade-in text-xs text-error">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>error</span>
                    <p>{oauthError}</p>
                  </div>
                )}

                {/* OAuth Success Alert */}
                {oauthSuccess && (
                  <div className="flex gap-3 p-4 bg-[#e5f6f4] border border-primary/20 rounded-lg animate-fade-in text-xs text-primary">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p>{oauthSuccess}</p>
                  </div>
                )}

                {selectingFbPage && fbPages.length > 0 && (
                  <div className="space-y-4 border border-outline-variant p-4 rounded-xl bg-surface-bright/80">
                    <p className="text-xs font-bold text-on-surface">Select Facebook Page to Connect:</p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                      {fbPages.map(page => (
                        <button
                          key={page.id}
                          onClick={() => handlePageSelect(page)}
                          disabled={oauthLoading}
                          className="p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-on-surface">{page.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono">{page.id}</p>
                          </div>
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* FB Messenger Connect */}
                  <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-bright/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>chat</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Facebook Messenger Chatbot</p>
                        <p className="text-[10px] text-on-surface-variant">Automate booking conversations.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleConnectFacebook}
                      disabled={oauthLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        fbConnected 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-[#1877F2] text-white hover:opacity-95'
                      }`}
                    >
                      {oauthLoading ? 'Loading...' : fbConnected ? '✓ Connected' : 'Connect Page'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30 mt-4">
            {step > 1 ? (
              <button 
                onClick={handlePrevStep}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant text-on-surface rounded-lg text-xs font-bold transition-all hover:bg-surface-container cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button 
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-xs"
              >
                Next Step
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button 
                onClick={handleCompleteSetup}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-md"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Live Simulator Preview Side (Right) */}
        <div className="bg-slate-900 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-outline-variant/20 md:w-[360px] shrink-0">
          
          {/* Phone chassis */}
          <div className="w-[280px] h-[500px] bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Dynamic island notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-10 flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-900 rounded-full ml-auto mr-4" />
            </div>

            {/* Messenger Chat Header */}
            <div className="bg-slate-900 border-b border-slate-800/80 px-4 pt-8 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs select-none">
                {clinicName ? clinicName.charAt(0).toUpperCase() : '🦷'}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-100 leading-none">{clinicName || 'Happy Smiles Dental'}</p>
                <p className="text-[8px] text-primary flex items-center gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Bot Active
                </p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto flex flex-col justify-end">
              
              {/* Simulated user greeting */}
              <div className="self-end bg-primary text-white rounded-2xl rounded-tr-xs px-3 py-1.5 text-[9px] max-w-[80%] leading-relaxed shadow-sm">
                Get started
              </div>

              {/* Bot Welcome Greeting Message bubble */}
              <div className="self-start bg-slate-800 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-xs px-3 py-2 text-[9px] max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs">
                {parsePreview(chatbotWelcome)}
              </div>

              {/* Bot Announcement bubble (if instructions are active) */}
              {chatbotInstructions && (
                <div className="self-start bg-slate-800 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-xs px-3 py-2 text-[9px] max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs border-l-2 border-l-primary animate-fade-in">
                  📢 <strong>ANNOUNCEMENT:</strong>{"\n"}{parsePreview(chatbotInstructions)}
                </div>
              )}

              {/* Booking Quick Replies */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full py-1.5 border border-primary/30 bg-primary/10 text-primary text-[8px] font-bold rounded-full text-center hover:bg-primary/20 transition-all select-none">
                  📅 Book Appointment
                </div>
                <div className="w-full py-1.5 border border-slate-800 bg-slate-900 text-slate-300 text-[8px] font-bold rounded-full text-center hover:bg-slate-800 transition-all select-none">
                  💡 Clinic FAQs
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
