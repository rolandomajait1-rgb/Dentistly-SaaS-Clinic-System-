import { motion } from 'framer-motion';
import { Section, Container } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function SocialProof() {
  return (
    <Section id="social-proof" variant="muted" className="py-10 border-b border-outline-variant/20">
      {/* Unified Background System */}
      <UnifiedBackground />

      <Container>
        <motion.div 
          className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Hero Metric: Trusted By 500+ clinics */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left max-w-md shrink-0">
            {/* Icon Circle */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-outline uppercase tracking-widest mb-1">Philippines #1 SaaS</p>
              <div className="flex items-baseline justify-center sm:justify-start gap-2 leading-none">
                <span className="text-5xl md:text-6xl font-black text-primary tracking-tight">500+</span>
                <span className="text-xl font-bold text-on-surface-variant">Active Clinics</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-16 bg-outline-variant/35 shrink-0" />

          {/* Right Metrics Grid: The 3 stats in a single row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 flex-1 w-full">
            {/* Stat 1: 98% Satisfaction */}
            <div className="flex gap-4 items-center text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tight mb-1">98%</h3>
                <p className="text-[10px] font-black text-outline uppercase tracking-wider leading-none">Satisfaction</p>
              </div>
            </div>

            {/* Stat 2: 500K+ Appointments */}
            <div className="flex gap-4 items-center text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tight mb-1">500K+</h3>
                <p className="text-[10px] font-black text-outline uppercase tracking-wider leading-none">Appointments</p>
              </div>
            </div>

            {/* Stat 3: 24/7 AI Support */}
            <div className="flex gap-4 items-center text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tight mb-1">24/7</h3>
                <p className="text-[10px] font-black text-outline uppercase tracking-wider leading-none">AI Support</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
