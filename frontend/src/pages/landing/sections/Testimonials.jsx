import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS, FADE_UP_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [progress, setProgress] = useState(0);

  /* Auto-rotate testimonials with a self-cleaning progress timer */
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setActiveTestimonial((current) => (current + 1) % TESTIMONIALS.length);
          return 0;
        }
        return p + 1;
      });
    }, 45); // 4.5 seconds total duration per testimonial

    return () => clearInterval(timer);
  }, [activeTestimonial]);

  const handleSelect = (idx) => {
    setActiveTestimonial(idx);
    setProgress(0);
  };

  const active = TESTIMONIALS[activeTestimonial];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Unified Background System */}
      <UnifiedBackground />
      
      <div className="max-w-[1280px] mx-auto px-4 relative z-10">

        {/* Section Header */}
        <motion.div 
          className="text-center mb-16" 
          variants={FADE_UP_VARIANTS} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary-light font-bold uppercase tracking-widest text-[11px] mb-6">
            ★ Real Stories from Real Clinics
          </span>
          <h2 className="text-[36px] md:text-[56px] font-black text-primary mb-4 leading-tight">
            Clinic Owners Love Pivodent
          </h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant max-w-xl mx-auto">
            Don't take our word for it – hear from dentists who transformed their practice.
          </p>
        </motion.div>

        {/* Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* Column 1: Doctor Portrait Spotlight */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-4/5 w-full max-w-[340px] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTestimonial}
                  src={active.image}
                  alt={active.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
              
              {/* Floating Glassmorphism Footer Badge on Portrait */}
              <div className="absolute bottom-5 left-5 right-5 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-white/20 dark:border-slate-800/40 flex items-center justify-between shadow-lg">
                <div className="min-w-0">
                  <p className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-1.5">
                    {active.name}
                    <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {active.role.includes('·') ? active.role.split('·')[1].trim() : active.role}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary dark:text-primary-light px-2 py-0.5 rounded-md text-[10px] font-black shrink-0">
                  {active.stat.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Quote Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between min-h-[340px] pl-0 lg:pl-6">
            <div className="relative">
              {/* Quote Mark */}
              <span className="absolute -top-14 -left-8 text-[120px] font-serif text-primary/8 select-none pointer-events-none leading-none">
                “
              </span>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-6"
                >
                  <blockquote className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic pr-4">
                    "{active.quote}"
                  </blockquote>
                  
                  {/* Giant Success Metric display */}
                  <div className="flex items-baseline gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-linear-to-r from-primary via-emerald-500 to-teal-600 tracking-tight">
                      {active.stat.split(' ')[0]}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest text-primary uppercase leading-none mb-1">
                        Verified Impact
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {active.stat.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail Selector Row */}
            <div className="flex items-center gap-6 mt-12 pt-4">
              <div className="flex items-center gap-3">
                {TESTIMONIALS.map((t, idx) => {
                  const isActive = idx === activeTestimonial;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className="relative w-16 h-16 shrink-0 cursor-pointer focus:outline-none group"
                    >
                      {/* SVG Progress Ring */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          className="stroke-slate-200/60 dark:stroke-slate-800/40"
                          strokeWidth="2"
                          fill="transparent"
                        />
                        {isActive && (
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-primary"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray="176"
                            animate={{ strokeDashoffset: 176 - (176 * progress) / 100 }}
                            transition={{ duration: 0.065, ease: 'linear' }}
                          />
                        )}
                      </svg>

                      {/* Thumbnail Image */}
                      <div className={`absolute inset-[4px] rounded-full overflow-hidden border transition-all duration-300 ${
                        isActive 
                          ? 'border-primary scale-110 shadow-md z-10' 
                          : 'border-transparent opacity-40 group-hover:opacity-80 scale-100'
                      }`}>
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Currently Viewing Details */}
              <div className="flex flex-col justify-center min-h-[48px] border-l border-slate-200/60 dark:border-slate-800/60 pl-6">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                  Currently Viewing
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {active.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {active.role.split('·')[0].trim()}
                </span>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}



