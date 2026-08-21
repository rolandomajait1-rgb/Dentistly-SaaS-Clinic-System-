import { Section, Container, Badge, Heading, FadeIn } from '../../../design-system';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function Security() {
  return (
    <Section id="security" variant="white" className="py-20 md:py-28 relative overflow-hidden">
      {/* Unified Background System */}
      <UnifiedBackground />

      <Container>
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <Badge variant="primary" className="mb-6">
            <span className="material-symbols-outlined text-[14px]">lock</span> Enterprise-Grade Security
          </Badge>
          <Heading level={2} className="mb-6 text-slate-900 leading-tight">
            Your Patient Data is<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-800 to-teal-600">Fort Knox Secure.</span>
          </Heading>
          <p className="text-[15.5px] text-slate-650 max-w-2xl mx-auto leading-relaxed font-medium">
            Healthcare data protection is non-negotiable. Pivodent is built with end-to-end encryption, multi-region database backups, and strict compliance alignment.
          </p>
        </FadeIn>

        {/* 4-Card Bento Grid - Exactly Replicating Reference Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1100px] mx-auto px-4">
          
          {/* Card 1: Top Left - Wide Card (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-slate-100/90 rounded-[28px] p-8 flex flex-col justify-between min-h-[340px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,78,71,0.05)] transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              {/* Icon Container */}
              <div className="w-11 h-11 rounded-[14px] bg-[#e6f4f1] text-[#0d9488] flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
              </div>
              {/* Capsule Badge */}
              <span className="bg-[#e6f4f1] text-[#0d9488] px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                SECURE LAYER
              </span>
            </div>

            <div className="my-6">
              <h3 className="text-[22px] font-black text-slate-800 tracking-tight leading-tight font-display mb-2.5">
                AES-256 Data Protection
              </h3>
              <p className="text-slate-500 text-[13.5px] font-medium leading-relaxed">
                Military-grade data protection standards. All database volumes, clinical documentation, and patient EHR records are fully encrypted at rest using industry-standard AES-256 keys. Passwords are hashed using zero-knowledge Argon2id.
              </p>
            </div>

            <div className="flex items-center gap-12 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[20px] font-black text-slate-800 leading-none">256-bit</p>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1.5">BANK-LEVEL ENCRYPTION</p>
              </div>
              <div>
                <p className="text-[20px] font-black text-slate-800 leading-none">Argon2id</p>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1.5">PASSWORD HASHING</p>
              </div>
            </div>
          </div>

          {/* Card 2: Top Right - Narrow Card (4 Columns, Dark Green) */}
          <div className="lg:col-span-4 bg-[#0b241e] text-white rounded-[28px] p-8 flex flex-col justify-between min-h-[340px] shadow-sm hover:shadow-[0_20px_50px_rgba(11,36,30,0.15)] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-primary-fixed-dim tracking-widest uppercase">
                COMPLIANCE TRUST
              </span>
              <p className="text-[56px] font-black text-white leading-none my-4 tracking-tight font-display">
                100%
              </p>
              <p className="text-primary-fixed/70 text-[13px] leading-relaxed font-medium">
                Adherence to Philippine Data Privacy Act of 2012 (DPA) and global HIPAA frameworks with zero third-party data sharing.
              </p>
            </div>

            {/* Overlapping Circle Avatars */}
            <div className="flex items-center -space-x-3 pt-6 select-none">
              <div className="w-8 h-8 rounded-full border-2 border-[#0b241e] bg-primary-fixed text-[#0b241e] flex items-center justify-center font-bold text-[9px]">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#0b241e] bg-[#0d9488] text-white flex items-center justify-center font-bold text-[9px]">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#0b241e] bg-white text-[#0b241e] flex items-center justify-center font-bold text-[9px]">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#0b241e] bg-[#0d5947] text-white flex items-center justify-center font-bold text-[8px] uppercase tracking-tighter">
                +100
              </div>
            </div>
          </div>

          {/* Card 3: Bottom Left - Medium Card (6 Columns) */}
          <div className="lg:col-span-6 bg-white border border-slate-100/90 rounded-[28px] p-8 flex flex-col justify-between min-h-[300px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,78,71,0.05)] transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-[14px] bg-[#e6f4f1] text-[#0d9488] flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_lock
                </span>
              </div>
              <span className="bg-[#e6f4f1] text-[#0d9488] px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                TENANT PRIVACY
              </span>
            </div>

            <div className="my-6">
              <h3 className="text-[20px] font-black text-slate-800 tracking-tight leading-tight font-display mb-2.5">
                Isolated Clinic Data Protection
              </h3>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
                Strict multi-tenant segregation ensures your clinic's patient records, financial transactions, and medical notes are 100% isolated and never accessible by other clinics.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="bg-slate-50/90 border border-slate-100 p-3 rounded-2xl flex-1 text-left">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">DATA SEPARATION</p>
                <p className="text-[14px] font-black text-slate-800 mt-0.5 leading-none">100% Isolated</p>
              </div>
              <div className="bg-slate-50/90 border border-slate-100 p-3 rounded-2xl flex-1 text-left">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">CROSS-ACCESS</p>
                <p className="text-[14px] font-black text-emerald-600 mt-0.5 leading-none">Zero Bleed</p>
              </div>
            </div>
          </div>

          {/* Card 4: Bottom Right - Medium Card (6 Columns) */}
          <div className="lg:col-span-6 bg-white border border-slate-100/90 rounded-[28px] p-8 flex flex-col justify-between min-h-[300px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,78,71,0.05)] transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-[20px] font-black text-slate-800 tracking-tight leading-tight font-display">
                Smart Security Logs
              </h3>
              {/* Mini visual volume bars indicator */}
              <div className="flex items-end gap-1 h-5 select-none">
                <span className="w-1 h-2 bg-teal-500/20 rounded-full" />
                <span className="w-1 h-3 bg-teal-500/40 rounded-full" />
                <span className="w-1 h-5 bg-[#0d9488] rounded-full animate-pulse" />
                <span className="w-1 h-3 bg-teal-500/40 rounded-full" />
                <span className="w-1 h-1.5 bg-teal-500/20 rounded-full" />
              </div>
            </div>

            <div className="my-5">
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
                Continuous system telemetry, access audit trails, and automatic intrusion detection systems monitor and flag unauthorized access.
              </p>
            </div>

            {/* Metric boxes inside Card 4 */}
            <div className="flex items-center gap-3 w-full">
              <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-2xl flex-1">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">UPTIME SLA</p>
                <p className="text-[15px] font-black text-slate-800 mt-1 leading-none">99.9%</p>
              </div>
              <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-2xl flex-1">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">RESPONSE TIME</p>
                <p className="text-[15px] font-black text-slate-800 mt-1 leading-none">&lt;15m</p>
              </div>
            </div>
          </div>

        </div>

        {/* Security Disclosures */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 text-center max-w-2xl mx-auto px-4">
          <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
            <strong className="text-slate-800 font-bold">Your clinic, your data.</strong> We never sell patient information to third parties. All database instances are housed behind Virtual Private Clouds (VPC) with automated alerts. Need official documentation? Request our <a href="#" className="text-emerald-700 underline hover:no-underline font-bold">Security Whitepaper</a> or <a href="#" className="text-emerald-700 underline hover:no-underline font-bold">SOC 2 Audit Report</a>.
          </p>
        </div>
      </Container>
    </Section>
  );
}
