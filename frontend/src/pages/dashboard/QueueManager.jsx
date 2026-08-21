import { useState, useEffect, useCallback, useMemo } from 'react';
import { getQueue, getServices, createAppointment, updateAppointmentStatus } from '../../api';
import {
  UsersThree,
  UserFocus,
  CheckCircle,
  Stethoscope,
  PlayCircle,
  ArrowRight,
  ListNumbers,
  UserPlus,
  Phone,
  CircleNotch,
  Television,
  Info,
  Clock,
} from '@phosphor-icons/react';

const formatTime = (timeString) => {
  if (!timeString) return '';
  const parts = timeString.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${m} ${ampm}`;
};

function QueueCard({ app, position, onCall, isCurrent }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
      isCurrent
        ? 'bg-primary/[0.04] border-primary/45 shadow-xs'
        : 'bg-white border-slate-200/80 hover:border-primary/30 hover:shadow-xs'
    }`} >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
        isCurrent ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-700'
      }`}>
        {isCurrent ? <UserFocus size={18} weight="bold" className="text-white" /> : position}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{app.patient?.full_name || 'Walk-in'}</p>
          {isCurrent && (
            <span className="shrink-0 text-[9px] font-black bg-amber-100 text-amber-850 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">In Chair</span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold mt-1">{app.service?.service_name}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg block" style={{ fontFamily: "'DM Mono', monospace" }}>{formatTime(app.appointment_time)}</span>
        <span className="text-xs text-primary font-black mt-1.5 block" style={{ fontFamily: "'DM Mono', monospace" }}>₱{(app.service?.price || 0).toLocaleString()}</span>
      </div>

      {onCall && (
        <button onClick={onCall} title="Call this patient immediately"
          className="shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-primary hover:text-white text-slate-650 hover:border-primary transition-all duration-150 cursor-pointer">
          <PlayCircle size={18} weight="bold" />
        </button>
      )}
    </div>
  );
}

export default function QueueManager() {
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState('');

  const fetchQueue = useCallback(async () => {
    try { const data = await getQueue(); setQueue(data); } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, []);

  const fetchServices = useCallback(async () => {
    try { const data = await getServices(); setServices(data); if (data.length > 0) setWalkinServiceId(data[0].id); } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => { if (active) await Promise.all([fetchQueue(), fetchServices()]); };
    init();
    return () => { active = false; };
  }, [fetchQueue, fetchServices]);

  const queueList = useMemo(() => queue.filter(a => a.status === 'Approved' || a.status === 'Serving'), [queue]);
  const currentServing = useMemo(() => queueList.find(a => a.status === 'Serving'), [queueList]);
  const remainingQueue = useMemo(() => queueList.filter(a => a.status === 'Approved'), [queueList]);
  const completedToday = useMemo(() => queue.filter(a => a.status === 'Completed').length, [queue]);

  const handleCallNext = async () => {
    if (remainingQueue.length === 0) return alert('No patients waiting in the queue!');
    const next = remainingQueue[0];
    try {
      if (currentServing) await updateAppointmentStatus(currentServing.id, 'Completed');
      await updateAppointmentStatus(next.id, 'Serving');
      await fetchQueue();
    } catch (err) { alert('Error updating queue: ' + err.message); }
  };

  const handleComplete = async () => {
    if (!currentServing) return;
    try { await updateAppointmentStatus(currentServing.id, 'Completed'); await fetchQueue(); }
    catch (err) { alert('Error completing service: ' + err.message); }
  };

  const handleCallSpecific = async (app) => {
    try {
      if (currentServing) await updateAppointmentStatus(currentServing.id, 'Completed');
      await updateAppointmentStatus(app.id, 'Serving');
      await fetchQueue();
    } catch (err) { alert('Error calling patient: ' + err.message); }
  };

  const handleWalkin = async (e) => {
    e.preventDefault();
    if (!walkinName) return alert('Enter patient name!');
    if (!walkinPhone) return alert('Enter patient phone number!');
    if (!walkinServiceId) return alert('Select a treatment!');
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toTimeString().split(' ')[0];
    try {
      await createAppointment({ patient_name: walkinName + ' (Walk-in)', phone: walkinPhone, service_id: walkinServiceId, date: todayStr, time: timeNow, medical_notes: 'None' });
      setWalkinName(''); setWalkinPhone('');
      await fetchQueue();
    } catch (err) { alert('Error adding walk-in to queue: ' + err.message); }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <CircleNotch size={36} weight="bold" className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading queue status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Queue Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time control for active clinic patients.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => alert('Opening waiting room TV display...')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
            <Television size={16} weight="bold" />
            TV Display
          </button>
        </div>
      </div>

      {/* ── Stats Row (Polished Contrast Upgrade) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { Icon: ListNumbers, label: 'In Queue Waiting', value: remainingQueue.length, textColor: 'text-teal-800 dark:text-teal-400', cardBg: 'bg-teal-50/40 dark:bg-teal-950/10 border-teal-200 dark:border-teal-900/60' },
          { Icon: UserFocus,   label: 'Currently Serving', value: currentServing ? 1 : 0, textColor: 'text-[#005e53] dark:text-[#85d5c9]', cardBg: 'bg-[#e6f4f2]/60 dark:bg-[#002b26]/10 border-[#a3d9d0] dark:border-[#004d45]/60' },
          { Icon: CheckCircle, label: 'Completed Today',   value: completedToday,         textColor: 'text-emerald-800 dark:text-emerald-400', cardBg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-900/60' },
        ].map(stat => (
          <div key={stat.label} className={`border rounded-2xl p-5 shadow-xs flex items-center gap-4 ${stat.cardBg}`}>
            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 shadow-xs flex items-center justify-center shrink-0`}>
              <stat.Icon size={22} weight="bold" className={stat.textColor.split(' ').shift()} />
            </div>
            <div>
              <p className={`text-2xl font-black ${stat.textColor}`} style={{ fontFamily: "'DM Mono', monospace" }}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Now Serving + Queue */}
        <div className="lg:col-span-2 space-y-5">
          {/* Now Serving Card */}
          <div className="relative overflow-hidden text-white p-7 rounded-2xl shadow-lg border border-teal-800"
            style={{ background: 'linear-gradient(135deg, #004e47 0%, #006a61 50%, #0d9488 100%)' }}>
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-8 bottom-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex justify-between items-start gap-4">
              <div className="flex-1">
                <span className="inline-block text-[10px] font-black tracking-widest uppercase bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-5">
                  Currently Serving
                </span>
                {currentServing ? (
                  <div>
                    <h3 className="text-4xl font-extrabold tracking-tight mb-2 text-white">{currentServing.patient?.full_name}</h3>
                    <p className="text-teal-200 text-base font-bold">{currentServing.service?.service_name}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-white/80 font-bold">
                      <Clock size={14} weight="bold" />
                      Started · {formatTime(currentServing.appointment_time)} · ₱{(currentServing.service?.price || 0).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-black text-white/70">No Patient in Chair</h3>
                    <p className="text-sm text-teal-100/60 mt-1.5 font-bold">Dentist is currently available to receive patients.</p>
                  </div>
                )}
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-xs">
                <Stethoscope size={36} weight="bold" className="text-white/80" />
              </div>
            </div>

            <div className="relative flex flex-wrap gap-3 mt-7 pt-5 border-t border-white/20">
              {currentServing ? (
                <>
                  <button onClick={handleComplete}
                    className="flex-1 py-3 bg-white text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-teal-50 hover:scale-[1.01] transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer">
                    <CheckCircle size={18} weight="bold" /> Complete Service
                  </button>
                  <button onClick={handleCallNext}
                    className="px-6 py-3 bg-white/15 border border-white/25 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/25 hover:scale-[1.01] transition-all text-xs uppercase tracking-wider cursor-pointer">
                    Call Next <ArrowRight size={16} weight="bold" />
                  </button>
                </>
              ) : (
                <button onClick={handleCallNext}
                  className="w-full py-4 bg-white text-primary font-black rounded-xl flex items-center justify-center gap-2 hover:bg-teal-50 hover:scale-[1.01] transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer">
                  <PlayCircle size={22} weight="bold" /> Call First Patient in Queue
                </button>
              )}
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-200/80 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2">
                <ListNumbers size={20} weight="bold" className="text-slate-700 dark:text-slate-350" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Waiting Queue</h3>
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">{remainingQueue.length}</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {remainingQueue.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <UsersThree size={48} weight="duotone" className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold text-slate-650 dark:text-slate-400">Waiting area is empty</p>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-450">No upcoming appointments in the queue.</p>
                </div>
              ) : remainingQueue.map((app, idx) => (
                <QueueCard key={app.id} app={app} position={idx + 1} isCurrent={false} onCall={() => handleCallSpecific(app)} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Walk-in + Rules */}
        <div className="space-y-5">
          {/* Walk-in Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-200/80 dark:border-slate-850 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/20">
              <UserPlus size={20} weight="bold" className="text-slate-700 dark:text-slate-350" />
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-100">Walk-in Patient</h3>
            </div>
            <form onSubmit={handleWalkin} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-1.5">Patient Name</label>
                <div className="relative">
                  <UsersThree size={16} weight="bold" className="absolute left-2.5 top-3 text-slate-400" />
                  <input required type="text" value={walkinName} onChange={e => setWalkinName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-850 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} weight="bold" className="absolute left-2.5 top-3 text-slate-400" />
                  <input required type="tel" value={walkinPhone} onChange={e => setWalkinPhone(e.target.value)}
                    placeholder="09XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-850 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-widest mb-1.5">Select Treatment</label>
                <select value={walkinServiceId} onChange={e => setWalkinServiceId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer">
                  {services.map(s => <option key={s.id} value={s.id}>{s.service_name} (₱{(s.price || 0).toLocaleString()})</option>)}
                </select>
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider">
                <UserPlus size={16} weight="bold" /> Add to Queue
              </button>
            </form>
          </div>

          {/* Queue Rules */}
          <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                <Info size={12} weight="bold" className="text-primary" />
              </span>
              Queue Rules
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 font-bold">
              {[
                'Walk-ins are queued behind pre-scheduled appointments.',
                'Calling next auto-marks the current serving patient as Completed.',
                'Use "Call" buttons to prioritize any patient in the queue.',
              ].map((rule, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
