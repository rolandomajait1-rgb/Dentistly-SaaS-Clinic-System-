import assets from '../../../assets';

export default function Footer({ onLogin }) {
  const footerColumns = [
    {
      title: 'PLATFORM',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Integrations', href: '#integrations' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Updates', href: '#updates' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'SERVICES',
      links: [
        { label: 'Charting', href: '#modules' },
        { label: 'Scheduling', href: '#features' },
        { label: 'Billing & EHR', href: '#modules' },
        { label: 'Patient Portal', href: '#features' },
        { label: 'Analytics', href: '#modules' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: 'Blog', href: '#' },
        { label: 'Guides', href: '#' },
        { label: 'Help Center', href: '#' },
        { label: 'API Docs', href: '#' },
        { label: 'System Status', href: '#' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Partners', href: '#' },
        { label: 'Newsroom', href: '#' },
      ],
    },
    {
      title: 'DATA PRIVACY',
      links: [
        { label: 'Security', href: '#' },
        { label: 'Compliance', href: '#' },
        { label: 'DPA Notice', href: '#' },
        { label: 'Encryption', href: '#' },
        { label: 'Certificates', href: '#' },
      ],
    },
  ];

  const socialIcons = [
    { name: 'Facebook', icon: assets.footerFacebook, href: 'https://facebook.com', scale: 'scale-100' },
    { name: 'Gmail', icon: assets.footerGmail, href: 'mailto:contact@pivodent.ph', scale: 'scale-100' },
    { name: 'Messenger', icon: assets.footerMessenger, href: 'https://m.me', scale: 'scale-100' },
    { name: 'Meta', icon: assets.footerMeta, href: 'https://meta.com', scale: 'scale-100' },
    { name: 'Social', icon: assets.footerSocialGrid, href: '#', scale: 'scale-[1.28]' },
  ];

  return (
    <footer className="relative bg-[#041411] text-slate-300 select-none overflow-hidden pt-16 md:pt-20 pb-10">
      {/* Subtle glowing orbs for premium visual depth */}
      <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-[#14b8a6]/4 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-10 w-[280px] h-[280px] bg-[#14b8a6]/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Main footer content */}
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8 pb-14">
          {/* Brand Identity Block (4 cols on desktop) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 pr-0 lg:pr-10">
            <button 
              onClick={onLogin} 
              className="flex items-center cursor-pointer mb-4 group"
            >
              <img 
                src={assets.pivodentLogoWhite || assets.pivodentLogo} 
                alt="Pivodent Logo" 
                className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-103 drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]" 
              />
            </button>
            <p className="text-[#00D28A] text-[10.5px] uppercase tracking-widest font-black mb-3">
              Dental Practice Management SaaS
            </p>
            <p className="text-slate-400 text-[13px] leading-relaxed max-w-[290px]">
              The all-in-one platform for modern dental clinics in the Philippines
            </p>
            
            {/* Rating in footer */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex gap-0.5 text-amber-400 text-[13px]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-slate-400 text-[12px] font-medium">4.9/5 from 500+ clinics</span>
            </div>
            
            <p className="text-slate-500 text-[11.5px] mt-6">
              © 2026 All rights reserved
            </p>
          </div>

          {/* 5 Link Columns (Remaining 8 cols on desktop: ~1.6 cols each) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4 lg:gap-6">
            {footerColumns.map(col => (
              <div key={col.title} className="flex flex-col gap-3">
                <h4 className="text-white text-[12px] font-extrabold uppercase tracking-wider mb-2">
                  {col.title}
                </h4>
                {col.links.map(link => (
                  <a 
                    key={link.label} 
                    href={link.href} 
                    className="text-slate-400 hover:text-white text-[13px] transition-colors duration-200 w-fit block"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar divider */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-2.5 text-[12px] text-slate-400">
            {['Privacy Policy', 'Terms of Service', 'Data Security', 'Cookies Policy'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-200">{l}</a>
            ))}
          </div>

          {/* Social Icons Row - Uniform Equal Sizing */}
          <div className="flex items-center gap-3">
            {socialIcons.map(item => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 hover:scale-110 hover:opacity-90 active:scale-95 shrink-0"
              >
                <img 
                  src={item.icon} 
                  alt={item.name} 
                  className={`w-full h-full object-contain ${item.scale || 'scale-100'}`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
