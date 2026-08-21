import { useState } from 'react';
import { motion } from 'framer-motion';
import UnifiedBackground from './UnifiedBackground.jsx';

function SpotlightCard({ 
  children, 
  variants,
  className = '', 
  innerClassName = 'bg-white text-on-surface', 
  glowColor = 'rgba(20, 184, 166, 0.15)', 
  borderColor = 'rgba(20, 184, 166, 0.4)',
  defaultBorderColor = 'rgba(228, 233, 232, 0.4)',
  ...props 
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      variants={variants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl p-[1.5px] transition-all duration-300 ${className}`}
      style={{
        background: isHovered 
          ? `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, ${borderColor}, transparent 80%)` 
          : defaultBorderColor,
        boxShadow: isHovered 
          ? `0 12px 36px ${glowColor.replace('0.15', '0.08')}` 
          : '0 4px 24px rgba(0,0,0,0.015)'
      }}
      {...props}
    >
      <div className={`relative w-full h-full rounded-[22px] p-7 overflow-hidden transition-colors duration-300 ${innerClassName}`}>
        {/* Repeating dot pattern that lights up under mouse */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: isHovered ? 0.08 : 0.03,
            WebkitMaskImage: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
            maskImage: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
            transition: 'opacity 0.3s ease'
          }}
        />
        {/* Soft radial background glow inside */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />
        {/* Inside Card content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function Modules() {
  const FADE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const STAGGER_CONTAINER_VARIANTS = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const STAGGER_ITEM_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="modules" className="py-20 relative overflow-hidden border-y border-slate-200/30">
      {/* Unified Background System */}
      <UnifiedBackground />
      
      {/* Subtle background haze/gradient matching top-left corner of reference image */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-linear-to-br from-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={FADE_UP_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#004E47] mb-5 tracking-tight">
            One System. Everything Included.
          </h2>
          <p className="text-[15px] md:text-[17px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            No patchwork of third-party apps. Pivodent gives your dental clinic every tool <br className="hidden md:inline" /> in a single, beautiful platform.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 grid-flow-row-dense gap-6"
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          
          {/* Card 1: AI Facebook Chatbot (Tall Card) */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-4 lg:row-span-2 h-full"
            innerClassName="bg-[#004E47] text-white"
            glowColor="rgba(255, 255, 255, 0.12)"
            borderColor="rgba(255, 255, 255, 0.35)"
            defaultBorderColor="rgba(255, 255, 255, 0.12)"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4M8 16h.01M16 16h.01" strokeWidth="2.5" />
                </svg>
              </div>
              <h3 className="text-[22px] font-extrabold mb-3 tracking-tight">
                AI Facebook Chatbot
              </h3>
              <p className="text-white/80 text-[13.5px] leading-relaxed mb-8">
                Books appointments via Messenger, 24/7 — even while you sleep. No staff needed.
              </p>
            </div>

            <div className="space-y-4">
              {/* Chat Simulator */}
              <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-xs">
                {/* Bot Message */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="#004E47" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <circle cx="12" cy="5" r="2" />
                      <path d="M12 7v4M8 16h.01M16 16h.01" />
                    </svg>
                  </div>
                  <div className="bg-[#003831] text-white rounded-2xl rounded-tl-none px-3.5 py-2 text-[11.5px] font-medium leading-relaxed max-w-[80%] shadow-xs">
                    Hi! I'm SmileBot 👋 Want to book an appointment?
                  </div>
                </div>
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#007065] border border-white/10 text-white rounded-2xl rounded-tr-none px-3.5 py-2 text-[11.5px] font-medium leading-relaxed max-w-[80%] shadow-xs">
                    Yes, I need a cleaning next Friday
                  </div>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#45C4B0] pt-1">
                <span className="w-2 h-2 rounded-full bg-[#45C4B0] animate-pulse" />
                BOOKING ACTIVE - +1,284 THIS MONTH
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Appointment Scheduling */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(59, 130, 246, 0.12)"
            borderColor="rgba(59, 130, 246, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Appointment Scheduling
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Full calendar with approval flow, dentist views, and walk-in support.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                <span 
                  key={day}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                    day === 'Wed' 
                      ? 'bg-[#004E47] text-white shadow-xs' 
                      : 'bg-[#F4F6F6] text-[#8C9A98]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 3: Live Queue Manager */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(244, 63, 94, 0.12)"
            borderColor="rgba(244, 63, 94, 0.35)"
          >
            <div className="absolute top-7 right-7 bg-[#45C4B0] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              + Live
            </div>
            
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Live Queue Manager
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Real-time waiting list with call-next & "In Chair" tracking.
              </p>
            </div>

            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center bg-[#F8FAFA] px-3.5 py-2.5 rounded-xl border border-slate-100/50">
                <div className="flex items-center">
                  <span className="text-[11px] font-extrabold text-[#8C9A98]">#1</span>
                  <span className="text-[11.5px] font-extrabold text-slate-700 ml-2">Maria Santos</span>
                </div>
                <span className="px-2 py-0.5 bg-[#EAFDF8] text-[#005743] border border-[#A7F3D0]/30 rounded-md text-[9px] font-black">In Chair</span>
              </div>
              <div className="flex justify-between items-center bg-[#F8FAFA] px-3.5 py-2.5 rounded-xl border border-slate-100/50">
                <div className="flex items-center">
                  <span className="text-[11px] font-extrabold text-[#8C9A98]">#2</span>
                  <span className="text-[11.5px] font-extrabold text-slate-700 ml-2">John Reyes</span>
                </div>
                <span className="px-2 py-0.5 bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA]/30 rounded-md text-[9px] font-black">Waiting</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Patient EHR Records */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(6, 182, 212, 0.12)"
            borderColor="rgba(6, 182, 212, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="10" cy="13" r="2" />
                  <path d="M14 17a3 3 0 0 0-6 0" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Patient EHR Records
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Complete electronic health records, linked to every appointment.
              </p>
            </div>

            <div className="flex items-center -space-x-2 py-1">
              {[
                { label: 'MS', bg: 'bg-[#45C4B0] text-white' },
                { label: 'AB', bg: 'bg-[#3B82F6] text-white' },
                { label: 'JC', bg: 'bg-[#EF4444] text-white' },
                { label: 'RD', bg: 'bg-[#F59E0B] text-white' },
                { label: '+12', bg: 'bg-[#F4F6F6] text-[#8C9A98] border border-slate-100' }
              ].map((av, idx) => (
                <div 
                  key={idx}
                  className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-xs ${av.bg}`}
                >
                  {av.label}
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 5: Clinical Notes & Diagnosis */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(245, 158, 11, 0.12)"
            borderColor="rgba(245, 158, 11, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Clinical Diagnosis
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Log patient findings, medical history, and procedure notes in seconds.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Prophylaxis', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { name: 'Restoration', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                { name: 'Checkup', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
              ].map((item) => (
                <div 
                  key={item.name}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${item.bg}`}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 6: Digital Prescriptions */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-4 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(139, 92, 246, 0.12)"
            borderColor="rgba(139, 92, 246, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Digital Prescriptions
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Print-ready Rx with doctor info, dosage & instructions.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 bg-[#F5F9F9] text-[11px] space-y-2.5 w-full">
              <div className="flex justify-between items-center text-[9px] font-extrabold text-[#8C9A98]">
                <span>Rx Prescription</span>
                <span>Dr. J. Cruz, DMD</span>
              </div>
              <div className="h-px bg-slate-200/50" />
              <div className="flex justify-between font-extrabold text-slate-800">
                <span>Amoxicillin 500mg</span>
                <span className="font-extrabold text-slate-800">Qty: 21</span>
              </div>
              <div className="text-slate-500 font-medium text-[10px]">
                1 capsule every 8 hours for 7 days.
              </div>
            </div>
          </SpotlightCard>

          {/* Card 7: Role-Based Staff Access */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(20, 184, 166, 0.12)"
            borderColor="rgba(20, 184, 166, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                Role-Based Staff Access
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Custom permissions and dedicated views for owners, dentists, and dental assistants.
              </p>
            </div>

            <div className="flex items-center gap-2 py-1 w-full">
              {[
                { label: 'Admin', bg: 'bg-[#004E47] text-white', status: 'Full Access' },
                { label: 'Dentist', bg: 'bg-[#007065] text-white', status: 'Clinical' },
                { label: 'Staff', bg: 'bg-[#EAFDF8] text-[#005743] border border-[#A7F3D0]/50', status: 'Reception' }
              ].map((role) => (
                <div key={role.label} className={`flex-1 flex flex-col items-center py-2 px-1.5 rounded-xl ${role.bg} shadow-xs text-center`}>
                  <span className="text-[11px] font-extrabold tracking-tight">{role.label}</span>
                  <span className="text-[8px] opacity-80 font-bold uppercase mt-0.5 tracking-wider">{role.status}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 8: No-Show & Policy Protection */}
          <SpotlightCard 
            variants={STAGGER_ITEM_VARIANTS}
            className="lg:col-span-3 h-full"
            innerClassName="bg-white text-on-surface"
            glowColor="rgba(245, 158, 11, 0.12)"
            borderColor="rgba(245, 158, 11, 0.35)"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#F4F6F6] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#004E47]">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#004E47] mb-2 tracking-tight">
                No-Show Protection
              </h3>
              <p className="text-slate-500 text-[12.5px] leading-relaxed mb-6">
                Auto-flag missed visits after grace periods and protect chair capacity with cutoff rules.
              </p>
            </div>

            <div className="border border-transparent rounded-2xl p-3.5 bg-[#FFF7ED] text-[11px] space-y-1.5 w-full text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#D97706] bg-white border border-amber-200/60 rounded-full px-2.5 py-0.5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                15-min Grace Exceeded
              </div>
              <p className="font-extrabold text-slate-800 text-[11.5px] mt-1">
                Chair #2 Released for Walk-in
              </p>
              <p className="text-slate-500 font-semibold text-[9.5px] leading-none mt-0.5">
                No-Show Logged Automatically
              </p>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}

