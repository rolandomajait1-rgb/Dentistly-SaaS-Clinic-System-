import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Badge, Heading } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function PatientRecord() {
  const [mockupTab, setMockupTab] = useState('profile');
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
              { icon: 'medical_services', title: 'Treatment & Procedure History', desc: 'Comprehensive log of completed dental procedures, clinician notes, and follow-up schedules.', grad: 'from-blue-500/10 to-blue-500/5 text-blue-600' },
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
                  { id: 'treatments', label: 'Treatments', icon: 'medical_services' },
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
                      { l: 'Treatment', v: 'Oral Prophylaxis & Cleaning', icon: 'medical_services' },
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

                {mockupTab === 'treatments' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    {[
                      { name: 'Comprehensive Oral Prophylaxis', date: 'June 10, 2026', status: 'Completed', cost: '₱1,500' },
                      { name: 'Composite Dental Restoration', date: 'March 15, 2026', status: 'Completed', cost: '₱2,200' },
                      { name: 'Diagnostic Oral Consultation', date: 'January 08, 2026', status: 'Completed', cost: '₱500' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl border border-slate-200/60 bg-slate-50/50 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[12.5px] font-bold text-slate-900">{item.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                            {item.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-medium">
                          <span>Date: {item.date}</span>
                          <span className="font-bold text-primary">{item.cost}</span>
                        </div>
                      </div>
                    ))}
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
