import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Sliders,
  CalendarDots,
  Stethoscope,
  CheckCircle,
  XCircle,
  User,
  ArrowRight,
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

function StatusBadge({ status }) {
  const cfg = {
    Approved:  { dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', pulse: true },
    Pending:   { dot: 'bg-amber-500',   cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',   pulse: true },
    Completed: { dot: 'bg-blue-500',    cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',     pulse: false },
    Serving:   { dot: 'bg-purple-500',  cls: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20', pulse: true },
    Cancelled: { dot: 'bg-rose-500',    cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',    pulse: false },
  };
  const c = cfg[status] || cfg['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-3xs ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

export default function AppointmentsTable({
  upcomingList,
  totalCount,
  tableFilter,
  setTableFilter,
  searchFilter,
  setSearchFilter,
  setActiveTab,
  handleStatusChange,
  setSelectedPatient
}) {
  return (
    <motion.div custom={6} variants={FADE_UP}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] dark:shadow-none overflow-hidden animate-fadeIn">
      
      {/* Table Header Controls */}
      <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shrink-0 shadow-md">
            <CalendarCheck size={18} className="text-white" weight="bold" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Today's Schedule</h3>
            <p className="text-[11px] text-slate-555 dark:text-slate-400 font-bold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary animate-pulse text-primary"></span>
              {upcomingList.length} appointment{upcomingList.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          {upcomingList.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim text-[10px] font-black border border-primary/20 shadow-3xs">{upcomingList.length}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Sliders size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-550 pointer-events-none" weight="bold" />
            <select value={tableFilter} onChange={e => setTableFilter(e.target.value)}
              className="h-8.5 w-full sm:w-32 pl-8.5 pr-3 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-350 bg-slate-55 dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800 focus:border-teal-500 focus:outline-none appearance-none cursor-pointer">
              {['All', 'Pending', 'Approved', 'Serving', 'Completed'].map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text"
              placeholder="Search patient..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="h-8.5 w-full sm:w-40 pl-8 pr-3 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-55 dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-955/20">
              {['Time', 'Patient', 'Treatment', 'Fee', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-505 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {upcomingList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-955 flex items-center justify-center border border-slate-200/40">
                      <CalendarDots size={28} className="text-slate-455" weight="duotone" />
                    </div>
                    <p className="text-sm font-bold text-slate-550">No appointments for today</p>
                    <button onClick={() => setActiveTab('schedule')}
                      className="text-slate-550 dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim text-xs font-medium underline underline-offset-4 cursor-pointer transition-colors">
                      Schedule one now
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              upcomingList.map((app) => (
                <tr key={app.id} onClick={() => app.patient && setSelectedPatient(app.patient)}
                  className="group cursor-pointer transition-all duration-200 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.04] border-l-4 border-l-transparent hover:border-l-primary">
                  <td className="px-6 py-4.5 text-[12px] font-black text-slate-800 dark:text-slate-200 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatTime(app.appointment_time)}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-[11px] font-black shrink-0 shadow-3xs transition-transform group-hover:scale-105 ${getAvatarColor(app.patient?.full_name)}`}>
                        {getInitials(app.patient?.full_name)}
                      </div>
                      <div>
                        <p className="font-black text-[13px] text-slate-850 dark:text-slate-200 group-hover:text-primary transition-colors leading-none">
                          {app.patient?.full_name || 'Walk-in'}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-505 font-bold mt-1.5 uppercase tracking-wider">ID: #{app.patient?.id || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-650 dark:text-slate-350 font-bold">
                      <Stethoscope size={14} weight="duotone" className="text-primary" />
                      {app.service?.service_name || 'General Check-up'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-[13px] font-black text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>₱{(app.service?.price || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4.5"><StatusBadge status={app.status} /></td>
                  <td className="px-5 py-4.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {['pending','Pending'].includes(app.status) && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleStatusChange(app.id, 'Approved'); }}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer" title="Approve">
                            <CheckCircle size={15} weight="bold" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleStatusChange(app.id, 'Cancelled'); }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer" title="Cancel">
                            <XCircle size={15} weight="bold" />
                          </button>
                        </>
                      )}
                      {['approved','Approved'].includes(app.status) && (
                        <button onClick={e => { e.stopPropagation(); handleStatusChange(app.id, 'Serving'); }}
                          className="px-2.5 py-1 rounded-lg bg-purple-550/10 text-purple-650 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-purple-550/20 transition-all">
                          Serve
                        </button>
                      )}
                      {app.patient && (
                        <button onClick={e => { e.stopPropagation(); setSelectedPatient(app.patient); }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary/70 transition-colors cursor-pointer" title="View EHR">
                          <User size={15} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 flex items-center justify-between">
        <p className="text-[11px] text-slate-555 dark:text-slate-400 font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary animate-pulse"></span>
          Showing <span className="text-primary dark:text-primary-fixed-dim font-black">{upcomingList.length}</span> of {totalCount} appointments
        </p>
        <button onClick={() => setActiveTab('schedule')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-primary dark:text-primary-fixed-dim text-xs font-black hover:bg-primary/10 rounded-lg transition-all cursor-pointer">
          View All Schedule
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </motion.div>
  );
}
