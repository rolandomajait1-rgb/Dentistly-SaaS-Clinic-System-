import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Container, Heading } from '../../../design-system';
import { FADE_UP_VARIANTS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

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
      sender: 'Pixodent Clinic',
      time: '10:02 AM',
      unread: true,
      subject: 'Your appointment is confirmed ✓',
      snippet: 'Hi Maria! Your dental checkup is scheduled for Friday, June 27 at 10:00 AM. Click here to add to calendar...',
      tag: 'Confirmation',
      fullBody: {
        title: 'Appointment Confirmed! 🦷',
        greeting: 'Dear Maria Santos,',
        desc: 'Your dental appointment has been successfully scheduled with Dr. Sarah Jenkins at Pixodent Clinic.',
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
      sender: 'Pixodent Clinic',
      time: 'Yesterday',
      unread: false,
      subject: 'Reminder: appointment tomorrow',
      snippet: 'Just a reminder that you have an appointment scheduled for tomorrow at 2:00 PM with Dr. Jenkins...',
      tag: 'Reminder',
      fullBody: {
        title: 'Appointment Reminder ⏰',
        greeting: 'Hi Maria,',
        desc: 'This is a friendly reminder for your upcoming appointment tomorrow at Pixodent Clinic.',
        details: [
          { label: 'Service', val: 'Routine Cleaning & Polishing' },
          { label: 'Date & Time', val: 'Tomorrow at 2:00 PM' },
          { label: 'Clinic', val: 'Pixodent Clinic Main Branch' },
        ],
        note: 'Please arrive 10 minutes early to complete your quick digital check-in.',
      }
    },
    {
      id: 'email-3',
      sender: 'Pixodent Clinic',
      time: 'Mon',
      unread: false,
      subject: 'How was your visit? 💛',
      snippet: 'We hope you had a great experience. Here are post-care instructions and a quick link to rate us...',
      tag: 'Follow-up',
      fullBody: {
        title: 'Post-Care Instructions & Feedback 💛',
        greeting: 'Hello Maria,',
        desc: 'Thank you for visiting Pixodent Clinic today! We hope your treatment went smoothly.',
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
      desc: 'Automatic emails 24h and 1h before every appointment — zero manual sending.',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      ),
    },
    {
      title: 'Follow-up Sequences',
      desc: 'Post-visit care instructions and rebooking nudges sent on your schedule.',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: 'Instant Confirmations',
      desc: 'Booking confirmed? Patient gets a branded email with all the details right away.',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'No-show Recovery',
      desc: 'Missed appointment detected — a re-engagement email goes out automatically.',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Phone Mockup with Email Inbox */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className="lg:col-span-5 flex justify-center perspective-1000"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* Phone Outer Bezel */}
            <div
              ref={cardRef}
              className="relative w-full max-w-[330px] sm:max-w-[350px] bg-linear-to-b from-[#e5e7eb] via-[#d1d5db] to-[#e5e7eb] rounded-[48px] p-[8px] shadow-[0_25px_60px_rgba(0,78,71,0.08),0_12px_30px_rgba(0,0,0,0.12)] border border-[#9ca3af] transition-all duration-500 transform-gpu select-none"
              style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-4deg)', transformStyle: 'preserve-3d' }}
            >
              {/* Hardware buttons */}
              <div className="absolute left-[-2.5px] top-[100px] w-[3px] h-[32px] bg-[#9ca3af] rounded-r-[1.5px]" />
              <div className="absolute left-[-2.5px] top-[140px] w-[3px] h-[32px] bg-[#9ca3af] rounded-r-[1.5px]" />
              <div className="absolute right-[-2.5px] top-[120px] w-[3px] h-[50px] bg-[#9ca3af] rounded-l-[1.5px]" />

              {/* Screen Inner Frame */}
              <div className="relative bg-white rounded-[40px] overflow-hidden border border-slate-200/80 shadow-inner flex flex-col h-[580px] text-slate-800">
                
                {/* Top Status Bar */}
                <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight text-slate-800 shrink-0">
                  <span>9:41</span>
                  {/* Dynamic Island */}
                  <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2">
                    <div className="w-2 h-2 rounded-full bg-[#1c1c1e] mr-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0a84ff]/60" />
                  </div>
                  {/* Status Icons */}
                  <div className="flex items-center gap-1.5">
                    {/* Signal */}
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 h-1 bg-slate-800 rounded-xs" />
                      <span className="w-0.5 h-1.5 bg-slate-800 rounded-xs" />
                      <span className="w-0.5 h-2 bg-slate-800 rounded-xs" />
                      <span className="w-0.5 h-2.5 bg-slate-800 rounded-xs" />
                    </div>
                    {/* Wifi */}
                    <svg className="w-3 h-3 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A17.9 17.9 0 0012 4zm0 3.5c3.67 0 7.02 1.34 9.61 3.58L12 19.34 2.39 11.08C4.98 8.84 8.33 7.5 12 7.5z" />
                    </svg>
                    {/* Battery */}
                    <div className="w-4 h-2.5 border border-slate-800 rounded-[3px] p-[1px] flex items-center">
                      <div className="h-full w-full bg-emerald-500 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Inbox App Header */}
                <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Inbox</h3>
                  </div>
                  {/* Search Capsule */}
                  <div className="flex-1 max-w-[145px] mx-2 h-7 bg-slate-100 rounded-full px-2.5 flex items-center gap-1.5 text-slate-400">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="text-[10px] truncate">Search emails</span>
                  </div>
                  {/* Clinic/User Avatar */}
                  <div className="w-6 h-6 rounded-full bg-[#004e47] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    D
                  </div>
                </div>

                {/* Email List or Detail View */}
                <div className="flex-1 overflow-y-auto relative bg-[#fcfdfe]">
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
                            className={`px-3.5 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/80 ${
                              email.unread ? 'bg-teal-50/20' : 'bg-transparent'
                            }`}
                          >
                            {/* Tooth Brand Avatar */}
                            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-teal-600 mt-0.5 shadow-2xs">
                              {/* Tooth SVG Icon */}
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2C8.5 2 6 4 6 7c0 4.5 2 9 3 13 0 1 .5 2 1.5 2s1.5-1 1.5-2c0-2 .5-4 0-6-.5 2 0 4 0 6 0 1 .5 2 1.5 2s1.5-1 1.5-2c1-4 3-8.5 3-13 0-3-2.5-5-6-5z" />
                              </svg>
                            </div>

                            {/* Email Item Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-[12px] ${email.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                  {email.sender}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {email.time}
                                  </span>
                                  {email.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-[11.5px] truncate mt-0.5 ${email.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                {email.subject}
                              </p>
                              <p className="text-[10.5px] text-slate-400 truncate mt-0.5 leading-tight">
                                {email.snippet}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Subtle helper text at bottom of inbox list */}
                        <div className="px-4 py-6 text-center">
                          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Tap any email to preview patient receipt
                          </p>
                        </div>
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
                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  🦷
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">Pixodent Clinic</h4>
                                  <span className="text-[9px] text-slate-400">notifications@pixodent.com</span>
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
                      <button className="flex items-center gap-1.5 bg-[#28434e] hover:bg-[#1f353e] text-white px-3.5 py-2 rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-transform active:scale-95">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="text-[11px] font-semibold tracking-tight">Compose</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="h-12 bg-white border-t border-slate-100 px-10 flex items-center justify-around shrink-0">
                  {/* Mail icon active */}
                  <div className="flex flex-col items-center gap-0.5 text-teal-700 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="w-1 h-1 rounded-full bg-teal-600" />
                  </div>
                  {/* Video / Meet icon */}
                  <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Column: Copy & 2x2 Feature Cards Grid */}
          <motion.div
            className="lg:col-span-7"
            variants={FADE_UP_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* Main Header */}
            <Heading level={2} className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Your Email Inbox.
              <br />
              <span className="text-[#008770] font-extrabold">
                Working for You.
              </span>
            </Heading>

            {/* Subtitle description */}
            <p className="text-slate-600 text-base sm:text-[16.5px] leading-relaxed mb-10 max-w-xl font-normal">
              Every patient touchpoint — confirmations, reminders, follow-ups — handled automatically by email. Your staff focuses on care, not copy-paste.
            </p>

            {/* 2x2 Feature Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {featureCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={STAGGER_ITEM_VARIANTS}
                  className="p-5 sm:p-6 rounded-[22px] bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,78,71,0.06)] hover:border-teal-300/60 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      {card.icon}
                    </div>

                    {/* Card Title */}
                    <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-200">
                      {card.title}
                    </h4>

                    {/* Card Description */}
                    <p className="text-[12.5px] sm:text-[13px] text-slate-500 leading-relaxed mt-1.5 font-normal">
                      {card.desc}
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
