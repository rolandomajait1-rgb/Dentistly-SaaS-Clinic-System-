import { motion } from 'framer-motion';
import {
  ClockCountdown,
  Stethoscope,
  CheckCircle,
  ListNumbers,
  CaretRight,
  Check,
  X,
  Seal,
  Robot,
  TrendUp
} from '@phosphor-icons/react';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  })
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const getInitials = (name) =>
  (name || 'W').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const getAvatarColor = (name) => {
  const colors = [
    'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20',
    'bg-teal-650/15 text-teal-850 dark:text-teal-350 border-teal-500/20',
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20',
    'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20',
    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  ];
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function NextPatientSpotlight({
  nextAppointment,
  stats,
  pendingList,
  setActiveTab,
  handleStatusChange,
  setSelectedPatient
}) {
  return (
    <div className="space-y-6">

      {/* Next Patient Card */}
      {nextAppointment ? (
        <motion.div custom={7} variants={FADE_UP}
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-primary/20 border border-primary/20"
          style={{ background: 'linear-gradient(135deg, #002420 0%, #004e47 50%, #006b61 100%)' }}>
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-teal-200/70">Next Patient Spotlight</p>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          </div>
          
          <div className="relative z-10 flex items-center gap-4.5 mb-5">
            <div className="w-12 h-12 rounded-2xl border-2 border-white/20 flex items-center justify-center text-[12px] font-black shrink-0 bg-white/10 text-white shadow-md">
              {getInitials(nextAppointment.patient?.full_name)}
            </div>
            <div>
              <p className="font-black text-base leading-none tracking-tight">{nextAppointment.patient?.full_name || 'Walk-in'}</p>
              <p className="text-teal-200/80 text-[11px] mt-1.5 font-bold flex items-center gap-1">
                <Stethoscope size={13} weight="fill" />
                {nextAppointment.service?.service_name || 'Appointment'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between bg-black/15 rounded-2xl p-3 border border-white/5 backdrop-blur-md">
            <div>
              <p className="text-[8px] text-white/50 font-black uppercase tracking-widest">Appointment Time</p>
              <p className="text-lg font-black tracking-wider text-teal-300 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(nextAppointment.appointment_time)}</p>
            </div>
            <button onClick={() => handleStatusChange(nextAppointment.id, 'Serving')}
              className="px-4 py-2 bg-white text-primary rounded-xl text-[10px] font-black cursor-pointer hover:bg-teal-50 hover:scale-105 active:scale-95 transition-all shadow-md">
              Start Session
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div custom={7} variants={FADE_UP}
          className="rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 bg-linear-to-br from-primary/6 to-white dark:from-primary/8 dark:to-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center gap-3 py-9 shadow-xs hover:border-teal-500/20 dark:hover:border-teal-500/20 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-40 dark:opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0, 104, 95, 0.22) 0%, transparent 70%)' }} />
          <div className="relative w-12 h-12 rounded-full border border-teal-500/20 bg-teal-500/10 flex items-center justify-center mb-1">
            <div className="w-8 h-8 rounded-full border border-teal-500/30 bg-teal-500/20 flex items-center justify-center animate-pulse">
              <CheckCircle size={16} className="text-teal-600 dark:text-teal-450" weight="bold" />
            </div>
          </div>
          <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-100">All Operations Clear</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-normal px-4 max-w-[200px]">All approved appointments for today have been completed or served.</p>
        </motion.div>
      )}

      {/* Queue Status Widget */}
      <motion.div custom={8} variants={FADE_UP}
        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-sm text-primary dark:text-primary-fixed-dim flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <ListNumbers size={14} className="text-primary dark:text-primary-fixed-dim" weight="bold" />
            </span>
            Queue Metrics
          </h3>
          <button onClick={() => setActiveTab('queue')}
            className="text-primary text-[11px] font-black hover:underline cursor-pointer flex items-center gap-0.5">
            Manage <CaretRight size={12} weight="bold" />
          </button>
        </div>

        <div className="space-y-4.5">
          {[
            { label: 'Active in Chair', value: stats.activeQueue, color: 'bg-primary', barBg: 'bg-primary/20', percent: stats.total > 0 ? (stats.activeQueue / stats.total) * 100 : 0 },
            { label: 'Pending Review', value: stats.pending, color: 'bg-rose-500', barBg: 'bg-rose-500/20', percent: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0 },
            { label: 'Completed Today', value: stats.completedToday, color: 'bg-emerald-500', barBg: 'bg-emerald-500/20', percent: stats.total > 0 ? (stats.completedToday / stats.total) * 100 : 0 },
          ].map((s, i) => (
            <div key={i} className="space-y-2 group cursor-default">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color} ring-4 ring-offset-0 ${s.barBg}`} />
                  {s.label}
                </span>
                <span className="font-black text-slate-800 dark:text-slate-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all duration-700 ease-out group-hover:brightness-110`} style={{ width: `${s.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Inbox / Pending Requests Widget */}
      <motion.div custom={9} variants={FADE_UP}
        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-sm text-primary dark:text-primary-fixed-dim flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <ClockCountdown size={14} className="text-primary dark:text-primary-fixed-dim" weight="bold" />
            </span>
            Inbox
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black min-w-[18px] text-center shadow-sm animate-pulse">
                {pendingList.length}
              </span>
            )}
          </h3>
          <button onClick={() => setActiveTab('schedule')}
            className="text-primary text-[11px] font-black hover:underline cursor-pointer flex items-center gap-0.5">
            Inbox <CaretRight size={12} weight="bold" />
          </button>
        </div>

        {pendingList.length === 0 ? (
          <div className="relative w-full overflow-hidden rounded-2xl p-5 border border-dashed border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center py-8">
            <div className="relative w-12 h-12 rounded-full border border-teal-500/20 bg-teal-500/10 flex items-center justify-center mb-1">
              <div className="w-8 h-8 rounded-full border border-teal-500/30 bg-teal-500/20 flex items-center justify-center">
                <CheckCircle size={16} className="text-teal-600 dark:text-teal-450" weight="bold" />
              </div>
            </div>
            <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-100">Inbox Clean</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-normal font-medium text-center">All incoming patient requests are fully validated and checked.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingList.slice(0, 4).map((app) => (
              <div key={app.id} onClick={() => app.patient && setSelectedPatient(app.patient)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/40 dark:bg-slate-950/10 border border-slate-200/50 dark:border-slate-850/80 hover:border-teal-500/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all duration-300 cursor-pointer group animate-fadeIn">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 ${getAvatarColor(app.patient?.full_name)}`}>
                  {getInitials(app.patient?.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[11px] text-slate-800 dark:text-slate-250 group-hover:text-primary transition-colors truncate leading-none">
                    {app.patient?.full_name || 'Walk-in'}
                  </p>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold truncate mt-1">
                    {app.service?.service_name || 'Check-up'} · {formatTime(app.appointment_time)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); handleStatusChange(app.id, 'Approved'); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer" title="Approve">
                    <Check size={13} weight="bold" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleStatusChange(app.id, 'Cancelled'); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer" title="Decline">
                    <X size={13} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Live Activity Timeline */}
      <motion.div custom={10} variants={FADE_UP}
        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300 animate-fadeIn">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <TrendUp size={14} className="text-primary dark:text-primary-fixed-dim" weight="bold" />
          </span>
          <h3 className="font-extrabold text-sm text-primary dark:text-primary-fixed-dim">Live Activity Feed</h3>
        </div>
        <div className="p-5 space-y-5 relative">
          <div className="absolute left-[36px] top-5 bottom-5 w-[2px] bg-linear-to-b from-primary via-primary/40 to-slate-200 dark:to-slate-800 pointer-events-none" />
          {[
            { Icon: Seal, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', title: 'SaaS Integration Sync Completed', sub: 'Secure DB sync completed successfully' },
            { Icon: Robot, color: 'text-teal-555 dark:text-teal-350', bg: 'bg-teal-500/10 border-teal-500/20', title: 'AI Chatbot Webhook Triggered', sub: 'Messenger queue polling is active' },
            { Icon: Stethoscope, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Clinic System Initialized', sub: 'All cloud instances operating' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start relative z-10 group cursor-default">
              <div className={`w-8 h-8 rounded-full ${item.bg} border flex items-center justify-center shrink-0 mt-0.5 shadow-3xs group-hover:scale-110 group-hover:border-teal-500/40 transition-all duration-300`}>
                <item.Icon size={14} className={item.color} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-snug group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-[10.5px] text-slate-650 dark:text-slate-400 font-medium tracking-normal leading-normal mt-1">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
