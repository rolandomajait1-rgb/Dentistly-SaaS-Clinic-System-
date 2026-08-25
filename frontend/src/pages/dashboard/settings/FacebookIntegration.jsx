import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  PaperPlaneRight
} from '@phosphor-icons/react';

import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useNotifications } from '../../../context/NotificationContext';

// Official Meta Facebook SVG Icon
export const FacebookIcon = ({ size = 24, className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    width={size}
    height={size}
    className={`shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 26.9859 6.58789 34.4355 15.1875 35.7869V23.2031H10.6172V18H15.1875V14.0344C15.1875 9.525 17.8734 7.03125 21.9891 7.03125C23.9602 7.03125 26.0203 7.38281 26.0203 7.38281V11.8125H23.7504C21.5156 11.8125 20.8125 13.1988 20.8125 14.6203V18H25.8047L25.0066 23.2031H20.8125V35.7869C29.4121 34.4355 36 26.9859 36 18Z"
      fill="#0866FF"
    />
    <path
      d="M25.0066 23.2031L25.8047 18H20.8125V14.6203C20.8125 13.1988 21.5156 11.8125 23.7504 11.8125H26.0203V7.38281C26.0203 7.38281 23.9602 7.03125 21.9891 7.03125C17.8734 7.03125 15.1875 9.525 15.1875 14.0344V18H10.6172V23.2031H15.1875V35.7869C16.1133 35.932 17.0508 36 18 36C18.9492 36 19.8867 35.932 20.8125 35.7869V23.2031H25.0066Z"
      fill="white"
    />
  </svg>
);

// Official Messenger SVG Icon
export const MessengerIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    width={size}
    height={size}
    className={`shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 0C8.05887 0 0 7.575 0 16.92C0 22.245 2.61 27 6.705 30.15V36L12.345 32.895C14.13 33.39 16.005 33.66 18 33.66C27.9411 33.66 36 26.085 36 16.74C36 7.575 27.9411 0 18 0Z"
      fill="url(#paint0_linear_messenger)"
    />
    <path
      d="M7.2002 21.6002L15.3002 12.9752L19.6502 17.3252L28.2002 12.9752L20.1002 21.6002L15.7502 17.2502L7.2002 21.6002Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id="paint0_linear_messenger"
        x1="0"
        y1="0"
        x2="36"
        y2="33.66"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0099FF" />
        <stop offset="0.6" stopColor="#A033FF" />
        <stop offset="1" stopColor="#FF5280" />
      </linearGradient>
    </defs>
  </svg>
);

const FacebookIntegration = ({
  clinicData,
  messengerEnabled = true,
  onToggleMessenger,
  onIntegrationUpdate
}) => {
  const { showToast } = useNotifications();
  const oauthProcessed = useRef(false);

  // Derived connection state (strict two-state pattern)
  const isConnected = Boolean(
    clinicData?.fb_page_integration?.is_active &&
    clinicData?.fb_page_integration?.fb_page_id
  );

  const [step, setStep] = useState(isConnected ? 'connected' : 'initial');
  const [selectedPage, setSelectedPage] = useState(
    isConnected
      ? {
          id: clinicData.fb_page_integration.fb_page_id,
          name: clinicData.fb_page_integration.fb_page_name,
        }
      : null
  );

  const [prevFbIntegration, setPrevFbIntegration] = useState(clinicData?.fb_page_integration);

  if (clinicData?.fb_page_integration !== prevFbIntegration) {
    setPrevFbIntegration(clinicData?.fb_page_integration);
    const active = Boolean(
      clinicData?.fb_page_integration?.is_active &&
      clinicData?.fb_page_integration?.fb_page_id
    );
    if (active) {
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
  const [pageDetails, setPageDetails] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Interactive Live Messenger Test Sandbox States
  const clinicDisplayName = clinicData?.clinic_name || 'our dental clinic';
  const [testInput, setTestInput] = useState('');
  const [simMessages, setSimMessages] = useState([
    { sender: 'user', text: 'Hi! May available slot po ba for Teeth Cleaning bukas?' },
    {
      sender: 'bot',
      text: `Hello! Yes, we have open slots for Teeth Cleaning tomorrow at 10:00 AM and 2:00 PM at ${clinicDisplayName}. Would you like to reserve a time?`
    }
  ]);
  const [simIsTyping, setSimIsTyping] = useState(false);
  const chatScrollRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchPageDetails = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/page-details`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPageDetails(data.page);
      }
    } catch (err) {
      console.error('Failed to fetch page details:', err);
    }
  }, [BASE_URL]);

  useEffect(() => {
    if (isConnected) {
      fetchPageDetails();
    }
  }, [isConnected, fetchPageDetails]);

  // Auto-scroll chat preview
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [simMessages, simIsTyping]);

  const handleStartConnection = async () => {
    setLoading(true);
    try {
      localStorage.setItem('oauth_provider', 'facebook');
      const res = await fetch(`${BASE_URL}/dashboard/facebook/auth-url`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to get authorization URL');

      const data = await res.json();
      window.location.href = data.auth_url;
    } catch (err) {
      showToast(err.message || 'Connection failed', 'error');
      setLoading(false);
    }
  };

  const handlePageSelect = async (page) => {
    setSelectedPage(page);
    setLoading(true);

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
      showToast('Facebook page connected successfully!', 'success');
      setStep('connected');

      if (onIntegrationUpdate) {
        onIntegrationUpdate(data.integration);
      }

      setTimeout(() => fetchPageDetails(), 400);
    } catch (err) {
      showToast(err.message || 'Failed to connect page', 'error');
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

    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/disconnect`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error('Failed to disconnect page');

      showToast('Facebook page disconnected successfully', 'info');
      setStep('initial');
      setSelectedPage(null);
      setPageDetails(null);

      if (onIntegrationUpdate) {
        onIntegrationUpdate(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to disconnect page', 'error');
    } finally {
      setLoading(false);
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

      await Promise.resolve();

      setLoading(true);
      try {
        localStorage.removeItem('oauth_provider');
        const res = await fetch(`${BASE_URL}/dashboard/facebook/callback`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ code, state })
        });

        if (!res.ok) throw new Error('OAuth callback failed');

        const data = await res.json();
        setPages(data.pages || []);
        setStep('selecting');
        showToast('Facebook authorized! Please select your clinic page.', 'success');
      } catch (err) {
        showToast(err.message || 'OAuth authorization failed', 'error');
        setStep('initial');
      } finally {
        setLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [BASE_URL]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  // Interactive Live Chat Simulator Test Action
  const handleSendTestMessage = (e) => {
    e?.preventDefault();
    if (!testInput.trim() || simIsTyping) return;

    const userText = testInput.trim();
    setTestInput('');

    setSimMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setSimIsTyping(true);

    setTimeout(() => {
      setSimIsTyping(false);

      const lower = userText.toLowerCase();
      let reply = `Thank you for contacting ${clinicDisplayName}! We are pleased to assist you with your dental needs.`;

      if (lower.includes('cleaning') || lower.includes('linis') || lower.includes('rate') || lower.includes('price') || lower.includes('magkano') || lower.includes('cost')) {
        reply = `Our Teeth Cleaning (Oral Prophylaxis) starts at ₱800. We also provide tooth extractions, pasta (fillings), and orthodontic braces. Would you like to schedule an appointment?`;
      } else if (lower.includes('sched') || lower.includes('book') || lower.includes('appointment') || lower.includes('bukas') || lower.includes('tomorrow') || lower.includes('oras') || lower.includes('open') || lower.includes('hours') || lower.includes('time')) {
        reply = `We are open Monday to Saturday from 8:00 AM to 5:00 PM. Please reply with your Full Name and Contact Number so we can reserve your schedule! 😊`;
      } else if (lower.includes('location') || lower.includes('saan') || lower.includes('address') || lower.includes('where')) {
        reply = `We are located at ${clinicData?.address || 'our clinic address'}. You are welcome to visit during our operating hours!`;
      }

      setSimMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  const activePageName =
    selectedPage?.name ||
    clinicData?.fb_page_integration?.fb_page_name ||
    clinicData?.clinic_name ||
    'Dental Clinic Page';

  const activePageId =
    selectedPage?.id ||
    clinicData?.fb_page_integration?.fb_page_id ||
    '';

  return (
    <div
      className="w-full bg-white dark:bg-[#131f1e] rounded-[12px] p-5 flex flex-col gap-4 transition-all shadow-xs border border-slate-200/80 dark:border-[#213533] font-sans"
      style={{
        outline: '1.33px rgba(14, 63, 57, 0.15) solid',
        outlineOffset: '-1.33px',
      }}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1b2b29]">
        <div className="flex items-center gap-3">
          <FacebookIcon size={26} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Facebook Messenger
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0866FF] dark:bg-blue-950/50 dark:text-blue-300">
                Official API
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Automated patient appointment bookings and 24/7 AI inquiry handling
            </p>
          </div>
        </div>

        {/* Single Authoritative Status Badge */}
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Connected
          </span>
        )}
      </div>

      {/* Main Two-Pane Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Connection & Rules */}
        <div className="lg:col-span-7 flex flex-col h-full">
          
          {/* State A: Disconnected */}
          {!isConnected && step === 'initial' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#182625] border border-slate-200/80 dark:border-[#213533] flex flex-col justify-between h-full gap-5">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Connect Facebook Page
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Connect your clinic's Facebook business page to activate SmileBot for 24/7 automated appointment booking, treatment rates, and operating hours inquiries.
                </p>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#131f1e] p-2.5 rounded-lg border border-slate-200/60 dark:border-[#213533]">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span>24/7 Automated Replies</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#131f1e] p-2.5 rounded-lg border border-slate-200/60 dark:border-[#213533]">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span>Live Booking Scheduling</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-[#213533] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleStartConnection}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0866FF] hover:bg-[#075CE5] active:bg-[#0650C9] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FacebookIcon size={18} />
                  <span>{loading ? 'Connecting...' : 'Connect with Facebook'}</span>
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  Official Meta Business API
                </span>
              </div>
            </div>
          )}

          {/* State A2: Page Selection Screen */}
          {step === 'selecting' && pages.length > 0 && (
            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#182625] border border-slate-200/80 dark:border-[#213533] flex flex-col justify-between h-full gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select a Facebook Page</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose which Facebook page represents your dental practice:</p>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="p-3 bg-white dark:bg-[#131f1e] border border-slate-200 dark:border-[#213533] rounded-xl flex items-center justify-between gap-3 shadow-3xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {page.picture?.data?.url ? (
                          <img
                            src={page.picture.data.url}
                            alt={page.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#0866FF]/10 text-[#0866FF] flex items-center justify-center font-bold text-xs shrink-0">
                            {page.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {page.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {page.category || 'Dental Clinic'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePageSelect(page)}
                        disabled={loading}
                        className="px-3.5 py-1.5 bg-[#0866FF] hover:bg-[#075CE5] text-white text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-[#213533]">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  Cancel selection
                </button>
              </div>
            </div>
          )}

          {/* State B: Connected - Manage Integration Card */}
          {isConnected && (
            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#182625] border border-slate-200/80 dark:border-[#213533] flex flex-col justify-between h-full gap-4">
              <div className="space-y-4">
                {/* Connected Page Identity */}
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-200/70 dark:border-[#213533]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {pageDetails?.picture?.data?.url ? (
                        <img
                          src={pageDetails.picture.data.url}
                          alt={activePageName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#0866FF] text-white flex items-center justify-center font-bold text-sm">
                          {activePageName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#182625] rounded-full" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {activePageName}
                        </h4>
                        <span className="text-[#0866FF]" title="Verified Facebook Page">
                          <ShieldCheck size={16} weight="fill" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ID: {activePageId} • {pageDetails?.category || 'Dental Clinic'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerDisconnect}
                    disabled={loading}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    Disconnect Page
                  </button>
                </div>

                {/* Master 24/7 AI Auto-Replies Toggle Switch */}
                <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#131f1e] rounded-xl border border-slate-200/70 dark:border-[#213533]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Enable 24/7 AI Auto-Replies
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                      Automatically replies to incoming patient inquiries and booking requests
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleMessenger && onToggleMessenger(!messengerEnabled)}
                    className="w-[50px] p-[2.5px] rounded-full transition-colors flex items-center cursor-pointer shrink-0"
                    style={{
                      background: messengerEnabled ? '#1A8A7A' : '#CECECE',
                      justifyContent: messengerEnabled ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div className="w-[16px] h-[16px] bg-white rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.15)]" />
                  </button>
                </div>
              </div>

              {/* Status Explanation Note */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-[#213533] flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" weight="bold" />
                <p className="leading-relaxed text-[11.5px]">
                  SmileBot is active on this Facebook Page. All incoming patient inquiries receive instant responses.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Interactive Messenger Sandbox / Live Preview */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-[#F8FAFC] dark:bg-[#0f1716] border border-slate-200 dark:border-[#1b2b29] rounded-xl flex flex-col h-full min-h-[350px] overflow-hidden">
            
            {/* Sandbox Header */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-[#182625] border-b border-slate-200/80 dark:border-[#1b2b29] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-[10px] font-bold">
                  SB
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">SmileBot</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Live Messenger Test</p>
                </div>
              </div>

              {/* Status indicator tied to live state */}
              {isConnected ? (
                messengerEnabled ? (
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Auto-Reply Paused
                  </span>
                )
              ) : (
                <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  Offline
                </span>
              )}
            </div>

            {/* Chat Bubble Stream */}
            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col min-h-[220px]">
              <AnimatePresence initial={false}>
                {simMessages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[85%] text-[11.5px] leading-relaxed px-3 py-1.5 rounded-2xl ${
                        isUser
                          ? 'ml-auto bg-[#0866FF] text-white rounded-br-xs'
                          : 'mr-auto bg-white dark:bg-[#182625] text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-[#213533] rounded-bl-xs shadow-3xs'
                      }`}
                    >
                      {msg.text}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {simIsTyping && (
                <div className="mr-auto bg-white dark:bg-[#182625] border border-slate-200/70 dark:border-[#213533] px-2.5 py-1.5 rounded-2xl rounded-bl-xs flex items-center gap-1 shadow-3xs">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Interactive Test Input Bar */}
            <form
              onSubmit={handleSendTestMessage}
              className="p-2 bg-white dark:bg-[#182625] border-t border-slate-200/80 dark:border-[#1b2b29] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Send a test message to preview auto-replies..."
                className="flex-1 bg-slate-100 dark:bg-[#131f1e] text-[11px] text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
              />
              <button
                type="submit"
                disabled={!testInput.trim() || simIsTyping}
                className="w-7 h-7 rounded-full bg-[#0866FF] hover:bg-[#075CE5] text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-all"
                title="Send test message"
              >
                <PaperPlaneRight size={12} weight="bold" />
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        isOpen={showDisconnectConfirm}
        title="Disconnect Facebook Page"
        message="Are you sure you want to disconnect this Facebook page? Automated messaging and appointment scheduling will stop."
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
