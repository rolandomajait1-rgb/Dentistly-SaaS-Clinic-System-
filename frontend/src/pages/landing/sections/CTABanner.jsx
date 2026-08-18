import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Container, FadeIn } from '../../../design-system';
import assets from '../../../assets/index.js';

const WORDS = ['Spreadsheets', 'Paper Logs', 'Missed Calls', 'Manual Chaos'];

export default function CTABanner({ onGetStarted, onLogin }) {
  const [wordIndex, setWordIndex] = useState(0);

  /* Auto-rotate words in the heading */
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section id="cta-banner" variant="transparent" className="py-24 relative overflow-hidden">
      {/* Clinic Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${assets.bgCtaClinic})` }}
      />
      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-linear-to-b from-white/85 via-white/80 to-white/90" />
      {/* Top & Bottom soft fades */}
      <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent pointer-events-none" />

      <Container className="max-w-[1000px] relative z-10">
        {/* Fluid Typographic Content (No Card Wrapper) */}
        <FadeIn className="text-center">
          {/* Framer Animated Heading */}
          <h2 className="text-[38px] md:text-[68px] font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Your Clinic Deserves
            <br />
            <span className="inline-flex flex-col relative h-[1.25em] overflow-hidden min-w-[220px] sm:min-w-[340px] md:min-w-[480px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 45, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -45, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 bottom-0.5 text-transparent bg-clip-text bg-linear-to-r from-primary via-teal-600 to-primary-container dark:from-primary-fixed-dim dark:via-teal-400 dark:to-primary-fixed font-black pb-1.5"
                >
                  Better Than {WORDS[wordIndex]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium">
            Join <strong className="text-primary dark:text-primary-light">500+ clinics</strong> across the Philippines already running on Pivodent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {/* Primary CTA (Magnetic Shimmer) */}
            <button 
              onClick={onGetStarted || onLogin} 
              className="w-full sm:w-auto bg-linear-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-white font-bold text-[14px] uppercase tracking-wider px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer relative overflow-hidden"
            >
              {/* The Shine Swipe effect */}
              <div className="absolute inset-0 w-[50%] h-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span>Start Free Trial — 14 Days</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Secondary CTA */}
            <button 
              onClick={onLogin} 
              className="w-full sm:w-auto text-slate-800 dark:text-white font-bold text-[14px] uppercase tracking-wider px-10 py-4 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-350 dark:hover:border-slate-700 active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group shadow-sm"
            >
              <svg className="w-5 h-5 text-slate-500 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book a Live Demo</span>
            </button>
          </div>

          {/* Risk reversal checklist row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[12px] font-bold">
            {['No credit card required', 'Cancel anytime', 'Setup in 30 min', 'PH-based support'].map(t => (
              <div key={t} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-300 transition-colors duration-200 cursor-default">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}

