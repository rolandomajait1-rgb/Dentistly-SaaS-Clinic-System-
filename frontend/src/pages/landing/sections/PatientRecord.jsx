import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Badge, Heading } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function PatientRecord() {
  const [mockupTab, setMockupTab] = useState('profile');
  const [selectedTooth, setSelectedTooth] = useState(14);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  /* 3-D card tilt */
  const handleCardMouseMove = e => {
    const c = containerRef.current, card = cardRef.current;
    if (!c || !card) return;
    const rect = c.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
    const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  };
  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform .5s ease';
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };
  const handleCardMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform .1s ease';
  };

  return (
    <Section id="patient-record" variant="transparent" className="section-accent-line">
      {/* Unified Background System */}
      <UnifiedBackground />
      <motion.div
        className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* Copy (now on the left) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
          viewport={{ once: true, margin: '-80px' }}
          className="lg:col-span-6"
        >
          <Badge variant="primary" pulse>
            Patient-Centric Records
          </Badge>
          
          <Heading level={2} className="mb-6 mt-6">
            Every patient's <span className="font-serif italic font-normal text-primary">complete history</span>, always at your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-teal-600">fingertips.</span>
          </Heading>
          
          <p className="text-[16px] text-slate-600 mb-8 leading-relaxed font-medium">
            A 360° patient dashboard that unites clinical documentation with billing and scheduling. No more searching through paper charts or disconnected apps — everything fits inside clean, responsive patient profiles.
          </p>
          
          <ul className="space-y-6">
            {[
              { icon: 'clinical_notes', title: 'Per-Visit EHR Notes', desc: 'Secure medical history, clinical findings, active allergy list, and next steps in one place.', grad: 'from-primary/10 to-primary/5 text-primary' },
              { icon: 'dentistry', title: '32-Tooth Visual Charting', desc: 'Interactive upper & lower arch dentition charting to easily map and track crowns, caries, and fillings.', grad: 'from-blue-500/10 to-blue-500/5 text-blue-600' },
              { icon: 'medication', title: 'Digital Prescription Generator', desc: 'Instantly write prescriptions with local dosage templates and generate print-ready PDFs for patients.', grad: 'from-purple-500/10 to-purple-500/5 text-purple-600' },
              { icon: 'search', title: 'Full-Text Patient Search', desc: 'Find patient files, treatment logs, or medical conditions in milliseconds using phone numbers or names.', grad: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600' },
              { icon: 'local_hospital', title: 'Priority High-Risk Flagging', desc: 'Instantly label patients with chronic conditions or allergies to guarantee clinical precision.', grad: 'from-rose-500/10 to-rose-500/5 text-rose-600' },
            ].map((item) => (
              <li key={item.icon} className="flex gap-4 group cursor-default transform transition-transform duration-300 hover:translate-x-2">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${item.grad} border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="transition-transform duration-300 group-hover:translate-x-1">
                  <h4 className="text-[14px] font-extrabold text-slate-800 leading-tight mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Interactive tilt card (now on the right) */}
        <motion.div 
          ref={containerRef} 
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          onMouseEnter={handleCardMouseEnter}
          className="lg:col-span-6 relative h-[520px] flex items-center justify-center perspective-1000 cursor-pointer" 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} 
          viewport={{ once: true, margin: '-80px' }} 
        >
          {/* Glassmorphic EHR mockup container */}
          <div 
            ref={cardRef} 
            className="relative bg-white border border-slate-300/40 rounded-3xl w-full max-w-[440px] h-[480px] shadow-[0_8px_24px_rgba(0,40,36,0.08),0_32px_64px_rgba(0,40,36,0.12),0_0_0_1px_rgba(0,78,71,0.04)] flex flex-col overflow-hidden transition-all duration-300"
            style={{ backgroundColor: '#ffffff' }}
          >
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-200/30 flex justify-between items-start" style={{ backgroundColor: '#f8fafc' }}>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
                    Patient EHR File
                  </p>
                  <p className="font-extrabold text-[18px] text-slate-900">Maria Santos</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">+63 917 123 4567</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-extrabold uppercase tracking-wider rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Dynamic Tabs */}
              <div className="flex border-b border-slate-200/30 p-1" style={{ backgroundColor: '#f1f5f9' }}>
                {[
                  { id: 'profile', label: 'EHR Profile', icon: 'person' },
                  { id: 'charting', label: 'Tooth Chart', icon: 'dentistry' },
                  { id: 'prescriptions', label: 'Digital Rx', icon: 'medication' }
                ].map((tab) => (
                  <button 
                    key={tab.id} 
                    onClick={(e) => { e.stopPropagation(); setMockupTab(tab.id); }}
                    className={`flex-1 py-3 text-center text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                      mockupTab === tab.id 
                        ? 'bg-primary text-white shadow-sm font-black' 
                        : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: mockupTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Body */}
              <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
                {mockupTab === 'profile' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {[
                      { l: 'Last Visit', v: 'June 10, 2026', icon: 'history' },
                      { l: 'Treatment', v: 'Dental Cleaning · Tooth #14', icon: 'medical_services' },
                      { l: 'Diagnosis', v: 'Gingivitis — mild', icon: 'healing' },
                      { l: 'Prescription', v: 'Amoxicillin 500mg · 3×/day', icon: 'pill' },
                      { l: 'Next Booking', v: 'June 20 · 9:00 AM', hi: true, icon: 'event' },
                    ].map(({ l, v, hi, icon }) => (
                      <div key={l} className="flex justify-between items-center pb-3 border-b border-slate-200/40 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                          <span className="text-[12px] text-slate-600 font-semibold">{l}</span>
                        </div>
                        <span className={`font-extrabold text-[12px] text-right max-w-[55%] ${hi ? 'text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20' : 'text-slate-900'}`}>{v}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {mockupTab === 'charting' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center h-full justify-center text-center"
                  >
                    {/* Interactive Tooth Visual Chart Mockup */}
                    <div className="flex items-center justify-center gap-3.5 mb-6">
                      {[11, 12, 13, 14, 15].map((t) => (
                    <div 
                      key={t}
                      onClick={(e) => { e.stopPropagation(); setSelectedTooth(t); }}
                      className={`w-12 h-16 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all relative cursor-pointer ${
                        selectedTooth === t 
                          ? 'border-primary bg-primary/20 scale-110 shadow-sm'
                          : t === 14 
                            ? 'border-error/45 bg-error/10 hover:border-error' 
                            : 'border-slate-300/40 hover:border-primary/50 text-slate-700'
                      }`}
                      style={selectedTooth !== t && t !== 14 ? { backgroundColor: '#f8fafc' } : {}}
                    >
                          <span className="text-[8px] font-black text-on-surface-variant dark:text-slate-600">{t}</span>
                          <span className={`material-symbols-outlined text-[18px] ${t === 14 ? 'text-error animate-pulse' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
                          {t === 14 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-200/50 w-full text-left" style={{ backgroundColor: '#f8fafc' }}>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1">Tooth Condition</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] font-black text-slate-900">Tooth #{selectedTooth}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          selectedTooth === 14 
                            ? 'bg-error/20 text-red-400 border border-error/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {selectedTooth === 14 ? 'Decayed (Suggested Crown)' : 'Healthy / Normal'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 font-medium">
                        {selectedTooth === 14 
                          ? 'Root canal therapy suggested prior to tooth preparation for dental crown.' 
                          : 'No dental caries detected. Excellent oral hygiene maintained.'
                        }
                      </p>
                    </div>
                  </motion.div>
                )}

                {mockupTab === 'prescriptions' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-2 border-dashed border-slate-300/40 rounded-2xl p-5 h-full flex flex-col justify-between"
                    style={{ backgroundColor: '#f8fafc' }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-serif italic font-black text-3xl text-primary dark:text-teal-300 leading-none">Rx</span>
                        <div className="text-right">
                          <p className="text-[9px] text-primary uppercase font-semibold">Happy Smiles Dental</p>
                          <p className="text-[8px] text-slate-500">PRC License #009874</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[12px] font-extrabold text-slate-900">Amoxicillin 500mg (Cap)</p>
                          <p className="text-[10px] text-slate-600 font-medium">Qty: 21 capsules • Sig: Take 1 cap every 8 hours for 7 days</p>
                        </div>
                        <div className="w-full h-px bg-outline-variant/30 dark:bg-slate-300/40" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[12px] font-extrabold text-slate-900">Mefenamic Acid 500mg (Tab)</p>
                          <p className="text-[10px] text-slate-600 font-medium">Qty: 10 tablets • Sig: Take 1 tab every 6 hours as needed for pain</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200/50 pt-3 mt-4">
                      <div>
                        <p className="text-[8px] text-slate-500 font-bold">Date Issued</p>
                        <p className="text-[10px] font-black text-slate-900">June 10, 2026</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif italic text-[11px] text-primary font-bold">Dr. Ana Reyes, DMD</p>
                        <p className="text-[8px] text-slate-500">Signature Authenticated</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
          </div>
        </motion.div>
      </div>
      </Container>
    </Section>
  );
}
