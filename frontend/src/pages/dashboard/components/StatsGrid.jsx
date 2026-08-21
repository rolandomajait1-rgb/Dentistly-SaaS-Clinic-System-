import { motion } from 'framer-motion';
import {
  CalendarDots,
  UsersThree,
  Money,
  TrendUp,
  Bell,
  CheckCircle,
} from '@phosphor-icons/react';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      
      {/* Card 1: Today's Appointments */}
      <motion.div custom={1} variants={FADE_UP}
        whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-linear-to-br from-primary/[0.04] to-white dark:from-primary/[0.05] dark:to-slate-900/90 p-6 flex flex-col justify-between h-40 shadow-xs hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 78, 71, 0.22) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-550 dark:text-slate-400">Today's Appointments</p>
          <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim shadow-3xs">
            <CalendarDots size={16} weight="bold" />
          </div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-black leading-none tracking-tight text-slate-850 dark:text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.total}</h3>
            <p className="text-[11.5px] font-bold text-slate-650 dark:text-slate-350 tracking-wide">{stats.completedToday} completed</p>
          </div>
          {/* SVG Progress Ring */}
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-11 h-11 transform -rotate-90">
              <circle cx="22" cy="22" r="16" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="2.5" fill="transparent" />
              <circle cx="22" cy="22" r="16" stroke="var(--color-primary)" strokeWidth="3" fill="transparent"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 - (stats.completionRate / 100) * (2 * Math.PI * 16)}
                strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <span className="absolute text-[8.5px] font-black text-primary dark:text-primary-fixed-dim" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.completionRate}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Pending Approvals */}
      <motion.div custom={2} variants={FADE_UP}
        whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-linear-to-br from-primary/[0.04] to-white dark:from-primary/[0.05] dark:to-slate-900/90 p-6 flex flex-col justify-between h-40 shadow-xs hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 78, 71, 0.22) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-550 dark:text-slate-400">Pending Approvals</p>
          {stats.pending > 0 ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-rose-500/20 animate-ping" />
              <div className="w-8 h-8 rounded-lg border border-rose-500/25 bg-rose-500/10 flex items-center justify-center text-rose-655 dark:text-rose-400 shadow-3xs relative z-10">
                <Bell size={16} className="animate-bounce" weight="bold" />
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim shadow-3xs">
              <CheckCircle size={16} weight="bold" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h3 className={`text-3xl font-black leading-none tracking-tight ${stats.pending > 0 ? 'text-rose-600 dark:text-rose-455' : 'text-slate-850 dark:text-slate-100'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.pending}</h3>
            <p className="text-[11.5px] font-bold text-slate-650 dark:text-slate-350 tracking-wide">
              {stats.pending > 0 ? 'Requires action' : 'System all clear'}
            </p>
          </div>
          {stats.pending > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-[8px] font-black tracking-wider uppercase animate-pulse">
              Review
            </span>
          )}
        </div>
      </motion.div>

      {/* Card 3: Revenue Today */}
      <motion.div custom={3} variants={FADE_UP}
        whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-linear-to-br from-primary/[0.04] to-white dark:from-primary/[0.05] dark:to-slate-900/90 p-6 flex flex-col justify-between h-40 shadow-xs hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 78, 71, 0.22) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-550 dark:text-slate-400">Revenue Today</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8.5px] font-black tracking-wide">
              <TrendUp size={9} weight="bold" />
              +12%
            </span>
            <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim shadow-3xs">
              <Money size={16} weight="bold" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-black leading-none tracking-tight text-slate-850 dark:text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>₱{stats.revenue.toLocaleString()}</h3>
            <p className="text-[11.5px] font-bold text-slate-650 dark:text-slate-350 tracking-wide">From approved list</p>
          </div>
          {/* Sparkline Asset */}
          <div className="w-12 h-6 shrink-0 flex items-end">
            <svg className="w-full h-full overflow-visible">
              <path d="M0,18 Q8,6 16,22 Q24,2 32,14 L44,2" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,18 Q8,6 16,22 Q24,2 32,14 L44,2 L44,24 L0,24 Z" fill="var(--color-primary)" fillOpacity="0.06" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Card 4: Registered Patients */}
      <motion.div custom={4} variants={FADE_UP}
        whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-linear-to-br from-primary/[0.04] to-white dark:from-primary/[0.05] dark:to-slate-900/90 p-6 flex flex-col justify-between h-40 shadow-xs hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 78, 71, 0.22) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-550 dark:text-slate-400">Registered Patients</p>
          <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim shadow-3xs">
            <UsersThree size={16} weight="bold" />
          </div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-black leading-none tracking-tight text-slate-850 dark:text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.totalPatients || 0}</h3>
            <p className="text-[11.5px] font-bold text-slate-650 dark:text-slate-350 tracking-wide">All-time active list</p>
          </div>
          {/* Facepile initials circles */}
          <div className="flex -space-x-2 overflow-hidden shrink-0">
            {['JS', 'AM', 'KL'].map((init, idx) => (
              <div key={idx} className={`w-5.5 h-5.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[7.5px] font-black text-white shadow-xs ${
                idx === 0 ? 'bg-gradient-to-br from-teal-400 to-teal-600' :
                idx === 1 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                'bg-gradient-to-br from-sky-400 to-sky-600'
              }`}>
                {init}
              </div>
            ))}
            <div className="w-5.5 h-5.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[7.5px] font-black text-slate-550 dark:text-slate-455 bg-slate-100 dark:bg-slate-800 shadow-xs">
              +42
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
