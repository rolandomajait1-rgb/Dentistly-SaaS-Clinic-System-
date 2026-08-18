import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRICING_PLANS, FADE_UP_VARIANTS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function Pricing({ onGetStarted, onLogin }) {
  /* Interactive ROI Calculator States */
  const [appointments, setAppointments] = useState(150);
  const [avgPrice, setAvgPrice] = useState(2000);
  const [reductionRate, setReductionRate] = useState(15);

  return (
    <section id="pricing" className="py-16 md:py-20 border-y border-outline-variant/20 relative">
      {/* Unified Background System */}
      <UnifiedBackground />
      <div className="max-w-[1280px] mx-auto px-4">
        <motion.div className="text-center mb-16" variants={FADE_UP_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <h2 className="text-[32px] md:text-[64px] font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-primary via-teal-600 to-primary-container dark:from-primary-fixed-dim dark:via-teal-400 dark:to-primary-fixed">Simple, Transparent Pricing</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant max-w-xl mx-auto">No hidden fees. No per-dentist charges. Choose the plan that fits your clinic – upgrade or cancel anytime.</p>
        </motion.div>

        {/* Interactive ROI Calculator */}
        <motion.div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 mb-16 shadow-[0_20px_50px_rgba(0,78,71,0.04)] max-w-4xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: '-60px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <h3 className="font-bold text-[18px] text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">calculate</span>
                  Estimate Your Return on Investment (ROI)
                </h3>
                <p className="text-on-surface-variant text-[13px] leading-relaxed">
                  Adjust the sliders below to see how much revenue and time Pivodent can recover for your practice by automating reminders and 24/7 chatbot scheduling.
                </p>
                
                {/* Slider 1 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                    <span>Monthly Appointments</span>
                    <span className="text-primary font-data-tabular">{appointments}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    step="10" 
                    value={appointments} 
                    onChange={(e) => setAppointments(Number(e.target.value))} 
                    className="roi-slider w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Monthly Appointments"
                  />
                </div>

                {/* Slider 2 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                    <span>Avg. Service Price</span>
                    <span className="text-primary font-data-tabular">₱{avgPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="100" 
                    value={avgPrice} 
                    onChange={(e) => setAvgPrice(Number(e.target.value))} 
                    className="roi-slider w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Average Service Price"
                  />
                </div>

                {/* Slider 3 */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                    <span>No-Show / Missed Call Reduction</span>
                    <span className="text-primary font-data-tabular">{reductionRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="35" 
                    step="5" 
                    value={reductionRate} 
                    onChange={(e) => setReductionRate(Number(e.target.value))} 
                    className="roi-slider w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="No-Show or Missed Call Reduction Rate"
                  />
                </div>
              </div>

              {/* Calculations - Glowing ROI Card */}
              <div className="roi-total-card p-6 text-center md:text-left rounded-2xl relative overflow-hidden drop-shadow-[0_2px_8px_rgba(0,78,71,0.15)] bg-linear-to-br from-primary/8 to-primary/3 dark:from-primary/15 dark:to-primary/8 border border-primary/20">
                {/* Absolute blurred glow circle for depth */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/15 dark:bg-primary/25 rounded-full blur-2xl pointer-events-none" />
                <p className="relative text-[11px] font-bold uppercase tracking-widest text-outline mb-1">Estimated Savings</p>
                <div className="relative text-[36px] font-black text-primary leading-none tracking-tight font-data-tabular mb-4">
                  ₱{Math.round(appointments * avgPrice * (reductionRate / 100)).toLocaleString()}
                  <span className="text-[11px] font-bold text-outline block mt-2 font-sans">recovered revenue / month</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 mb-6">
                  <div>
                    <p className="text-[10px] text-outline uppercase font-semibold">Time Saved</p>
                    <p className="font-bold text-[16px] text-on-background font-data-tabular">~{Math.round((appointments * 10) / 60)} hrs/mo</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-outline uppercase font-semibold">Bookings Saved</p>
                    <p className="font-bold text-[16px] text-on-background font-data-tabular">+{Math.round(appointments * (reductionRate / 100))} appointments</p>
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-surface-container rounded-xl border border-outline-variant/30 flex items-center gap-3 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-on-background">Recommended Plan: Professional</p>
                    <p className="text-[11px] text-on-surface-variant">Net savings: <strong className="text-primary font-data-tabular">₱{Math.round(appointments * avgPrice * (reductionRate / 100) - 4999).toLocaleString()}/mo</strong></p>
                  </div>
                </div>
              </div>
            </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8" variants={STAGGER_CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
          {PRICING_PLANS.map((plan) => (
            <motion.div 
              key={plan.name} 
              variants={STAGGER_ITEM_VARIANTS} 
              whileHover={plan.highlight ? { scale: 1.05 } : { y: -6, scale: 1.02 }} 
              className={`rounded-3xl border p-10 relative transition-all duration-300 flex flex-col justify-between ${
                plan.highlight
                  ? 'featured-pricing-card text-on-primary border-transparent shadow-[0_24px_60px_rgba(0,78,71,0.3)] scale-[1.04] z-10'
                  : 'bg-surface-container-lowest border-outline-variant/50'
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap z-20 ${
                  plan.highlight ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-container text-secondary'
                }`}>{plan.badge}</span>
              )}
              <div className="mb-8">
                <p className={`font-data-tabular text-[11px] font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-emerald-200/90 font-extrabold' : 'text-outline'}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`font-black text-[46px] leading-none ${plan.highlight ? 'text-white' : 'text-on-background'}`}>{plan.price}</span>
                  <span className={`text-[14px] font-semibold mb-2 ${plan.highlight ? 'text-white/70' : 'text-outline'}`}>{plan.period}</span>
                </div>
                <p className={`text-[14px] ${plan.highlight ? 'text-white/95 font-medium' : 'text-on-surface-variant'}`}>{plan.tagline}</p>
              </div>
              <hr className={`border-0 h-px mb-6 ${plan.highlight ? 'bg-white/10' : 'bg-outline-variant/30'}`} />
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-3 text-[13px] ${plan.highlight ? 'text-white font-medium' : 'text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-300' : 'text-primary'}`} style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button onClick={onGetStarted || onLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wide transition-all cursor-pointer ${
                plan.highlight
                  ? 'bg-primary-fixed text-on-primary-fixed hover:bg-white hover:text-primary'
                  : 'bg-primary text-white hover:bg-primary-container'
              }`}>{plan.cta}</motion.button>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.p className="text-center text-on-surface-variant text-[13px] mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
          All plans are currently <strong className="text-primary">free during our beta release</strong> – no credit card required.
        </motion.p>
      </div>
    </section>
  );
}
