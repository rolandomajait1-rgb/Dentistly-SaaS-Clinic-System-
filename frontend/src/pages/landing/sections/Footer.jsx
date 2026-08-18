import assets from '../../../assets';

export default function Footer({ onLogin }) {
  return (
    <footer className="relative bg-[#041411] text-slate-300 select-none overflow-hidden">
      {/* Subtle glowing orbs for premium visual depth */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#14b8a6]/4 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-10 w-[200px] h-[200px] bg-[#14b8a6]/3 blur-[100px] rounded-full pointer-events-none" />

      {/* Main footer content */}
      <div className="max-w-[1280px] mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand Identity Block */}
          <div className="col-span-2 md:col-span-4">
            <button 
              onClick={onLogin} 
              className="flex items-center cursor-pointer mb-3"
            >
              <img src={assets.pivodentLogo} alt="Pivodent Logo" className="h-10 md:h-12 w-auto object-contain" />
            </button>
            <p className="text-primary-fixed-dim text-[10.5px] uppercase tracking-widest font-black mb-4">Dental Practice Management SaaS</p>
            <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px]">
              The all-in-one platform for modern dental clinics in the Philippines.
            </p>
            
            {/* Rating in footer */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="text-amber-400 text-[13px]">★</span>
                ))}
              </div>
              <span className="text-slate-400 text-[11.5px] font-bold">4.9/5 from 500+ clinics</span>
            </div>
            <p className="text-slate-500 text-[11px] mt-6">© 2026 Pivodent. All rights reserved.</p>
          </div>

          {/* Links Columns */}
          {[
            { title: 'Platform',  links: [['#features', 'Features Overview'], ['#modules', "What's Included"], ['#integrations', 'Integrations'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']] },
            { title: 'Modules',   links: [['#', 'AI Facebook Chatbot'], ['#', 'EHR Records'], ['#', 'Tooth Charting'], ['#', 'Prescriptions'], ['#', 'Queue Manager']] },
            { title: 'Resources', links: [['#', 'Help Center'], ['#', 'Security Portal'], ['#', 'System Status'], ['#', 'API Documentation'], ['#', 'PH Support']] },
            { title: 'Company',   links: [['#', 'About Us'], ['#', 'Careers'], ['#', 'Contact Support'], ['#', 'Contact Sales']] },
          ].map(col => (
            <div key={col.title} className="col-span-1 md:col-span-2 flex flex-col gap-3.5">
              <h4 className="text-primary-fixed-dim text-[11px] font-extrabold uppercase tracking-widest mb-1">{col.title}</h4>
              {col.links.map(([href, label]) => (
                <a 
                  key={label} 
                  href={href} 
                  className="text-slate-400 hover:text-white hover:translate-x-1 text-[13px] transition-all duration-300 w-fit block"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#0c352e] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-slate-400">
            {['Privacy Policy', 'Terms of Service', 'Data Security', 'Cookie Policy'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-200">{l}</a>
            ))}
          </div>
          <p className="text-slate-500 text-[11px]">Made with ❤️ for dental clinics in the Philippines 🇵🇭</p>
        </div>
      </div>
    </footer>
  );
}
