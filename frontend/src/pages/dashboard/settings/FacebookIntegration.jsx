import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FacebookLogo,
  CheckCircle,
  Warning,
  LinkBreak,
  ArrowRight,
  Copy,
  Flask,
  Info,
  CaretDown,
  CaretUp,
  PaperPlaneRight,
  ShieldCheck,
  User,
  Robot,
  GearSix
} from '@phosphor-icons/react';

import ConfirmModal from '../../../components/ui/ConfirmModal';

const MOCK_CHAT_STEPS = [
  { sender: 'user', text: 'Hi! Meron po ba kayong slot for Teeth Cleaning bukas?' },
  { sender: 'bot', text: 'Hello! Yes, we have slots open for Teeth Cleaning tomorrow at 10:00 AM and 2:00 PM. Gusto niyo po bang ipareserve ko?' },
  { sender: 'user', text: 'Gusto ko po sana ng 10:00 AM. Magkano po pala ang paglilinis?' },
  { sender: 'bot', text: 'Perfect! Reserved for 10:00 AM. Ang Teeth Cleaning po ay nagmula sa ₱800. Pwede po bang makuha ang Full Name at Phone Number niyo para sa booking?' },
  { sender: 'user', text: 'Si Maria Cruz po, 09171234567.' },
  { sender: 'bot', text: 'Salamat Maria! Naka-book na po ang appointment niyo bukas, July 4, 10:00 AM. Makakatanggap po kayo ng SMS confirmation shortly. Reference: BS-8472. See you! 😊' }
];

const FacebookIntegration = ({ clinicData, onIntegrationUpdate }) => {
  const oauthProcessed = useRef(false);

  // Derive step and selectedPage initial values from clinicData to avoid synchronous updates in useEffect
  const [step, setStep] = useState(() => {
    return clinicData?.fb_page_integration?.is_active ? 'connected' : 'initial';
  });
  const [selectedPage, setSelectedPage] = useState(() => {
    return clinicData?.fb_page_integration?.is_active ? {
      id: clinicData.fb_page_integration.fb_page_id,
      name: clinicData.fb_page_integration.fb_page_name,
    } : null;
  });

  // Track the integration state to update step/selectedPage if it changes after mount
  const [prevFbIntegration, setPrevFbIntegration] = useState(clinicData?.fb_page_integration);

  if (clinicData?.fb_page_integration !== prevFbIntegration) {
    setPrevFbIntegration(clinicData?.fb_page_integration);
    if (clinicData?.fb_page_integration?.is_active) {
      setStep('connected');
      setSelectedPage({
        id: clinicData.fb_page_integration.fb_page_id,
        name: clinicData.fb_page_integration.fb_page_name,
      });
    } else {
      setStep('initial');
      setSelectedPage(null);
    }
  }

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pageDetails, setPageDetails] = useState(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Mock Chat Simulator States
  const [simVisibleMessages, setSimVisibleMessages] = useState([]);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [simIsTyping, setSimIsTyping] = useState(false);
  const simTimeoutRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchPageDetails = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/page-details`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPageDetails(data.page);
      }
    } catch (err) {
      console.error('Failed to fetch page details:', err);
    }
  }, [BASE_URL]);

  // Fetch page details when integration becomes active
  useEffect(() => {
    if (clinicData?.fb_page_integration?.is_active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPageDetails();
    }
  }, [clinicData?.fb_page_integration?.is_active, fetchPageDetails]);

  // Chat Simulator Script Controller
  useEffect(() => {
    const triggerNextMessage = () => {
      if (simStepIndex >= MOCK_CHAT_STEPS.length) {
        simTimeoutRef.current = setTimeout(() => {
          setSimVisibleMessages([]);
          setSimStepIndex(0);
        }, 5000);
        return;
      }

      const nextMsg = MOCK_CHAT_STEPS[simStepIndex];
      
      if (nextMsg.sender === 'bot') {
        setSimIsTyping(true);
        simTimeoutRef.current = setTimeout(() => {
          setSimIsTyping(false);
          setSimVisibleMessages(prev => [...prev, nextMsg]);
          setSimStepIndex(prev => prev + 1);
        }, 2200);
      } else {
        simTimeoutRef.current = setTimeout(() => {
          setSimVisibleMessages(prev => [...prev, nextMsg]);
          setSimStepIndex(prev => prev + 1);
        }, 1500);
      }
    };

    triggerNextMessage();

    return () => {
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    };
  }, [simStepIndex]);

  const handleStartConnection = async () => {
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('oauth_provider', 'facebook');
      const res = await fetch(`${BASE_URL}/dashboard/facebook/auth-url`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to get authorization URL');
      
      const data = await res.json();
      window.location.href = data.auth_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePageSelect = async (page) => {
    setSelectedPage(page);
    setStep('connecting');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/connect`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          page_id: page.id,
          page_name: page.name,
          page_access_token: page.access_token,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to connect page');
      }

      const data = await res.json();
      setSuccess('Facebook page connected successfully!');
      setStep('connected');
      
      if (onIntegrationUpdate) {
        onIntegrationUpdate(data.integration);
      }

      setTimeout(() => fetchPageDetails(), 500);
    } catch (err) {
      setError(err.message);
      setStep('selecting');
    } finally {
      setLoading(false);
    }
  };

  const triggerDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const executeDisconnect = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/disconnect`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error('Failed to disconnect page');

      setSuccess('Facebook page disconnected successfully');
      setStep('initial');
      setSelectedPage(null);
      setPageDetails(null);
      
      if (onIntegrationUpdate) {
        onIntegrationUpdate(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/test-webhook`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error('Webhook test failed');

      const data = await res.json();
      setSuccess(data.message || 'Webhook test successful');
    } catch (err) {
      setError(err.message);
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleOAuthCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      const provider = localStorage.getItem('oauth_provider');
      if (provider !== 'facebook') return;

      if (oauthProcessed.current) return;
      oauthProcessed.current = true;

      // Yield execution to avoid calling setState synchronously within useEffect
      await Promise.resolve();

      setLoading(true);
      try {
        localStorage.removeItem('oauth_provider');
        const res = await fetch(`${BASE_URL}/dashboard/facebook/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ code, state })
        });

        if (!res.ok) throw new Error('OAuth callback failed');

        const data = await res.json();
        setPages(data.pages);
        setStep('selecting');
        setSuccess('Facebook pages retrieved successfully');
      } catch (err) {
        setError(err.message);
        setStep('initial');
      } finally {
        setLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [BASE_URL]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleOAuthCallback();
  }, [handleOAuthCallback]);
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${label} copied to clipboard`);
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#131f1e] border border-outline-variant/50 dark:border-[#1b2b29] rounded-3xl shadow-xs overflow-hidden text-on-surface dark:text-[#f2f0ed] transition-all duration-300">
      
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-outline-variant/50 dark:border-[#1b2b29] bg-slate-50/40 dark:bg-[#182625] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <FacebookLogo size={20} weight="fill" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-on-surface dark:text-[#f2f0ed] tracking-wide font-sans">Facebook Messenger Connection</h3>
            <p className="text-[11px] font-semibold text-on-surface-variant/70 dark:text-slate-400 mt-0.5 font-sans">Connect your page inbox for automated AI scheduling answers.</p>
          </div>
        </div>
        {step === 'connected' && (
          <span className="flex items-center gap-1.5 text-[9px] font-black border px-3 py-1 rounded-full uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 shadow-3xs animate-pulse">
            <CheckCircle size={12} weight="bold" />
            Connected
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Side: Setup Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Alerts */}
          <div className="space-y-3">
            {error && (
              <div className="flex gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-fadeIn font-bold text-xs text-rose-600 dark:text-rose-455 leading-relaxed font-sans">
                <Warning size={16} className="shrink-0 mt-0.5" weight="bold" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fadeIn font-bold text-xs text-emerald-600 dark:text-emerald-455 leading-relaxed font-sans">
                <CheckCircle size={16} className="shrink-0 mt-0.5" weight="bold" />
                <p className="leading-relaxed">{success}</p>
              </div>
            )}
          </div>

          {/* Initial State - Not Connected */}
          {step === 'initial' && (
            <div className="space-y-5 py-3">
              <div className="bg-slate-50 dark:bg-[#182625] p-5 rounded-2xl border border-outline-variant/60 dark:border-[#213533] space-y-3">
                <h4 className="font-extrabold text-xs text-on-surface dark:text-[#f2f0ed] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Info size={14} className="text-blue-600 dark:text-blue-400" weight="bold" />
                  Doctor & Nurse Friendly Integration
                </h4>
                <p className="text-[11.5px] text-on-surface-variant/70 dark:text-slate-400 font-semibold leading-relaxed font-sans">
                  No complex setup required. Click the button below, log in with Facebook, select your clinic's business page, and we will configure the chatbot instantly.
                </p>
                <ol className="list-decimal list-inside text-[11px] text-on-surface-variant/50 dark:text-slate-500 font-bold space-y-1 pt-1.5 border-t border-outline-variant/30 dark:border-[#1b2b29] font-sans">
                  <li>Log in with your clinic's Facebook account</li>
                  <li>Grant permissions for Page Messaging</li>
                  <li>Your virtual assistant is ready to accept patients!</li>
                </ol>
              </div>

              <button
                onClick={handleStartConnection}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white dark:text-on-primary text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs font-sans"
              >
                <FacebookLogo size={16} weight="fill" />
                {loading ? 'Initiating Facebook Portal...' : 'Connect Clinic Facebook Page'}
              </button>
            </div>
          )}

          {/* Page Selection State */}
          {step === 'selecting' && pages.length > 0 && (
            <div className="space-y-4 py-3">
              <div>
                <p className="text-xs font-black text-on-surface dark:text-[#f2f0ed] uppercase tracking-wider font-sans">Select a Facebook Page</p>
                <p className="text-[11px] text-on-surface-variant/70 dark:text-slate-400 font-semibold mt-0.5 font-sans">Which Facebook business page represents your dental practice?</p>
              </div>
              <div className="grid grid-cols-1 gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageSelect(page)}
                    disabled={loading}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 dark:bg-[#182625] hover:dark:bg-[#131f1e] border border-outline-variant/60 dark:border-[#213533] rounded-2xl hover:border-primary transition-all text-left disabled:opacity-50 cursor-pointer shadow-3xs flex items-center justify-between text-[#f2f0ed]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {page.picture?.data?.url ? (
                        <img 
                          src={page.picture.data.url} 
                          alt={page.name} 
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant/50 dark:border-[#213533]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          FB
                        </div>
                      )}
                      <div className="min-w-0 font-sans">
                        <h5 className="font-extrabold text-sm text-on-surface dark:text-[#f2f0ed] truncate">{page.name}</h5>
                        <p className="text-[10px] text-on-surface-variant/50 dark:text-slate-500 font-bold leading-none mt-0.5">{page.category || 'Dental Clinic'}</p>
                      </div>
                    </div>
                    <span className="text-primary dark:text-inverse-primary">
                      <ArrowRight size={16} weight="bold" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected State */}
          {step === 'connected' && selectedPage && (
            <div className="space-y-5 py-1">
              
              {/* Page Profile picture ("Face Logo") */}
              <div className="p-5 bg-slate-50/50 dark:bg-[#182625] border border-outline-variant/60 dark:border-[#213533] rounded-3xl flex items-center gap-4.5 shadow-3xs relative overflow-hidden">
                <div className="relative shrink-0 flex items-center">
                  {pageDetails?.picture?.data?.url ? (
                    <img 
                      src={pageDetails.picture.data.url} 
                      alt={selectedPage.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold">
                      FB
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-50 dark:border-[#131f1e] rounded-full shadow-3xs" />
                </div>
                
                <div className="min-w-0 flex-1 font-sans">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-base text-on-surface dark:text-[#f2f0ed] truncate">{selectedPage.name}</h4>
                    <span className="text-blue-500 dark:text-blue-400 hover:scale-105 transition-all" title="Facebook Page Synced">
                      <ShieldCheck size={16} weight="fill" />
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/60 dark:text-slate-500 font-mono mt-0.5">ID: {selectedPage.id}</p>
                  <p className="text-[10px] font-black text-primary dark:text-inverse-primary uppercase tracking-wider mt-1">{pageDetails?.category || 'Medical & Dental Clinic'}</p>
                </div>
              </div>

              {/* Doctor / Nurse Explanation Panel */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 dark:border-emerald-500/10 rounded-2xl flex gap-3 text-xs leading-relaxed font-semibold text-on-surface-variant/70 dark:text-slate-400 font-sans">
                <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" weight="bold" />
                <p>
                  <strong>Ang AI assistant ay aktibo na!</strong> Lahat ng magme-message sa inyong Facebook page ay sasagutin ng AI para mag-schedule ng appointments, sumagot ng operating hours, at mag-check ng presyo ng treatments.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2 font-sans">
                <button
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] dark:hover:bg-[#213533] text-on-surface-variant dark:text-slate-200 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-3xs"
                >
                  <Flask size={15} weight="bold" />
                  {testingWebhook ? 'Running System Check...' : 'Test Webhook Endpoint'}
                </button>
                <button
                  onClick={triggerDisconnect}
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black rounded-xl hover:bg-rose-500/20 dark:hover:bg-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-3xs"
                >
                  <LinkBreak size={15} weight="bold" />
                  Disconnect Messenger
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Advanced Credentials Drawer */}
          <div className="pt-3 border-t border-outline-variant/30 dark:border-[#1b2b29] font-sans">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between text-xs text-on-surface-variant/50 dark:text-slate-500 font-extrabold hover:text-on-surface dark:hover:text-slate-350 transition-colors w-full py-2 px-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <GearSix size={14} weight="bold" />
                ⚙️ Technical Developer settings (Nurses / Doctors can safely ignore this)
              </span>
              {showAdvanced ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mt-3 pl-3.5 border-l-2 border-outline-variant/40 dark:border-[#1b2b29] overflow-hidden pt-1"
                >
                  <div className="p-3 bg-slate-50 dark:bg-[#182625] rounded-xl border border-outline-variant/60 dark:border-[#213533] text-[10.5px] font-semibold text-on-surface-variant/65 dark:text-slate-500 leading-relaxed font-sans">
                    ⚙️ These technical parameters link Meta App webhooks to your specific database tenant tunnel. They are populated automatically by OAuth, but can be modified manually by IT administrators.
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-extrabold text-on-surface-variant/60 dark:text-slate-500 uppercase tracking-widest leading-none font-sans">Verify Token</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={clinicData?.fb_page_integration?.webhook_verify_token || 'dental_appointment_webhook_token'}
                        className="w-full pl-3.5 pr-12 py-2 bg-slate-100/80 dark:bg-[#101817] border border-outline-variant/60 dark:border-[#213533] rounded-xl text-xs font-mono text-on-surface-variant/60 dark:text-slate-500 cursor-not-allowed"
                      />
                      <button
                        onClick={() => copyToClipboard(clinicData?.fb_page_integration?.webhook_verify_token || 'dental_appointment_webhook_token', 'Verify Token')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer"
                        title="Copy"
                      >
                        <Copy size={13} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-extrabold text-on-surface-variant/60 dark:text-slate-500 uppercase tracking-widest leading-none font-sans">Webhook URL Endpoint</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/api/webhook/dental`}
                        className="w-full pl-3.5 pr-12 py-2 bg-slate-100/80 dark:bg-[#101817] border border-outline-variant/60 dark:border-[#213533] rounded-xl text-xs font-mono text-on-surface-variant/60 dark:text-slate-500 cursor-not-allowed"
                      />
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/api/webhook/dental`, 'Webhook URL')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface dark:text-slate-500 dark:hover:text-slate-355 cursor-pointer"
                        title="Copy"
                      >
                        <Copy size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Interactive Messenger Chat Simulator */}
        <div className="lg:col-span-5 flex flex-col">
          
          <div className="bg-slate-100 dark:bg-[#0b1211] border border-outline-variant/60 dark:border-[#1b2b29] rounded-3xl p-4.5 flex flex-col h-[400px] shadow-inner relative overflow-hidden">
            
            {/* Simulator Header */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-outline-variant/50 dark:border-[#1b2b29] shrink-0">
              <div className="relative w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-550/20 text-blue-600 dark:text-blue-400">
                <Robot size={16} weight="bold" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-100 dark:border-[#0b1211] rounded-full" />
              </div>
              <div className="font-sans">
                <div className="flex items-center gap-1">
                  <p className="font-extrabold text-[11px] text-on-surface dark:text-[#f2f0ed] leading-none">SmileBot Assistant</p>
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">AI Agent</span>
                </div>
                <p className="text-[9.5px] text-on-surface-variant/65 dark:text-slate-500 mt-0.5 font-bold">Live Booking Simulator</p>
              </div>
            </div>

            {/* Chat Dialog Panel */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none flex flex-col">
              <AnimatePresence initial={false}>
                {simVisibleMessages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex gap-2 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                        isUser 
                          ? 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-350' 
                          : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-inverse-primary'
                      }`}>
                        {isUser ? <User size={12} weight="bold" /> : <Robot size={12} weight="bold" />}
                      </div>

                      <div className={`p-3 rounded-2xl text-[11px] font-semibold leading-relaxed shadow-3xs font-sans ${
                        isUser
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white dark:bg-[#182625] border border-outline-variant/60 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Mock typing bubble */}
              {simIsTyping && (
                <div className="flex gap-2 mr-auto max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Robot size={12} weight="bold" />
                  </div>
                  <div className="bg-white dark:bg-[#182625] border border-outline-variant/60 dark:border-[#213533] p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-3xs">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Mock Chat Input Footer */}
            <div className="pt-3 border-t border-outline-variant/40 dark:border-[#1b2b29] flex items-center gap-2 shrink-0">
              <input
                disabled
                type="text"
                placeholder="Simulating patient messaging..."
                className="flex-1 bg-white dark:bg-[#182625] border border-outline-variant/60 dark:border-[#213533] text-[10px] font-semibold text-on-surface-variant/40 dark:text-slate-500 rounded-xl px-3 py-2 focus:outline-none"
              />
              <button disabled className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center cursor-not-allowed">
                <PaperPlaneRight size={14} weight="bold" />
              </button>
            </div>

          </div>

        </div>

      </div>

      <ConfirmModal
        isOpen={showDisconnectConfirm}
        title="Disconnect Messenger"
        message="Are you sure you want to disconnect this Facebook page? The chatbot will stop automated responses and booking scheduling immediately."
        confirmText="Disconnect"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          setShowDisconnectConfirm(false);
          executeDisconnect();
        }}
        onCancel={() => setShowDisconnectConfirm(false)}
      />

    </div>
  );
};

export default FacebookIntegration;
