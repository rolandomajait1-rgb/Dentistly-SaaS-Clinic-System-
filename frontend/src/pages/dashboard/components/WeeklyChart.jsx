import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp } from '@phosphor-icons/react';

const getBezierPath = (points) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.y;
    const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
    const cp2y = p1.y;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }
  return d;
};

export default function WeeklyChart({ stats }) {
  const [metric, setMetric] = useState('rev');
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);

  const weeklyData = useMemo(() => {
    const base = [
      { day: 'Mon', day_full: 'Monday', appts: 12, rev: 18000 },
      { day: 'Tue', day_full: 'Tuesday', appts: 19, rev: 26000 },
      { day: 'Wed', day_full: 'Wednesday', appts: 15, rev: 21000 },
      { day: 'Thu', day_full: 'Thursday', appts: 24, rev: 35000 },
      { day: 'Fri', day_full: 'Friday', appts: 30, rev: 44000 },
      { day: 'Sat', day_full: 'Saturday', appts: 11, rev: 16000 },
      { day: 'Sun', day_full: 'Sunday', appts: 8,  rev: 12000 },
    ];

    const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6

    return base.map((d, idx) => {
      if (idx < todayIndex) {
        return { ...d, isProjected: false };
      } else if (idx === todayIndex) {
        const todayRevenue = stats?.revenue || 0;
        const todayAppts = stats?.total || 0;
        return {
          ...d,
          appts: todayAppts,
          rev: todayRevenue,
          isProjected: false,
        };
      } else {
        return {
          ...d,
          isProjected: true,
        };
      }
    });
  }, [stats, metric]);

  const max = useMemo(() => Math.max(...weeklyData.map(d => d[metric])) * 1.18 || 1, [weeklyData, metric]);
  const W = 500, H = 150, PX = 52, PY = 16;

  const pts = weeklyData.map((d, i) => ({
    x: PX + (i / (weeklyData.length - 1)) * (W - PX - 20),
    y: H - PY - (d[metric] / max) * (H - PY * 2),
    ...d,
  }));

  const todayIndex = (new Date().getDay() + 6) % 7;

  const actualPts = pts.slice(0, todayIndex + 1);
  const projectedPts = pts.slice(todayIndex);

  const actualLine = getBezierPath(actualPts);
  const projectedLine = getBezierPath(projectedPts);

  const actualArea = actualPts.length > 0 ? `${actualLine} L${actualPts[actualPts.length - 1].x},${H - PY} L${actualPts[0].x},${H - PY} Z` : '';
  const projectedArea = projectedPts.length > 0 ? `${projectedLine} L${projectedPts[projectedPts.length - 1].x},${H - PY} L${projectedPts[0].x},${H - PY} Z` : '';

  // Generate dynamic Y-axis tick values for realism
  const yTicks = useMemo(() => {
    const tickCount = 4;
    const ticks = [];
    for (let i = tickCount; i >= 0; i--) {
      const val = (max / 1.18) * (i / tickCount);
      ticks.push({
        val,
        label: metric === 'rev' 
          ? `₱${Math.round(val / 1000)}k`
          : Math.round(val).toString(),
        y: PY + (1 - i / tickCount) * (H - PY * 2)
      });
    }
    return ticks;
  }, [max, metric]);

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0, minD = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < minD) {
        minD = d;
        closest = i;
      }
    });
    setHovered(closest);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-extrabold text-sm text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <TrendUp size={15} className="text-teal-600 dark:text-teal-400" weight="bold" />
            </span>
            Weekly Performance
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 ml-9 font-semibold">Appointments & revenue trends this week</p>
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-955 border border-slate-200/80 dark:border-slate-850 rounded-xl p-0.5 gap-0.5">
          {[
            { k: 'rev', l: 'Revenue' },
            { k: 'appts', l: 'Patients' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setMetric(k)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                metric === k
                  ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                  : 'text-slate-450 dark:text-slate-505 hover:text-slate-700 dark:hover:text-slate-250'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ aspectRatio: '500/150' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible cursor-crosshair select-none"
          onMouseMove={handleMove} onMouseLeave={() => setHovered(null)}>
          <defs>
            <linearGradient id="teal-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary-container, #00685f)" />
            </linearGradient>
            <linearGradient id="teal-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
            <filter id="neon-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="3" floodColor="var(--color-primary)" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Realistic horizontal grid lines and Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i} className="opacity-40 dark:opacity-20">
              <line x1={PX} y1={tick.y} x2={W - 20} y2={tick.y}
                stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <text x={PX - 10} y={tick.y + 2.5} textAnchor="end"
                className="fill-slate-400 dark:fill-slate-550 font-extrabold" style={{ fontSize: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                {tick.label}
              </text>
            </g>
          ))}
          
          {actualPts.length > 1 && (
            <path d={actualArea} fill="url(#teal-area-grad)" />
          )}
          {projectedPts.length > 1 && (
            <path d={projectedArea} fill="url(#teal-area-grad)" opacity="0.08" />
          )}
          
          {actualPts.length > 1 && (
            <path d={actualLine} fill="none" stroke="url(#teal-line-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)" />
          )}
          {projectedPts.length > 1 && (
            <path d={projectedLine} fill="none" stroke="url(#teal-line-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" opacity="0.5" />
          )}
          
          {hovered !== null && (
            <>
              {/* Vertical helper tracking guide */}
              <line x1={pts[hovered].x} y1={PY} x2={pts[hovered].x} y2={H - PY}
                stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              {/* Pulsing visual halo intersection */}
              <circle cx={pts[hovered].x} cy={pts[hovered].y} r="9" className="fill-primary/20 animate-pulse pointer-events-none" />
            </>
          )}
          
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hovered === i ? 5.5 : 3.5}
              className={`fill-white dark:fill-slate-900 stroke-primary dark:stroke-primary-fixed-dim transition-all duration-200 ${
                hovered === i ? 'scale-125 stroke-[3]' : 'stroke-[2.5]'
              }`} />
          ))}
          
          {pts.map((p, i) => (
            <g key={i}>
              <line x1={p.x} y1={H - PY} x2={p.x} y2={H - PY + 4} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
              <text x={p.x} y={H - 2} textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-extrabold" style={{ fontSize: '8.5px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                {p.day}
              </text>
            </g>
          ))}
        </svg>
 
        <AnimatePresence>
          {hovered !== null && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute z-20 pointer-events-none bg-slate-955 dark:bg-black text-white rounded-xl px-3.5 py-2 shadow-lg border border-slate-800 text-xs min-w-[120px]"
              style={{ left: `${(pts[hovered].x / W) * 100}%`, top: `${(pts[hovered].y / H) * 100}%`, transform: 'translate(-50%, -130%)' }}>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-955 dark:bg-black border-r border-b border-slate-800 pointer-events-none" />
              <p className="text-[8px] font-black uppercase tracking-widest text-teal-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {pts[hovered].isProjected ? `${pts[hovered].day_full} (Projected)` : pts[hovered].day_full || pts[hovered].day}
              </p>
              <p className="font-extrabold text-[12px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {metric === 'rev' ? `₱${pts[hovered].rev.toLocaleString()}` : `${pts[hovered].appts} Patients`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
