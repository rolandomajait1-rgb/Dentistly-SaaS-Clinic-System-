import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS, HERO_SLIDES } from '../constants.jsx';
import assets from '../../../assets';

export default function Hero({ onLogin, onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4550);
    return () => clearInterval(timer);
  }, []);

  // 3D Perspective Mouse Move Tilt
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;
    const rect = container.getBoundingClientRect();
    
    // Normalize coordinates from -1 to 1
    const xVal = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const yVal = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    
    // Dynamic 3D tilt calculations
    const rx = 1 - (yVal * 3);
    const ry = -8 + (xVal * 8);
    
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.6s ease';
    card.style.transform = 'perspective(1000px) rotateX(1deg) rotateY(-8deg) rotateZ(1deg)';
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.1s ease';
  };

  return (
    <section className="min-h-screen pt-32 md:pt-[130px] pb-20 md:pb-24 relative overflow-hidden flex items-center">
      {/* Layer 1: Base gradient */}
      <div className="absolute inset-0 -z-30 bg-linear-to-br from-[#e8f5f1] via-[#f0f7ff] to-[#eef0ff] dark:from-[#071210] dark:via-[#060c1a] dark:to-[#080b1a]" />
      
      {/* Layer 2: Hero section photo overlay */}
      <div
        className="absolute inset-0 -z-20 pointer-events-none bg-cover bg-center opacity-35 mix-blend-luminosity"
        style={{ backgroundImage: `url(${assets.bgHeroSection})` }}
      />

      {/* Layer 3: Mesh dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-[0.18] dark:opacity-[0.30] pointer-events-none" />

      {/* Layer 4: Ambient glow orbs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full pointer-events-none -z-10 bg-radial from-primary/18 via-teal-500/10 to-transparent"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none -z-10 bg-radial from-indigo-500/12 via-purple-500/6 to-transparent"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none -z-10 bg-radial from-teal-500/8 to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Layer 5: Corner accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent -z-10 rounded-bl-[180px]" />

      <div className="max-w-[1280px] mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Copy Column */}
          <motion.div 
            className="lg:col-span-5"
            initial="hidden"
            animate="visible"
            variants={STAGGER_CONTAINER_VARIANTS}
          >

            <motion.h1 variants={STAGGER_ITEM_VARIANTS} className="text-[40px] sm:text-[48px] md:text-[58px] lg:text-[64px] font-black text-primary mb-4 leading-[1.08] tracking-tight max-w-[580px]">
              Stop Losing Patients to <span className="font-serif italic font-normal text-primary">Phone Calls</span> &amp; <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-teal-600 to-emerald-500">Manual Booking.</span>
            </motion.h1>

            <motion.p variants={STAGGER_ITEM_VARIANTS} className="text-[17px] text-on-surface-variant/90 mb-6 max-w-[480px] leading-relaxed font-medium">
              Pivodent automates your clinic from end to end — chatbot booking, EHR, Email reminders. <strong className="text-primary font-bold">Most clinics go live in under 30 minutes.</strong>
            </motion.p>
            
            {/* Social proof avatars */}
            <motion.div variants={STAGGER_ITEM_VARIANTS} className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 w-fit mb-6 shadow-sm">
              <div className="flex -space-x-2 shrink-0">
                {[
                  { initials: 'AR', bgClass: 'bg-teal-500' },
                  { initials: 'MV', bgClass: 'bg-indigo-500' },
                  { initials: 'CS', bgClass: 'bg-rose-500' },
                  { initials: 'LM', bgClass: 'bg-amber-500' },
                ].map((a, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-white font-bold text-[9px] ${a.bgClass}`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start leading-none gap-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-amber-400 text-[11px]">★</span>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold">
                  Join Pivodent <span className="text-primary font-black"></span> across PH
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={STAGGER_ITEM_VARIANTS} className="flex flex-col sm:flex-row gap-4 mb-6">
              <motion.button 
                onClick={onGetStarted || onLogin}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-on-primary font-extrabold text-[12px] tracking-wider uppercase px-8 py-4 rounded-full hover:bg-primary-container transition-all hover:shadow-[0_12px_24px_rgba(0,78,71,0.22)] flex items-center justify-center gap-3 group cursor-pointer"
              >
                Start Free — No Credit Card
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </motion.button>
              <motion.button 
                onClick={onLogin} 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="text-on-surface-variant font-extrabold text-[12px] tracking-wider uppercase px-8 py-4 rounded-full border border-outline-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-surface-container-lowest shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <svg className="w-2 h-2 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Watch 2-Min Demo
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className="lg:col-span-7 relative flex flex-col items-center justify-center py-8 lg:-mt-10 perspective-1000 cursor-pointer pointer-events-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background glowing ambient light under the mockup */}
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/10 via-teal-500/5 to-primary-fixed-dim/10 rounded-[40px] blur-3xl opacity-75 pointer-events-none -z-10" />

            {/* Faux contact shadow to anchor the 3D tilted card */}
            <div className="absolute bottom-2 left-[5%] right-[12%] h-12 bg-[#001f1b]/22 dark:bg-black/40 blur-2xl rounded-full scale-y-[0.25] pointer-events-none z-0 transform -rotate-2" />

            {/* macOS Browser Mockup with 3D Tilt */}
            <div 
              ref={cardRef}
              className="w-full max-w-[680px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col relative z-10 transition-all duration-300 transform-gpu"
              style={{ 
                transform: 'perspective(1000px) rotateX(1deg) rotateY(-8deg) rotateZ(1deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              
              {/* Browser Header Bar */}
              <div className="grid grid-cols-12 items-center px-5 py-3 bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 select-none shrink-0">
                {/* 3 dots */}
                <div className="col-span-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-400/90 shadow-inner" />
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-400/90 shadow-inner" />
                  <span className="w-3.5 h-3.5 rounded-full bg-green-400/90 shadow-inner" />
                </div>
                {/* Address bar mockup */}
                <div className="col-span-6 flex justify-center">
                  <div className="bg-slate-200/60 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-6 py-1 rounded-full border border-slate-300/20 max-w-[240px] w-full truncate tracking-wide flex items-center justify-center gap-2 font-sans shadow-inner">
                    <span className="material-symbols-outlined text-[11px] text-slate-400">lock</span>
                    pivodent.ph/dashboard
                  </div>
                </div>
                {/* Action labels */}
                <div className="col-span-3 text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline-block truncate max-w-full">
                    {HERO_SLIDES[currentSlide]?.label}
                  </span>
                </div>
              </div>

              {/* Browser Content */}
              <div className="relative w-full aspect-video bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.98, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -10 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img 
                      src={HERO_SLIDES[currentSlide].src} 
                      alt={HERO_SLIDES[currentSlide].label}
                      className="w-full h-full object-cover object-top"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Browser Bottom Indicator Controls */}
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-widest">
                  Slide {currentSlide + 1} of {HERO_SLIDES.length}
                </span>

                <div className="flex gap-2.5">
                  {HERO_SLIDES.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className="relative p-1 focus:outline-none cursor-pointer"
                        aria-label={`Go to slide ${idx + 1}`}
                      >
                        <div className={`h-2.5 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'w-7 bg-primary' 
                            : 'w-2.5 bg-slate-350 dark:bg-slate-700 hover:bg-slate-450 dark:hover:bg-slate-600'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

