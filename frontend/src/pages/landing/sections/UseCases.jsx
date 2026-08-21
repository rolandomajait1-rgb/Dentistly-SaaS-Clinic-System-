import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Container, Badge, Heading, FadeIn } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';
import assets from '../../../assets';

const ROW_1_SCREENS = [
  { image: assets.dentalScheduleUi, alt: 'pivodent.ph/scheduler', title: 'Clinical Scheduler Desk' },
  { image: assets.dentalPatientsUi, alt: 'pivodent.ph/records', title: 'Electronic EHR Records' },
  { image: assets.dentalOfficeMockup, alt: 'pivodent.ph/analytics', title: 'Executive Analytics Panel' },
  { image: assets.dentalPatientsUi, alt: 'pivodent.ph/prescriptions', title: 'Digital Prescription Desk' },
];

const ROW_2_SCREENS = [
  { image: assets.illustrationChatbot, alt: 'pivodent.ph/chatbot', title: 'SmileBot AI Messenger' },
  { image: assets.illustrationScheduling, alt: 'pivodent.ph/scheduler', title: 'Drag-and-Drop Clinic Calendar' },
  { image: assets.illustrationPatients, alt: 'pivodent.ph/patients', title: 'Patient Profile Intake' },
  { image: assets.dentalOfficeMockup, alt: 'pivodent.ph/calendar', title: 'Multi-Dentist Clinic Overview' },
];

export default function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const tierKeys = ['solo', 'group'];

  const tiers = {
    solo: {
      type: 'Solo Practitioner',
      icon: 'person',
      color: 'text-cyan-600 border-cyan-500/20 bg-cyan-500/5',
      glow: 'rgba(6, 182, 212, 0.12)',
      description: 'Manage scheduling, patients, and frontdesk logs all on your own without administrative overwhelm.',
      features: ['24/7 AI booking assistant', 'Automated check-in reminders', 'Walk-in queue manager'],
      accentColor: '#0891b2',
      url: 'pivodent.ph/smilebot-ai',
      title: 'SmileBot AI Messenger',
      mockup: (
        <div className="space-y-3 font-sans text-xs flex-1 flex flex-col justify-end">
          <div className="bg-slate-800 text-slate-200 rounded-2xl px-4 py-2.5 self-start max-w-[85%] border border-slate-700/50 shadow-xs">
            Pede po mag-book bukas 3pm?
          </div>
          <div className="bg-cyan-600 text-white rounded-2xl px-4 py-2.5 self-end ml-auto max-w-[85%] text-right font-medium shadow-xs">
            Opo! Available po si Dr. Santos bukas ng 3:00 PM for Oral Prophylaxis. I-book po natin?
          </div>
          <div className="bg-slate-800 text-slate-200 rounded-2xl px-4 py-2.5 self-start max-w-[85%] border border-slate-700/50 shadow-xs">
            Opo, salamat!
          </div>
          <div className="bg-cyan-600 text-white rounded-2xl px-4 py-2.5 self-end ml-auto max-w-[85%] text-right font-medium shadow-xs">
            Confirm! Added to queue. Naka-book na po kayo. See you tomorrow at 3:00 PM! 📅
          </div>
        </div>
      )
    },
    group: {
      type: 'Multi-Dentist Group Clinic',
      icon: 'groups',
      color: 'text-purple-600 border-purple-500/20 bg-purple-500/5',
      glow: 'rgba(139, 92, 246, 0.12)',
      description: 'Coordinate multiple doctor agendas, treatment chairs, and billing files under one clinical database.',
      features: ['Shared patient EHR records', 'Multi-calendar timeline per dentist', 'Staff & associate role permissions'],
      accentColor: '#7c3aed',
      url: 'pivodent.ph/scheduler',
      title: 'Clinician Calendar Timeline',
      mockup: (
        <div className="space-y-4 font-sans text-xs flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
              <p className="font-bold text-slate-350 border-b border-slate-700/60 pb-2 mb-3 text-[10px] uppercase tracking-wider">Dr. Santos (Restorative)</p>
              <div className="bg-purple-950/60 border border-purple-800/40 p-2.5 rounded-xl mb-2.5">
                <p className="font-bold text-purple-300 leading-tight">Juan Dela Cruz</p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">9:00 AM • Dental Filling</p>
              </div>
              <div className="bg-slate-700/40 p-2.5 rounded-xl">
                <p className="font-bold text-slate-450 leading-tight">Available</p>
                <p className="text-[9.5px] text-slate-550 mt-0.5">10:30 AM Slot</p>
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
              <p className="font-bold text-slate-350 border-b border-slate-700/60 pb-2 mb-3 text-[10px] uppercase tracking-wider">Dr. Lopez (Ortho)</p>
              <div className="bg-slate-700/40 p-2.5 rounded-xl mb-2.5">
                <p className="font-bold text-slate-450 leading-tight">Blockout</p>
                <p className="text-[9.5px] text-slate-550 mt-0.5">9:00 AM • Staff Meeting</p>
              </div>
              <div className="bg-purple-950/60 border border-purple-800/40 p-2.5 rounded-xl">
                <p className="font-bold text-purple-300 leading-tight">Maria Santos</p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">10:00 AM • Braces Adjust</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const getCardStyle = (index, hovered) => {
    // Relative position in stack: 0 (front), 1 (back)
    const position = (index - activeIndex + 2) % 2;
    
    const zIndex = 20 - position * 10;
    const scale = 1 - position * 0.05;
    
    // Spread cards further down when fanned on hover
    const fanMultiplier = hovered ? 2.2 : 1.0;
    const translateY = position * 20 * fanMultiplier;
    
    // Slight rotational slant for stacked realism
    const rotate = position === 0 ? 0 : -2.5;
    const opacity = 1 - position * 0.25;
    
    return {
      zIndex,
      scale,
      y: translateY,
      rotate,
      opacity,
    };
  };

  const handleCardClick = (index) => {
    const position = (index - activeIndex + 2) % 2;
    if (position === 0) {
      setActiveIndex((prev) => (prev + 1) % 2);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <Section id="use-cases" variant="warm" className="py-20 md:py-28 border-y border-outline-variant/25 section-accent-line relative overflow-hidden">
      {/* Unified Background System */}
      <UnifiedBackground />

      <Container>
        <FadeIn className="text-center mb-16">
          <Badge variant="secondary" className="mb-6">
            💼 Built for Every Clinic Type
          </Badge>
          <Heading level={2} className="mb-4 text-slate-900 leading-tight">
            Solo Practice or Group Clinic?<br />We've Got You Covered.
          </Heading>
          <p className="font-body-lg text-[15.5px] text-slate-650 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you are a solo practitioner managing appointments on your own or a busy clinic with multiple associate dentists, Pivodent scales effortlessly.
          </p>
        </FadeIn>

        {/* Double Row Looping Gallery - Seamless Marquees */}
        <div className="relative w-full overflow-hidden py-12 mb-20 pointer-events-auto flex flex-col gap-10">
          {/* Soft fade gradients on borders */}
          <div className="absolute inset-y-0 left-0 w-40 bg-linear-to-r from-[#effcf8] via-[#effcf8]/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-linear-to-l from-white via-white/50 to-transparent z-10 pointer-events-none" />

          {/* Row 1 (Scroll Left-to-Right / Forward Marquee) */}
          <div className="flex gap-8 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
            {/* Copy 1 */}
            <div className="flex gap-8 shrink-0">
              {ROW_1_SCREENS.map((screen, idx) => (
                <div 
                  key={`r1-c1-${idx}`} 
                  className="w-[580px] h-[360px] p-[1.5px] rounded-[28px] bg-linear-to-br from-slate-200/80 to-slate-350 hover:from-teal-400 hover:to-cyan-400 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(13,148,136,0.18)] shrink-0 transform hover:-translate-y-3 hover:scale-104 hover:rotate-1 transition-all duration-500 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-full bg-white rounded-[27px] overflow-hidden flex flex-col justify-between">
                    {/* macOS Browser Header Dot Menu */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-b from-slate-50 to-slate-100 border-b border-slate-200/60 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-inner" />
                      </div>
                      <div className="bg-slate-200/60 text-slate-550 text-[10px] font-bold px-6 py-0.5 rounded-full border border-slate-300/30 max-w-[240px] truncate tracking-wide flex items-center gap-1.5 font-sans">
                        <span className="material-symbols-outlined text-[10px] text-slate-400">lock</span>
                        {screen.alt}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {screen.title}
                      </div>
                    </div>
                    {/* Screen Image Body */}
                    <div className="flex-1 w-full overflow-hidden bg-slate-50 relative">
                      <img 
                        src={screen.image} 
                        alt={screen.title} 
                        className="w-full h-full object-cover object-top select-none group-hover:scale-103 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-900/[0.02] group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Copy 2 for seamless loop */}
            <div className="flex gap-8 shrink-0" aria-hidden="true">
              {ROW_1_SCREENS.map((screen, idx) => (
                <div 
                  key={`r1-c2-${idx}`} 
                  className="w-[580px] h-[360px] p-[1.5px] rounded-[28px] bg-linear-to-br from-slate-200/80 to-slate-350 hover:from-teal-400 hover:to-cyan-400 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(13,148,136,0.18)] shrink-0 transform hover:-translate-y-3 hover:scale-104 hover:rotate-1 transition-all duration-500 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-full bg-white rounded-[27px] overflow-hidden flex flex-col justify-between">
                    {/* macOS Browser Header Dot Menu */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-b from-slate-50 to-slate-100 border-b border-slate-200/60 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-inner" />
                      </div>
                      <div className="bg-slate-200/60 text-slate-550 text-[10px] font-bold px-6 py-0.5 rounded-full border border-slate-300/30 max-w-[240px] truncate tracking-wide flex items-center gap-1.5 font-sans">
                        <span className="material-symbols-outlined text-[10px] text-slate-400">lock</span>
                        {screen.alt}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {screen.title}
                      </div>
                    </div>
                    {/* Screen Image Body */}
                    <div className="flex-1 w-full overflow-hidden bg-slate-50 relative">
                      <img 
                        src={screen.image} 
                        alt={screen.title} 
                        className="w-full h-full object-cover object-top select-none group-hover:scale-103 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-900/[0.02] group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 (Scroll Right-to-Left / Reverse Marquee) */}
          <div className="flex gap-8 animate-marquee-reverse hover:[animation-play-state:paused] whitespace-nowrap">
            {/* Copy 1 */}
            <div className="flex gap-8 shrink-0">
              {ROW_2_SCREENS.map((screen, idx) => (
                <div 
                  key={`r2-c1-${idx}`} 
                  className="w-[580px] h-[360px] p-[1.5px] rounded-[28px] bg-linear-to-br from-slate-200/80 to-slate-350 hover:from-cyan-400 hover:to-purple-400 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(124,58,237,0.18)] shrink-0 transform hover:-translate-y-3 hover:scale-104 hover:-rotate-1 transition-all duration-500 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-full bg-white rounded-[27px] overflow-hidden flex flex-col justify-between">
                    {/* macOS Browser Header Dot Menu */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-b from-slate-50 to-slate-100 border-b border-slate-200/60 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-inner" />
                      </div>
                      <div className="bg-slate-200/60 text-slate-550 text-[10px] font-bold px-6 py-0.5 rounded-full border border-slate-300/30 max-w-[240px] truncate tracking-wide flex items-center gap-1.5 font-sans">
                        <span className="material-symbols-outlined text-[10px] text-slate-400">lock</span>
                        {screen.alt}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {screen.title}
                      </div>
                    </div>
                    {/* Screen Image Body */}
                    <div className="flex-1 w-full overflow-hidden bg-slate-50 relative">
                      <img 
                        src={screen.image} 
                        alt={screen.title} 
                        className="w-full h-full object-cover object-top select-none group-hover:scale-103 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-900/[0.02] group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Copy 2 for seamless loop */}
            <div className="flex gap-8 shrink-0" aria-hidden="true">
              {ROW_2_SCREENS.map((screen, idx) => (
                <div 
                  key={`r2-c2-${idx}`} 
                  className="w-[580px] h-[360px] p-[1.5px] rounded-[28px] bg-linear-to-br from-slate-200/80 to-slate-350 hover:from-cyan-400 hover:to-purple-400 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(124,58,237,0.18)] shrink-0 transform hover:-translate-y-3 hover:scale-104 hover:-rotate-1 transition-all duration-500 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-full bg-white rounded-[27px] overflow-hidden flex flex-col justify-between">
                    {/* macOS Browser Header Dot Menu */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-b from-slate-50 to-slate-100 border-b border-slate-200/60 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-inner" />
                        <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-inner" />
                      </div>
                      <div className="bg-slate-200/60 text-slate-550 text-[10px] font-bold px-6 py-0.5 rounded-full border border-slate-300/30 max-w-[240px] truncate tracking-wide flex items-center gap-1.5 font-sans">
                        <span className="material-symbols-outlined text-[10px] text-slate-400">lock</span>
                        {screen.alt}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {screen.title}
                      </div>
                    </div>
                    {/* Screen Image Body */}
                    <div className="flex-1 w-full overflow-hidden bg-slate-50 relative">
                      <img 
                        src={screen.image} 
                        alt={screen.title} 
                        className="w-full h-full object-cover object-top select-none group-hover:scale-103 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-900/[0.02] group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Tab-driven visualizer split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-[1100px] mx-auto">
          {/* Left Column: Clinic Size Selectors */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[12.5px] uppercase font-bold tracking-widest text-[#004e47] mb-2">Practice Profile Selector</p>
            {tierKeys.map((key, index) => {
              const data = tiers[key];
              const isActive = activeIndex === index;
              return (
                <button
                  key={key}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full p-[1px] rounded-[22px] transition-all duration-300 relative select-none cursor-pointer ${
                    isActive 
                      ? 'bg-linear-to-br from-slate-350 to-slate-450 shadow-md ring-2 ring-slate-200/50' 
                      : 'bg-transparent border-none shadow-none'
                  }`}
                >
                  <div className={`w-full h-full flex items-start gap-4 p-5 rounded-[21px] text-left transition-colors duration-300 ${
                    isActive ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                  }`}>
                    {/* Icon Indicator */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isActive ? data.color : 'bg-slate-50 text-slate-500 border-slate-200'
                    } shrink-0`}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {data.icon}
                      </span>
                    </div>

                    {/* Text details */}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-[16px] font-black text-slate-800 tracking-tight leading-none font-display">{data.type}</h4>
                      <p className="text-[12.5px] text-slate-650 leading-relaxed font-medium">{data.description}</p>
                      
                      {/* Accordion checklist details */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden pt-3 flex flex-col gap-2 border-t border-slate-100 mt-2"
                          >
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Key Capabilities:</span>
                            <div className="flex flex-col gap-2">
                              {data.features.map(feat => (
                                <div key={feat} className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                                  <span className="material-symbols-outlined text-[14px] text-teal-600 font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                  {feat}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Active highlight side line */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[21px]" 
                        style={{ backgroundColor: data.accentColor }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Dynamic Visual 3D Stack Canvas */}
          <div className="lg:col-span-7 select-none">
            <div 
              className="relative w-full max-w-[460px] h-[340px] mx-auto cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {tierKeys.map((key, index) => {
                const data = tiers[key];
                const cardStyle = getCardStyle(index, isHovered);
                const isActive = index === activeIndex;

                return (
                  <motion.div
                    key={key}
                    style={{
                      transformOrigin: 'top center',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    animate={cardStyle}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(index);
                    }}
                    className={`p-[1.5px] rounded-[24px] bg-linear-to-br transition-all duration-300 ${
                      isActive 
                        ? 'from-slate-350 to-slate-450 shadow-2xl' 
                        : 'from-slate-200/80 to-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="w-full h-full bg-[#111827] text-white rounded-[22.5px] p-5 flex flex-col justify-between flex-1 relative overflow-hidden">
                      
                      {/* Top Part: Dynamic decorative backdrop glow */}
                      <div 
                        className="absolute inset-0 -z-10 blur-3xl opacity-20 transition-all duration-500 pointer-events-none" 
                        style={{
                          background: `radial-gradient(circle at center, ${data.glow} 0%, transparent 70%)`
                        }}
                      />

                      {/* macOS Browser Header Dot Menu */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4 shrink-0 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner" />
                          <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-inner" />
                          <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-inner" />
                        </div>
                        <div className="bg-slate-800/60 text-slate-400 text-[9.5px] font-bold px-4 py-0.5 rounded-full border border-slate-700/20 max-w-[200px] truncate tracking-wide flex items-center gap-1.5 font-sans">
                          <span className="material-symbols-outlined text-[9.5px] text-slate-550">lock</span>
                          {data.url}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {data.title}
                        </div>
                      </div>

                      {/* Mockup Container */}
                      <div className="flex-grow flex flex-col pointer-events-auto">
                        {data.mockup}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
