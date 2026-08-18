import { useState, useEffect } from 'react';
import assets from '../../../assets';

const NAV_LINKS = [
  ['#features',     'Features'],
  ['#modules',      "What's Included"],
  ['#integrations', 'Integrations'],
  ['#pricing',      'Pricing'],
  ['#faq',          'FAQ'],
];

export default function Navbar({ onLogin, onGetStarted }) {
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1280px] z-50 transition-all duration-300 backdrop-blur-md border ${
      mobileNavOpen ? 'rounded-2xl' : 'rounded-full'
    } ${
      scrolled
        ? 'bg-surface-container-lowest/90 shadow-[0_10px_30px_rgba(0,78,71,0.1)] border-outline-variant/30'
        : 'bg-surface-container-lowest/70 shadow-[0_8px_32px_rgba(0,78,71,0.05)] border-outline-variant/20'
    }`}>

      {/* Desktop Row */}
      <div className="flex items-center justify-between px-6 py-3">

        {/* Logo */}
        <div className="shrink-0">
          <img
            src={assets.pivodentLogo}
            alt="Pivodent"
            className="h-14 w-auto object-contain block"
          />
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8 font-data-tabular text-[13px] tracking-wide uppercase font-semibold">
          {NAV_LINKS.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="text-on-surface-variant hover:text-primary transition-colors duration-200 whitespace-nowrap"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLogin}
            className="hidden md:block font-data-tabular text-[13px] font-bold uppercase tracking-wide text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={onGetStarted || onLogin}
            className="hidden md:flex items-center gap-2 bg-primary text-on-primary font-data-tabular text-[13px] font-bold uppercase tracking-wide px-6 py-2.5 rounded-full hover:bg-primary-container transition-all hover:shadow-[0_8px_20px_rgba(0,78,71,0.2)] cursor-pointer"
          >
            Get Started Free
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-full text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-outline-variant/20 px-6 pb-6 pt-4 flex flex-col gap-3">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="font-data-tabular text-[13px] font-bold uppercase tracking-wide text-on-surface-variant py-2 border-b border-outline-variant/20"
            >
              {label}
            </a>
          ))}
          <button
            onClick={() => { setMobileNavOpen(false); (onGetStarted || onLogin)?.(); }}
            className="mt-2 bg-primary text-on-primary font-data-tabular text-[13px] font-bold uppercase tracking-wide px-6 py-3 rounded-full text-center cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}
