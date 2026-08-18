import { motion } from 'framer-motion';

export default function TrustBadges() {
  const badges = [
    { icon: 'verified_user', label: 'HIPAA Compliant', sublabel: 'Data Protection' },
    { icon: 'lock', label: 'SSL Encrypted', sublabel: 'Bank-Level Security' },
    { icon: 'cloud_done', label: '99.9% Uptime', sublabel: 'AWS Cloud Hosted' },
    { icon: 'support_agent', label: '24/7 Support', sublabel: 'PH Helpdesk' },
  ];

  return (
    <div className="border-y border-outline-variant/30 bg-surface-container-lowest/80 py-8 select-none relative overflow-hidden">
      {/* Subtle overlay light lines */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-[0.03]" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center justify-items-center">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -2 }}
              className="flex items-center gap-3.5 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {badge.icon}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-extrabold text-slate-800 dark:text-slate-200 leading-none mb-1.5 group-hover:text-primary transition-colors">
                  {badge.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                  {badge.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
