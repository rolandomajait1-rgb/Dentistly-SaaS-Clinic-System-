import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  PaperPlaneRight
} from '@phosphor-icons/react';

import ConfirmModal from '../../../../components/ui/ConfirmModal';
import { useNotifications } from '../../../../context/NotificationContext';

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

  // Derived connection state
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

  // Preview / Live Test States
  const clinicDisplayName = clinicData?.clinic_name || 'pivodent';
  const [testInput, setTestInput] = useState('');
  const [simMessages, setSimMessages] = useState([
    { sender: 'user', text: 'Hi! Can I book teeth cleaning for tomorrow?' },
    {
      sender: 'bot',
      text: `Hello! Yes, slots are open tomorrow at 10:00 AM and 2:00 PM at ${clinicDisplayName}. Would you like to reserve?`
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

  const handleStartConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/auth-url`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to retrieve authorization URL');
      const data = await res.json();

      localStorage.setItem('oauth_provider', 'facebook');
      const targetUrl = data.auth_url || data.url;
      if (!targetUrl) throw new Error('Authorization URL not returned from server');
      window.location.href = targetUrl;
    } catch (err) {
      showToast(err.message || 'Error initiating connection', 'error');
      setLoading(false);
    }
  };

  const handlePageSelect = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/dashboard/facebook/connect`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token
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

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || 'OAuth callback failed');
        }

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

  // Live preview message sender
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
      let reply = `Thank you for contacting ${clinicDisplayName}! How may we help you today?`;

      if (lower.includes('clean') || lower.includes('rate') || lower.includes('price') || lower.includes('cost')) {
        reply = `Teeth Cleaning starts at ₱800. We also offer extractions, fillings, and braces. Would you like to book?`;
      } else if (lower.includes('sched') || lower.includes('book') || lower.includes('appoint') || lower.includes('hour') || lower.includes('time')) {
        reply = `We are open Monday to Saturday, 8:00 AM - 5:00 PM. Please send your name and contact number to reserve.`;
      } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
        reply = `We are located at ${clinicData?.address || 'our clinic'}. You are always welcome to visit!`;
      }

      setSimMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  const activePageName =
    selectedPage?.name ||
    clinicData?.fb_page_integration?.fb_page_name ||
    'Roland-Z';

  const activePageId =
    selectedPage?.id ||
    clinicData?.fb_page_integration?.fb_page_id ||
    '280666824134570';

  return (
    <div className="w-full p-5 bg-gradient-to-r from-white from-11% to-blue-200/40 rounded-2xl shadow-[0px_1px_2px_0px_rgba(15,41,64,0.04)] outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-4 overflow-hidden transition-all font-['Work_Sans',sans-serif]">
      {/* Header matching Figma */}
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="flex justify-start items-center gap-3">
          <div className="size-10 rounded-[20px] flex justify-center items-center">
            <FacebookIcon size={36} />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-[3px]">
            <div className="inline-flex justify-start items-center gap-2">
              <div className="text-teal-950 text-base font-semibold font-['Work_Sans'] leading-5">
                Facebook Messenger
              </div>
              <div className="px-2 py-0.5 bg-blue-50 rounded-[10px] flex justify-center items-center">
                <div className="text-blue-500 text-xs font-medium font-['Work_Sans']">Official API</div>
              </div>
            </div>
            <div className="text-slate-500 text-xs font-normal font-['Work_Sans'] leading-4">
              Automated patient appointment bookings and 24/7 AI inquiries.
            </div>
          </div>
        </div>

        {isConnected ? (
          <div className="px-3 py-[5px] bg-emerald-50 rounded-[20px] flex justify-start items-center gap-1.5">
            <div className="size-2 bg-emerald-500 rounded-full" />
            <div className="text-emerald-600 text-xs font-medium font-['Work_Sans']">Connected</div>
          </div>
        ) : (
          <div className="px-3 py-[5px] bg-slate-100 rounded-[20px] flex justify-start items-center gap-1.5">
            <div className="size-2 bg-slate-400 rounded-full" />
            <div className="text-slate-500 text-xs font-medium font-['Work_Sans']">Not Connected</div>
          </div>
        )}
      </div>

      {/* Main Two-Column: Settings (Left) & Preview (Right) */}
      <div className="w-full flex flex-col lg:flex-row justify-start items-stretch gap-4">
        
        {/* Left: Connection Controls */}
        <div className="flex-1 w-full min-w-0 h-72 relative bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 overflow-hidden flex flex-col justify-between">
          
          {/* Disconnected State */}
          {!isConnected && step === 'initial' && (
            <div className="p-4 flex flex-col justify-between h-full gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-teal-950">
                  Connect Clinic Page
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Link your Facebook business page to let SmileBot handle patient inquiries and appointments.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    24/7 Auto-Replies
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Live Booking
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleStartConnection}
                  disabled={loading}
                  className="px-4 py-2 bg-[#0866FF] hover:bg-[#075CE5] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FacebookIcon size={16} />
                  <span>{loading ? 'Connecting...' : 'Connect Facebook'}</span>
                </button>
                <span className="text-[11px] text-slate-400">Meta Business API</span>
              </div>
            </div>
          )}

          {/* Page Selection State */}
          {step === 'selecting' && pages.length > 0 && (
            <div className="p-4 flex flex-col justify-between h-full gap-3">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-teal-950">Select Facebook Page</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {page.picture?.data?.url ? (
                          <img
                            src={page.picture.data.url}
                            alt={page.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#0866FF]/10 text-[#0866FF] flex items-center justify-center font-bold text-xs shrink-0">
                            {page.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-xs text-slate-800 truncate">{page.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePageSelect(page)}
                        disabled={loading}
                        className="px-3 py-1 bg-[#0866FF] hover:bg-[#075CE5] text-white text-xs font-semibold rounded-md shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('initial')}
                className="text-xs text-slate-500 hover:text-slate-700 underline self-start cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Connected State (Matches Figma 1:1) */}
          {isConnected && (
            <>
              {/* Row 1: Page Header */}
              <div className="w-full h-14 px-4 py-3 bg-slate-50 border-b border-slate-200 inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-2.5">
                  <div className="size-9 rounded-2xl flex justify-center items-center overflow-hidden border border-slate-200 bg-white">
                    {pageDetails?.picture?.data?.url ? (
                      <img className="size-9 object-cover" src={pageDetails.picture.data.url} alt={activePageName} />
                    ) : (
                      <div className="size-9 bg-[#0866FF] text-white flex items-center justify-center font-bold text-xs">
                        {activePageName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="inline-flex flex-col justify-start items-start gap-0.5">
                    <div className="inline-flex justify-start items-center gap-1.5">
                      <div className="text-teal-950 text-sm font-semibold font-['Work_Sans']">{activePageName}</div>
                      <div className="size-4 bg-blue-600 rounded-md flex justify-center items-center text-white text-[10px] font-bold">
                        ✓
                      </div>
                    </div>
                    <div className="text-slate-500 text-xs font-normal font-['Work_Sans']">ID: {activePageId}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerDisconnect}
                  disabled={loading}
                  className="text-red-500 text-xs font-semibold font-['Work_Sans'] hover:underline cursor-pointer disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>

              {/* Row 2: AI Auto-Replies Toggle */}
              <div className="w-full h-14 px-4 bg-white border-b border-slate-200 inline-flex justify-between items-center">
                <div className="inline-flex flex-col justify-start items-start gap-[3px]">
                  <div className="text-teal-950 text-sm font-semibold font-['Work_Sans']">24/7 AI Auto-Replies</div>
                  <div className="text-slate-500 text-xs font-normal font-['Work_Sans']">Respond automatically to patient messages.</div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleMessenger && onToggleMessenger(!messengerEnabled)}
                  className="w-14 px-1 py-[3px] rounded-full inline-flex flex-col justify-center transition-colors cursor-pointer shrink-0"
                  style={{
                    background: messengerEnabled ? '#0D9488' : '#CBD5E1',
                    alignItems: messengerEnabled ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div className="size-4 bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]" />
                </button>
              </div>

              {/* Row 3: Spacer */}
              <div className="flex-1" />

              {/* Row 4: Status Banner at Bottom */}
              <div className="w-full h-8 px-4 py-2 bg-emerald-50 inline-flex justify-start items-center gap-2">
                <div className="size-2.5 bg-emerald-500 rounded-full shrink-0" />
                <div className="text-emerald-800 text-xs font-normal font-['Work_Sans']">
                  SmileBot is active and handling incoming patient chats.
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right: Live Preview Box (Matches Figma 1:1) */}
        <div className="w-full lg:w-[534px] h-72 relative bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 overflow-hidden flex flex-col justify-between shrink-0">
          
          {/* Header */}
          <div className="w-full h-14 px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 inline-flex justify-between items-center shrink-0">
            <div className="flex justify-start items-center gap-2">
              <div className="h-7 w-7 rounded-2xl flex justify-center items-center overflow-hidden border border-slate-200 bg-white">
                {pageDetails?.picture?.data?.url ? (
                  <img className="size-7 object-cover" src={pageDetails.picture.data.url} alt={activePageName} />
                ) : (
                  <div className="size-7 bg-[#0866FF] text-white flex items-center justify-center font-bold text-xs">
                    {activePageName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-px">
                <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">{activePageName}</div>
                <div className="text-slate-500 text-xs font-normal font-['Work_Sans']">Live Preview</div>
              </div>
            </div>
            
            <div className="px-2.5 py-0.5 bg-green-500 rounded-[30px] flex justify-center items-center gap-2.5">
              <div className="text-green-100 text-xs font-medium font-['Work_Sans'] leading-4">Active</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="w-full p-3.5 flex-1 overflow-y-auto flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch inline-flex justify-end items-start">
              <div className="px-3 py-2 bg-blue-600 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm flex justify-start items-start max-w-[85%]">
                <div className="text-white text-xs font-normal font-['Work_Sans'] leading-relaxed">
                  Hi! Can I book teeth cleaning for tomorrow?
                </div>
              </div>
            </div>

            <div className="self-stretch inline-flex justify-start items-start">
              <div className="px-3 py-2 bg-slate-100 rounded-tl-xl rounded-tr-xl rounded-bl-sm rounded-br-xl flex justify-start items-start max-w-[85%]">
                <div className="text-teal-950 text-xs font-normal font-['Work_Sans'] leading-relaxed">
                  Hello! Yes, slots are open tomorrow at 10:00 AM and 2:00 PM at pivodent. Would you like to reserve?
                </div>
              </div>
            </div>

            {simMessages.slice(2).map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`self-stretch inline-flex ${isUser ? 'justify-end' : 'justify-start'} items-start`}>
                  <div className={`px-3 py-2 ${isUser ? 'bg-blue-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm' : 'bg-slate-100 text-teal-950 rounded-tl-xl rounded-tr-xl rounded-bl-sm rounded-br-xl'} text-xs font-normal font-['Work_Sans'] max-w-[85%] leading-relaxed`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {simIsTyping && (
              <div className="mr-auto bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-2xl flex items-center gap-1 text-slate-400 text-[10px]">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Test Input Form */}
          <form onSubmit={handleSendTestMessage} className="w-full h-12 bg-slate-50 border-t border-slate-200 px-3 flex items-center justify-between gap-2 shrink-0">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type a test message..."
              className="flex-1 h-8 px-3 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 text-slate-700 placeholder-slate-400 text-xs font-normal font-['Work_Sans'] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!testInput.trim() || simIsTyping}
              className="size-8 bg-blue-800 hover:bg-blue-900 rounded-2xl flex justify-center items-center text-white shrink-0 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
            >
              <PaperPlaneRight size={13} weight="fill" />
            </button>
          </form>

        </div>

      </div>

      {/* Disconnect Modal */}
      <ConfirmModal
        isOpen={showDisconnectConfirm}
        title="Disconnect Facebook Page"
        message="Are you sure you want to disconnect this Facebook page? Automated messaging will stop."
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