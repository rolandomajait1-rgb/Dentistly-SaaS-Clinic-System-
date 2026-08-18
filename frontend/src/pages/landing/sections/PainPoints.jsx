import { motion } from 'framer-motion';
import { Section, Container, Heading, FadeIn } from '../../../design-system';
import { PAIN_POINTS, FADE_UP_VARIANTS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function PainPoints({ onGetStarted, onLogin }) {
  return (
    <Section id="features" variant="warm" className="border-b border-slate-200/20 section-accent-line">
      {/* Unified Background System */}
      <UnifiedBackground />
      <Container>
        {/* Section heading */}
        <FadeIn>
          <div className="text-center mb-12">
            <Heading level={2} className="mb-3">
              Still Running Your Clinic
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-error to-rose-400"> the Old Way?</span>
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 text-[15px] max-w-xl mx-auto leading-relaxed">Every missed call and forgotten reminder is lost revenue. Here's what clinics face daily without Pivodent.</p>
          </div>
        </FadeIn>
        <motion.div className="max-w-3xl mx-auto space-y-5" variants={STAGGER_CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          {PAIN_POINTS.map((item, i) => (
            <motion.div key={i} variants={STAGGER_ITEM_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Without Pivodent */}
              <motion.div 
                whileHover={{ scale: 1.02, x: -2 }} 
                className="flex items-center gap-5 pain-card-without group"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-error/25 to-rose-600/15 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Outer badge card */}
                  <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-rose-100 to-rose-50 dark:from-error/30 dark:to-rose-600/15 border border-rose-200 dark:border-error/40 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                    {/* Inner glass orb */}
                    <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/25 flex items-center justify-center border border-rose-100/50 dark:border-white/10 shadow-inner">
                      <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-2xl font-medium" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>{item.before.icon}</span>
                    </div>
                  </div>
                  {/* Small round close badge to anchor and help colorblind users */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm select-none">
                    <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">Without Pivodent</p>
                  <p className="text-[14px] text-slate-800 dark:text-white/75 leading-snug font-medium">{item.before.text}</p>
                </div>
              </motion.div>

              {/* With Pivodent */}
              <motion.div 
                whileHover={{ scale: 1.02, x: 2 }} 
                className="flex items-center gap-5 pain-card-with group"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/30 to-teal-500/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Outer badge card */}
                  <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-teal-100 to-emerald-50 dark:from-primary/45 dark:to-teal-500/25 border border-teal-200 dark:border-primary/45 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[4deg]">
                    {/* Inner glass orb */}
                    <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/25 flex items-center justify-center border border-teal-100/50 dark:border-white/10 shadow-inner">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-300 text-2xl font-medium" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>{item.after.icon}</span>
                    </div>
                  </div>
                  {/* Small round check badge to anchor and help colorblind users */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm select-none">
                    <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">With Pivodent</p>
                  <p className="text-[14px] text-slate-800 dark:text-white/80 leading-snug font-medium">{item.after.text}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="text-center mt-16" variants={FADE_UP_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.button onClick={onGetStarted || onLogin} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="bg-linear-to-r from-teal-500 to-emerald-600 text-white font-data-tabular text-[14px] font-bold uppercase tracking-wide px-10 py-4 rounded-full shadow-[0_12px_28px_rgba(20,184,166,0.35)] hover:shadow-[0_16px_36px_rgba(20,184,166,0.5)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-3 group cursor-pointer">
            Fix This Today — Start Free
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </motion.button>
          <p className="text-slate-500 text-[12.5px] mt-6 font-medium">No credit card • 14-day free trial • Cancel anytime</p>
        </motion.div>
      </Container>
    </Section>
  );
}
