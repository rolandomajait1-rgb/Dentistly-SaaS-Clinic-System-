import { useState, useEffect, useRef } from 'react';
import { Section, Container } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function Stats() {
  const [countersStarted, setCountersStarted] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [count4, setCount4] = useState(0);
  const counterSectionRef = useRef(null);

  /* Animated stat counters — trigger once when section scrolls into view */
  useEffect(() => {
    if (!counterSectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const animate = (setter, target, duration) => {
            let start = null;
            const step = (ts) => {
              if (!start) start = ts;
              const progress = Math.min((ts - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setter(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          };
          animate(setCount1, 500, 2000);
          animate(setCount2, 98,  1400);
          animate(setCount3, 30,  1600);
          animate(setCount4, 24,  1000);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(counterSectionRef.current);
    return () => obs.disconnect();
  }, [countersStarted]);

  const stats = [
    { value: count1, suffix: '+', label: 'Active Clinics',     icon: 'local_hospital',  desc: 'Across all Philippine regions', color: 'from-[#004e47] to-[#00685f]', bgLight: '#004e47', shadow: 'hover:shadow-[0_20px_50px_rgba(0,78,71,0.15)]' },
    { value: count2, suffix: '%', label: 'Satisfaction Rate',  icon: 'thumb_up',        desc: 'From verified clinic owners',   color: 'from-[#0d9488] to-[#0f766e]', bgLight: '#0d9488', shadow: 'hover:shadow-[0_20px_50px_rgba(13,148,136,0.15)]' },
    { value: count3, suffix: '%', label: 'Fewer No-Shows',     icon: 'event_available', desc: 'Average reduction in 60 days',  color: 'from-[#00685f] to-[#004e47]', bgLight: '#00685f', shadow: 'hover:shadow-[0_20px_50px_rgba(0,104,95,0.15)]' },
    { value: count4, suffix: '/7', label: 'Hours AI Booking',  icon: 'smart_toy',       desc: 'Never miss an appointment',     color: 'from-[#14b8a6] to-[#0d9488]', bgLight: '#14b8a6', shadow: 'hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)]' },
  ];

  return (
    <Section ref={counterSectionRef} id="stats" variant="transparent" className="py-20 md:py-28 relative overflow-hidden">
      {/* Unified Background System */}
      <UnifiedBackground />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Creative Title Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-primary text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Pivodent Network Active
            </div>
            <h2 className="text-[36px] md:text-[44px] font-black text-slate-900 tracking-tight leading-[1.1] font-display">
              The Numbers Behind Clinical <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#14b8a6]">Excellence.</span>
            </h2>
            <p className="text-[14.5px] text-slate-600 leading-relaxed font-medium">
              We engineer precise healthcare solutions. Hundreds of dental clinics across the country rely on our secure infrastructure daily to orchestrate appointment queues, send automated checkups, and optimize patient intake.
            </p>
            <div className="pt-6 border-t border-slate-200/80 flex items-center gap-8">
              <div>
                <p className="text-[24px] font-black text-slate-800 leading-none">12.5M+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">API Requests/Mo</p>
              </div>
              <div className="w-px h-10 bg-slate-200/80" />
              <div>
                <p className="text-[24px] font-black text-slate-800 leading-none">99.99%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">Network Uptime</p>
              </div>
            </div>
          </div>

          {/* Right Column: Staggered Bento Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`p-px rounded-[24px] transition-all duration-500 hover:-translate-y-1.5 ${
                  i === 1 ? 'sm:translate-y-6' : i === 2 ? 'sm:-translate-y-6' : ''
                } bg-linear-to-br from-slate-200/80 to-slate-350/50 hover:from-primary hover:to-teal-500 shadow-xs hover:shadow-lg group`}
              >
                <div className="w-full h-full bg-white/85 backdrop-blur-md rounded-[23px] p-6.5 relative overflow-hidden">
                  {/* Decorative absolute glow */}
                  <div 
                    className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: stat.bgLight }}
                  />

                  <div className="flex justify-between items-start mb-6">
                    {/* Icon container */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 shadow-xs bg-slate-50/50 group-hover:scale-110 transition-transform duration-300">
                      <span 
                        className={`material-symbols-outlined text-transparent bg-clip-text bg-linear-to-br ${stat.color} text-[22px]`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {stat.icon}
                      </span>
                    </div>
                    {/* Subtle top indicator bar */}
                    <div className={`w-8 h-1 rounded-full bg-linear-to-r ${stat.color}`} />
                  </div>

                  <div className="space-y-1">
                    <p className="font-data-tabular font-black text-[46px] leading-none text-slate-900 tracking-tight font-display">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="font-bold text-slate-800 text-[13px] tracking-tight">{stat.label}</p>
                    <p className="text-slate-500 text-[11.5px] leading-snug">{stat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
