import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Container, Heading } from '../../../design-system';
import { FADE_UP_VARIANTS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';
import assets from '../../../assets';

export default function EmailAutomation() {
  const [activeEmailIndex, setActiveEmailIndex] = useState(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  /* Parallax 3D Card Tilt */
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;
    const rect = container.getBoundingClientRect();
    const xVal = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const yVal = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const rx = 4 - yVal * 10;
    const ry = -6 + xVal * 10;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform .5s ease';
    card.style.transform = 'perspective(1000px) rotateX(2deg) rotateY(-4deg)';
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform .1s ease';
  };

  const emails = [
    {
      id: 'email-1',
      sender: 'Pivodent Clinic',
      time: '10:02 AM',
      unread: true,
      subject: 'Your appointment is confirmed ✓',
      snippet: 'Hi Maria! Your dental checkup is scheduled for...',
      tag: 'Confirmation',
      fullBody: {
        title: 'Appointment Confirmed! 🦷',
        greeting: 'Dear Maria Santos,',
        desc: 'Your dental appointment has been successfully scheduled with Dr. Sarah Jenkins at Pivodent Clinic.',
        details: [
          { label: 'Service', val: 'Comprehensive Oral Checkup & Cleaning' },
          { label: 'Date & Time', val: 'Friday, June 27, 2026 at 10:00 AM' },
          { label: 'Doctor', val: 'Dr. Sarah Jenkins, DMD' },
          { label: 'Location', val: 'Suite 402, Medical Arts Bldg, Ayala Ave' },
        ],
        note: 'Need to reschedule? You can do so up to 24 hours prior directly from this email.',
      }
    },
    {
      id: 'email-2',
      sender: 'Pivodent Clinic',
      time: 'Yesterday',
      unread: false,
      subject: 'Reminder: appointment tomorrow',
      snippet: 'Just a reminder that you have an appointment...',
      tag: 'Reminder',
      fullBody: {
        title: 'Appointment Reminder ⏰',
        greeting: 'Hi Maria,',
        desc: 'This is a friendly reminder for your upcoming appointment tomorrow at Pivodent Clinic.',
        details: [
          { label: 'Service', val: 'Routine Cleaning & Polishing' },
          { label: 'Date & Time', val: 'Tomorrow at 2:00 PM' },
          { label: 'Clinic', val: 'Pivodent Clinic Main Branch' },
        ],
        note: 'Please arrive 10 minutes early to complete your quick digital check-in.',
      }
    },
    {
      id: 'email-3',
      sender: 'Pivodent Clinic',
      time: 'Mon',
      unread: false,
      subject: 'How was your visit? 😊',
      snippet: 'We hope you had a great experience. Here are...',
      tag: 'Follow-up',
      fullBody: {
        title: 'Post-Care Instructions & Feedback 😊',
        greeting: 'Hello Maria,',
        desc: 'Thank you for visiting Pivodent Clinic today! We hope your treatment went smoothly.',
        details: [
          { label: 'Post-Care', val: 'Avoid hot/cold drinks for the next 2 hours' },
          { label: 'Next Visit', val: 'Recommended in 6 months (Dec 2026)' },
        ],
        note: 'Would you take 30 seconds to rate your experience? Your feedback helps us serve you better!',
      }
    }
  ];

  const featureCards = [
    {
      title: 'Appointment Reminders',
      desc: 'Automatic emails 24h & 1h prior',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      ),
    },
    {
      title: 'Follow-up Sequences',
      desc: 'Care steps & rebooking nudges',
      icon: (
        <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: 'Instant Confirmations',
      desc: 'Branded email sent on booking',
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'No-show Recovery',
      desc: 'Auto-reactivate missed patients',
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <Section id="email-automation" variant="transparent" className="relative overflow-hidden py-16 lg:py-24">
      {/* Unified Background System */}
      <UnifiedBackground />

      {/* Dotted Ambient Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #004E47 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Dynamic Glowing ambient light */}
      <motion.div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-20 z-0"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, rgba(99,102,241,0.05) 50%, transparent 80%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.25, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left Column: Phone Mockup with Email Inbox */}
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
            {/* Phone Outer Bezel */}
            <div
              ref={cardRef}
              className="relative w-full max-w-[325px] sm:max-w-[345px] bg-linear-to-b from-[#e3e4e6] via-[#d1d2d5] to-[#e3e4e6] rounded-[52px] p-[8px] shadow-[0_30px_70px_rgba(0,78,71,0.06),0_15px_35px_rgba(0,0,0,0.16)] border border-[#afb1b4] transition-all duration-500 transform-gpu select-none"
              style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-4deg)', transformStyle: 'preserve-3d' }}
            >
              {/* Hardware buttons */}
              <div className="absolute left-[-2.5px] top-[105px] w-[3px] h-[35px] bg-[#b0b2b5] rounded-r-[1.5px] border border-black/15" />
              <div className="absolute left-[-2.5px] top-[150px] w-[3px] h-[35px] bg-[#b0b2b5] rounded-r-[1.5px] border border-black/15" />
              <div className="absolute right-[-2.5px] top-[130px] w-[3px] h-[52px] bg-[#b0b2b5] rounded-l-[1.5px] border border-black/15" />

              {/* Screen Inner Frame */}
              <div className="relative bg-white rounded-[44px] overflow-hidden border-[4px] border-black shadow-[inset_0_0_8px_rgba(0,0,0,0.2)] flex flex-col h-[585px] text-slate-800">
                
                {/* Curved Top Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[18px] bg-black rounded-b-[12px] z-50 pointer-events-none flex flex-col items-center justify-start pt-[3px]">
                  {/* Thin speaker line */}
                  <div className="w-[30px] h-[2px] bg-neutral-800 rounded-full" />
                </div>

                {/* Top Status Bar */}
                <div className="h-9.5 bg-white flex items-end justify-between px-6 pb-2 shrink-0 z-40">
                  <span className="text-[10.5px] text-slate-900 font-bold font-sans">9:41</span>
                  {/* Status Icons */}
                  <div className="flex items-center gap-1.5 text-slate-700 text-[10px]">
                    {/* Cellular signal bars */}
                    <svg className="w-3 h-3 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="16" width="3" height="5" rx="0.5" />
                      <rect x="7" y="12" width="3" height="9" rx="0.5" />
                      <rect x="12" y="8" width="3" height="13" rx="0.5" />
                      <rect x="17" y="3" width="3" height="18" rx="0.5" />
                    </svg>
                    {/* WiFi Icon */}
                    <svg className="w-3.5 h-3.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.14 0M1.93 7.93a15.9 15.9 0 0122.14 0" />
                    </svg>
                    {/* Battery */}
                    <div className="w-5 h-2.5 border border-slate-800 rounded-[3px] p-[1px] flex items-center">
                      <div className="h-full w-full bg-[#00e676] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Inbox App Header */}
                <div className="px-4 py-2.5 flex items-center justify-between shrink-0 border-b border-slate-100 bg-white">
                  <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">Inbox</h3>
                  
                  {/* Search Pill */}
                  <div className="flex-1 max-w-[145px] mx-3 h-6 bg-[#e9ebed] rounded-full" />
                  
                  {/* Green '3' Badge */}
                  <div className="w-5.5 h-5.5 rounded-full bg-[#004e47] text-white text-[10.5px] font-bold flex items-center justify-center shadow-xs">
                    3
                  </div>
                </div>

                {/* Email List or Detail View */}
                <div className="flex-1 overflow-y-auto relative bg-white">
                  <AnimatePresence mode="wait">
                    {activeEmailIndex === null ? (
                      /* List View */
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="divide-y divide-slate-100"
                      >
                        {emails.map((email, idx) => (
                          <div
                            key={email.id}
                            onClick={() => setActiveEmailIndex(idx)}
                            className="px-3 py-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 active:bg-slate-100 bg-white"
                          >
                            {/* Exact Pivodent Tooth Brand Avatar from SVG Asset - enlarged */}
                            <img 
                              src={assets.phoneIconContainer} 
                              alt="Pivodent Clinic" 
                              className="shrink-0 w-11 h-11 object-contain -mt-1" 
                            />

                            {/* Email Item Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-slate-900 leading-tight">
                                  {email.sender}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {email.time}
                                  </span>
                                  {email.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#004e47]" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-[11px] truncate mt-0.5 ${email.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {email.subject}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                                {email.snippet}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      /* Detailed Email View */
                      <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 flex flex-col h-full bg-white text-left"
                      >
                        <button
                          onClick={() => setActiveEmailIndex(null)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 hover:text-teal-700 mb-3"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                          Back to Inbox
                        </button>

                        <div className="border border-slate-100 rounded-2xl p-3 bg-linear-to-b from-slate-50/50 to-white shadow-xs flex-1 flex flex-col justify-between overflow-y-auto">
                          <div>
                            {/* Email Subject & Brand Header */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={assets.phoneIconContainer} 
                                  alt="Pivodent Clinic" 
                                  className="w-10 h-10 object-contain shrink-0" 
                                />
                                <div>
                                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">Pivodent Clinic</h4>
                                  <span className="text-[9px] text-slate-400">notifications@pivodent.ph</span>
                                </div>
                              </div>
                              <span className="text-[9px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-100">
                                {emails[activeEmailIndex].tag}
                              </span>
                            </div>

                            <h3 className="text-xs font-bold text-slate-900 mb-1">
                              {emails[activeEmailIndex].fullBody.title}
                            </h3>
                            <p className="text-[10.5px] text-slate-600 mb-2.5">
                              {emails[activeEmailIndex].fullBody.desc}
                            </p>

                            {/* Details Box */}
                            <div className="bg-white rounded-xl border border-slate-100 p-2.5 space-y-1.5 shadow-2xs mb-2.5">
                              {emails[activeEmailIndex].fullBody.details.map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-400">{d.label}:</span>
                                  <span className="font-semibold text-slate-800 text-right">{d.val}</span>
                                </div>
                              ))}
                            </div>

                            <p className="text-[9.5px] text-slate-400 italic">
                              {emails[activeEmailIndex].fullBody.note}
                            </p>
                          </div>

                          <div className="pt-3">
                            <div className="w-full py-1.5 bg-[#004e47] text-white text-[10px] font-bold rounded-lg text-center shadow-xs">
                              Add to Google Calendar 📅
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Action Button (FAB) Compose */}
                  {activeEmailIndex === null && (
                    <div className="absolute bottom-4 right-4 z-20">
                      <button className="flex items-center gap-1.5 bg-[#405f77] hover:bg-[#344f63] text-white px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="text-[10.5px] font-semibold tracking-tight">Compose</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="h-11 bg-white border-t border-slate-100 px-12 flex items-center justify-around shrink-0">
                  {/* Mail icon */}
                  <div className="flex items-center justify-center text-slate-700 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {/* Video icon */}
                  <div className="flex items-center justify-center text-slate-700 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                      <path d="M15 10l5-3v10l-5-3v-4z" strokeLinejoin="round" />
                      <rect x="3" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="h-2 bg-white flex items-center justify-center shrink-0">
                  <div className="w-24 h-[3px] bg-slate-300 rounded-full" />
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Column: Copy & Improved Features Grid */}
          <motion.div variants={FADE_UP_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary/10 to-emerald-500/10 border border-primary/20 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Smart Email Automation</span>
            </div>

            <Heading level={2} className="my-6">
              Your Email Inbox.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-teal-400">Working for You.</span>
            </Heading>

            <p className="text-slate-600 text-[15.5px] leading-relaxed mb-12 max-w-[480px] font-medium">
              Every patient touchpoint — confirmations, reminders, follow-ups — handled automatically by email. Your staff focuses on care, not copy-paste.
            </p>

            {/* Upgraded Glassmorphic Feature Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {featureCards.map((item) => (
                <motion.div 
                  key={item.title} 
                  variants={STAGGER_ITEM_VARIANTS} 
                  className="flex gap-4 items-start p-4 rounded-2xl bg-white/25 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 shadow-xs hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 group cursor-default"
                >
                  <div className="p-2.5 bg-primary/8 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </Container>
    </Section>
  );
}
