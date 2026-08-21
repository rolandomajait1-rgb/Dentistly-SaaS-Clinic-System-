import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Container, Heading } from '../../../design-system';
import { FADE_UP_VARIANTS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';
import assets from '../../../assets';

export default function ChatbotDemo() {
  const [chatState, setChatState] = useState('initial');
  const [chatMessages, setChatMessages] = useState([
    { who: 'bot', text: "Hi! I'm SmileBot 👋 Welcome to Happy Smiles Dental. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChip, setActiveChip] = useState(null);
  const chatEndRef = useRef(null);
  
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  /* Auto-scroll chat simulator */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  /* Parallax 3D Card Tilt */
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;
    const rect = container.getBoundingClientRect();
    const xVal = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const yVal = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const rx = 6 - (yVal * 12);
    const ry = -8 + (xVal * 10);
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform .5s ease';
    card.style.transform = 'perspective(1000px) rotateX(3deg) rotateY(-5deg)';
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform .1s ease';
  };

  const getQuickReplies = () => {
    switch (chatState) {
      case 'initial':
        return [
          { id: 'book', label: 'Book Cleaning 🦷', pulse: true },
          { id: 'prices', label: 'Check Rates ₱' },
          { id: 'location', label: 'Hours & Location 📍' },
          { id: 'end', label: 'End Conversation 👋' }
        ];
      case 'booking_day':
        return [
          { id: 'book_tomorrow', label: 'Tomorrow (June 25) 📅' },
          { id: 'book_friday', label: 'Friday (June 27) 📅' },
          { id: 'back', label: '← Back to Menu' }
        ];
      case 'booking_time':
        return [
          { id: 'time_10am', label: '10:00 AM 🕒' },
          { id: 'time_2pm', label: '2:00 PM 🕒' },
          { id: 'back', label: '← Back to Menu' }
        ];
      case 'booking_phone':
        return [
          { id: 'submit_phone', label: 'Send Phone Number 📱', pulse: true },
          { id: 'back', label: '← Back to Menu' }
        ];
      case 'booking_finished':
        return [
          { id: 'restart', label: '← Start Over 🔄', pulse: true }
        ];
      case 'prices':
        return [
          { id: 'book', label: 'Book Cleaning Now 🦷', pulse: true },
          { id: 'back', label: '← Main Menu' }
        ];
      case 'location':
        return [
          { id: 'book', label: 'Book Appointment 🦷', pulse: true },
          { id: 'back', label: '← Main Menu' }
        ];
      case 'dentist':
        return [
          { id: 'location', label: 'Show Clinic Hours 📍' },
          { id: 'back', label: '← Main Menu' }
        ];
      default:
        return [];
    }
  };

  const handleQuickReply = (id) => {
    if (isTyping) return;
    setActiveChip(id);
    
    let userMsg = '';
    let botReply = '';
    let nextState = 'initial';
    
    if (id === 'restart') {
      setChatMessages([
        { who: 'bot', text: "Hi! I'm SmileBot 👋 Welcome to Happy Smiles Dental. How can I help you today?" }
      ]);
      setChatState('initial');
      setActiveChip(null);
      return;
    }

    if (id === 'back') {
      userMsg = 'Back to menu';
      botReply = "How else can I assist you today? 😊";
      nextState = 'initial';
    } else {
      switch (chatState) {
        case 'initial':
          if (id === 'book') {
            userMsg = "I'd like to book an appointment 🦷";
            botReply = "Awesome! We have slots open this week. What day works best for you?";
            nextState = 'booking_day';
          } else if (id === 'prices') {
            userMsg = "Can I check your services & rates? ₱";
            botReply = "Here are our popular services:\n• Dental Cleaning: ₱1,500\n• Composite Filling: ₱1,000\n• Tooth Extraction: ₱1,200\n• Teeth Whitening: ₱7,000\n\nAll services can be settled via GCash, Maya, or Cash.";
            nextState = 'prices';
          } else if (id === 'location') {
            userMsg = "Where is your clinic and what are your hours? 📍";
            botReply = "📍 We are located at 123 Rizal Avenue, Makati City (near Greenbelt).\n\n🕒 Hours:\nMonday–Saturday: 8:00 AM – 6:00 PM\nSunday: Closed";
            nextState = 'location';
          } else if (id === 'dentist') {
            userMsg = "I need to talk to a dentist 💬";
            botReply = "Understood. I've alerted our front desk team. A staff member will jump into this chat shortly! Can I help you with anything else in the meantime?";
            nextState = 'dentist';
          } else if (id === 'end') {
            userMsg = "End conversation 👋";
            botReply = "👋 Thank you for reaching out! Have a great day! 😊\n\nIf you need help again in the future, just choose an option to restart the conversation.";
            nextState = 'booking_finished';
          }
          break;
          
        case 'prices':
        case 'location':
        case 'dentist':
          if (id === 'book') {
            userMsg = "I'd like to book an appointment 🦷";
            botReply = "Awesome! We have slots open this week. What day works best for you?";
            nextState = 'booking_day';
          } else if (id === 'location') {
            userMsg = "Show clinic hours 📍";
            botReply = "📍 We are located at 123 Rizal Avenue, Makati City (near Greenbelt).\n\n🕒 Hours:\nMonday–Saturday: 8:00 AM – 6:00 PM\nSunday: Closed";
            nextState = 'location';
          }
          break;
          
        case 'booking_day':
          if (id === 'book_tomorrow') {
            userMsg = "Tomorrow (June 25) 📅";
            botReply = "Tomorrow sounds great! What time would you prefer?";
            nextState = 'booking_time';
          } else if (id === 'book_friday') {
            userMsg = "Friday (June 27) 📅";
            botReply = "Friday is perfect! What time would you prefer?";
            nextState = 'booking_time';
          }
          break;
          
        case 'booking_time':
          if (id === 'time_10am') {
            userMsg = "10:00 AM 🕒";
            botReply = "Got it! Your slot for 10:00 AM is reserved. To finish booking, what is the best mobile number to contact you at?";
            nextState = 'booking_phone';
          } else if (id === 'time_2pm') {
            userMsg = "2:00 PM 🕒";
            botReply = "Got it! Your slot for 2:00 PM is reserved. To finish booking, what is the best mobile number to contact you at?";
            nextState = 'booking_phone';
          }
          break;
          
        case 'booking_phone':
          if (id === 'submit_phone') {
            userMsg = "+63 917 123 4567 📱";
            botReply = "Thank you! Your appointment is confirmed! 🎉 You will receive a confirmation reminder shortly. Looking forward to seeing you!";
            nextState = 'booking_finished';
          }
          break;
          
        default:
          break;
      }
    }
    
    // Add user message
    setChatMessages(prev => [...prev, { who: 'user', text: userMsg }]);
    
    // Trigger typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 300);
    
    // Trigger bot reply
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { who: 'bot', text: botReply }]);
      setChatState(nextState);
      setActiveChip(null);
    }, 1500);
  };

  return (
    <Section id="chatbot-demo" variant="transparent">
      {/* Unified Background System */}
      <UnifiedBackground />
      
      {/* Very subtle dotted pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle, #004E47 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      
      {/* Much lighter gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-indigo-500/2" />
      
      {/* Dynamic Glowing ambient lights */}
      <motion.div 
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-25 z-0" 
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(99,102,241,0.06) 50%, transparent 80%)' }} 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Bottom fade mask */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-b from-transparent to-[#e6f0fa] pointer-events-none z-10" />

      <Container className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Left Column: Copy & Improved Features Grid */}
        <motion.div variants={FADE_UP_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary/10 to-emerald-500/10 border border-primary/20 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">AI Chatbot Assistant</span>
          </div>

          <Heading level={2} className="my-6">
            Your Facebook Page.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-teal-400">Booking Machine.</span>
          </Heading>

          <p className="text-slate-600 text-[15.5px] leading-relaxed mb-12 max-w-[480px] font-medium">
            Patients message your clinic on Messenger. The AI chatbot answers location queries, gives service pricing, and books slots directly — showing up on your dashboard instantly.
          </p>

          {/* Upgraded Glassmorphic Feature Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg"
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { 
                label: '24/7 Availability', 
                desc: 'Answering patients at midnight',
                icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                label: 'Auto-Capture', 
                desc: 'Name, phone, and services booked',
                icon: (
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              { 
                label: 'Zero-Code Setup', 
                desc: 'No dev skills needed to connect',
                icon: (
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { 
                label: 'Live Notifications', 
                desc: 'Alerts staff instantly on book',
                icon: (
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )
              },
            ].map((item) => (
              <motion.div 
                key={item.label} 
                variants={STAGGER_ITEM_VARIANTS} 
                className="flex gap-4 items-start p-4 rounded-2xl bg-white/25 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 shadow-xs hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 group cursor-default"
              >
                <div className="p-2.5 bg-primary/8 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors duration-300">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Upgraded Bezel Smartphone Mockup */}
        <motion.div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          className="w-full flex justify-center perspective-1000 py-8"
          initial={{ opacity: 0, scale: 0.96, y: 15 }} 
          whileInView={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
          viewport={{ once: true, margin: '-80px' }} 
        >
          {/* Bezel Smartphone container - Silver Titanium Pro Max style */}
          <div 
            ref={cardRef} 
            className="relative w-full max-w-[340px] md:max-w-[360px] bg-linear-to-b from-[#e3e4e6] via-[#d1d2d5] to-[#e3e4e6] rounded-[52px] p-[8px] shadow-[0_30px_70px_rgba(0,78,71,0.06),0_15px_35px_rgba(0,0,0,0.15)] border border-[#afb1b4] transition-all duration-500 transform-gpu cursor-pointer select-none"
            style={{ transform: 'perspective(1000px) rotateX(3deg) rotateY(-5deg)', transformStyle: 'preserve-3d' }}
          >
            {/* Silver Side Buttons */}
            {/* Left: Volume Up */}
            <div className="absolute left-[-2.5px] top-[110px] w-[3px] h-[35px] bg-[#b0b2b5] rounded-r-[1.5px] border border-black/15 shadow-[inset_1px_0_1px_rgba(255,255,255,0.5)]" />
            {/* Left: Volume Down */}
            <div className="absolute left-[-2.5px] top-[155px] w-[3px] h-[35px] bg-[#b0b2b5] rounded-r-[1.5px] border border-black/15 shadow-[inset_1px_0_1px_rgba(255,255,255,0.5)]" />
            {/* Right: Power Button */}
            <div className="absolute right-[-2.5px] top-[135px] w-[3px] h-[55px] bg-[#b0b2b5] rounded-l-[1.5px] border border-black/15 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.5)]" />

            {/* Screen bezel panel (iPhone Bezel style, h-[580px] for sleek long aspect ratio) */}
            <div className="relative w-full h-[580px] bg-[#f4f7f6] rounded-[44px] overflow-hidden flex flex-col border-[4.5px] border-black shadow-[inset_0_0_8px_rgba(0,0,0,0.25)] z-10">
              
              {/* Screen Glass Reflection Shine */}
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/[0.06] to-white/[0.12] pointer-events-none z-45" />

              {/* iOS Bottom Swipe Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-[4px] bg-black/20 rounded-full z-50 pointer-events-none" />

              {/* Curved Top Notch from User Reference Image */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[18px] bg-black rounded-b-[12px] z-50 pointer-events-none flex flex-col items-center justify-start pt-[3px]">
                {/* Thin speaker line inside notch */}
                <div className="w-[30px] h-[2px] bg-neutral-800 rounded-full" />
              </div>

              {/* Phone Status Bar */}
              <div className="h-9.5 bg-white flex items-end justify-between px-6 pb-2 shrink-0 z-40">
                <span className="text-[10px] text-slate-700 font-bold font-sans">9:41</span>
                <div className="flex items-center gap-1.5 text-slate-600 text-[10px]">
                  {/* Cellular strength */}
                  <svg className="w-3 h-3 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="16" width="3" height="5" rx="0.5" />
                    <rect x="7" y="12" width="3" height="9" rx="0.5" />
                    <rect x="12" y="8" width="3" height="13" rx="0.5" />
                    <rect x="17" y="3" width="3" height="18" rx="0.5" />
                  </svg>
                  {/* WiFi Icon */}
                  <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.14 0M1.93 7.93a15.9 15.9 0 0122.14 0" />
                  </svg>
                  {/* Battery Charge */}
                  <div className="w-5 h-2.5 border border-slate-700 rounded-[3px] p-px flex items-center">
                    <div className="h-full w-4/5 bg-emerald-600 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Chat App Header using official phone design SVG */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-md z-30 select-none shrink-0 flex items-center justify-center">
                <img 
                  src={assets.phoneChatbotLogo} 
                  alt="Pivodent Bot Active Now" 
                  className="w-full h-auto max-h-9 object-contain" 
                />
              </div>

              {/* Messages Body */}
              <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto bg-[#f8faf9] flex flex-col justify-start">
                <AnimatePresence>
                  {chatMessages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex gap-2 max-w-[85%] ${m.who === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {/* Bot Message Avatar */}
                      {m.who === 'bot' && (
                        <img 
                          src={assets.phoneIconContainer} 
                          alt="SmileBot" 
                          className="w-9 h-9 object-contain shrink-0 self-end mb-0.5" 
                        />
                      )}
                      
                      {/* Message Bubble */}
                      <div 
                        className={
                          m.who === 'user' 
                            ? 'bg-primary text-white rounded-2xl rounded-tr-xs text-[12px] px-4 py-2.5 leading-relaxed shadow-sm' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-xs text-[12px] px-4 py-2.5 leading-relaxed shadow-xs'
                        } 
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2 self-start items-center max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] text-primary shrink-0 self-end">
                      🤖
                    </div>
                    <div className="flex gap-1.5 bg-white border border-slate-100 rounded-2xl rounded-tl-xs px-4 py-3.5 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick reply chips with dynamic responses */}
              <div className="px-4 py-3.5 flex flex-wrap gap-2 border-t border-slate-100 bg-white/80 backdrop-blur-xs justify-center select-none shrink-0 z-30">
                {getQuickReplies().map(chip => (
                  <button
                    key={chip.id}
                    disabled={activeChip !== null}
                    onClick={(e) => { e.stopPropagation(); handleQuickReply(chip.id); }}
                    className="cursor-pointer px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-transparent text-[11px] font-bold tracking-tight shadow-xs transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {chip.pulse && !activeChip && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    )}
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input bar bottom mockup */}
              <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3 bg-white select-none shrink-0">
                {/* Actions icons */}
                <div className="flex gap-2.5 text-slate-400">
                  <svg className="w-5 h-5 hover:text-slate-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <svg className="w-5 h-5 hover:text-slate-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-150 rounded-full px-5 py-1.5 text-[11px] text-slate-400 font-semibold select-none">
                  {chatState === 'booking_finished' ? 'Select "Start Over" above' : 'Choose a preset reply...'}
                </div>
                {/* Send Icon */}
                <svg className="w-5 h-5 text-slate-455 cursor-pointer hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

