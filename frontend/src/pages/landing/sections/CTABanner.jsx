import { FadeIn } from '../../../design-system';
import assets from '../../../assets';

export default function CTABanner({ onGetStarted, onLogin }) {
  return (
    <section id="cta-banner" className="pt-12 md:pt-16 pb-0 relative overflow-hidden w-full">
      <div className="w-full mx-auto px-0">
        <FadeIn className="w-full">
          {/* Full-width Stretched Banner Card Container */}
          <div className="relative w-full rounded-t-[32px] md:rounded-t-[48px] rounded-b-none overflow-hidden border-t border-x-0 border-b-0 border-slate-200/80 shadow-[0_-15px_50px_rgba(0,0,0,0.04)] bg-linear-to-b from-[#eaf4f7] via-[#f1f7f9] to-[#ffffff] min-h-[500px] md:min-h-[580px] flex flex-col justify-between items-center text-center px-6 pt-14 md:pt-20 pb-0 mb-0">
            
            {/* Background Local Clinic Image Stretched Full Width */}
            <img 
              src={assets.ctaBannerBg} 
              alt="Dental Clinic Interior" 
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            />
            {/* Subtle Lighting Overlay for optimal text contrast */}
            <div className="absolute inset-0 bg-linear-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

            {/* Top & Middle Content */}
            <div className="relative z-10 max-w-2xl mx-auto pt-2 space-y-4">
              <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-black text-slate-950 tracking-tight leading-[1.12]">
                Your Clinic Deserves
                <span className="block mt-1 font-black">
                  <span className="text-[#004E47]">a Better </span>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00A86B] via-[#00C48C] to-[#00D28A]">
                    Solution
                  </span>
                </span>
              </h2>

              <p className="text-slate-600 text-[15px] md:text-[17px] font-medium max-w-lg mx-auto leading-relaxed pt-1">
                Streamline your clinic operations and patient bookings today.
              </p>

              <div className="pt-4 md:pt-6">
                <button
                  onClick={onGetStarted || onLogin}
                  className="inline-flex items-center gap-2.5 bg-[#004E47] hover:bg-[#003831] text-white font-bold text-[14.5px] md:text-[15.5px] px-8 py-3.5 rounded-full shadow-[0_10px_25px_rgba(0,78,71,0.25)] hover:shadow-[0_15px_35px_rgba(0,78,71,0.35)] hover:scale-103 active:scale-98 transition-all duration-300 cursor-pointer group"
                >
                  <span>Get Started For Free</span>
                  <svg 
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Giant Bottom Typography Watermark ("PivoDent") - High Contrast & Prominent */}
            <div className="relative z-10 w-full mt-10 md:mt-14 pb-8 sm:pb-10 md:pb-14 pointer-events-none select-none text-center">
              <span className="block text-[85px] sm:text-[140px] md:text-[190px] lg:text-[225px] font-black tracking-tight leading-[0.8] bg-linear-to-b from-[#0f172a] via-[#1e293b] to-[#64748b] bg-clip-text text-transparent drop-shadow-md">
                PivoDent
              </span>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
}

