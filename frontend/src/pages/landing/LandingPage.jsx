import { useEffect } from 'react';

// Section Components
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import SocialProof from './sections/SocialProof';
import Integrations from './sections/Integrations';
import PainPoints from './sections/PainPoints';
import ChatbotDemo from './sections/ChatbotDemo';
import EmailAutomation from './sections/EmailAutomation';
import PatientRecord from './sections/PatientRecord';
import Modules from './sections/Modules';
import Stats from './sections/Stats';
import Security from './sections/Security';
import UseCases from './sections/UseCases';
import Testimonials from './sections/Testimonials';
import Pricing from './sections/Pricing';
import FAQ from './sections/FAQ';
import CTABanner from './sections/CTABanner';
import TrustBadges from './sections/TrustBadges';
import Footer from './sections/Footer';
import LiveNotifications from './sections/LiveNotifications';

export default function LandingPage(props) {
  /* Mouse glow with momentum dampening lag */
  useEffect(() => {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let tid;
    
    const handleMouseMove = e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = '1';
      clearTimeout(tid);
      tid = setTimeout(() => { glow.style.opacity = '0.5'; }, 1000);
    };
    
    let animId;
    const updateGlow = () => {
      const dx = mouseX - glowX;
      const dy = mouseY - glowY;
      glowX += dx * 0.08;
      glowY += dy * 0.08;
      
      glow.style.left = `${glowX}px`;
      glow.style.top  = `${glowY}px`;
      animId = requestAnimationFrame(updateGlow);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateGlow);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      clearTimeout(tid);
    };
  }, []);

  return (
    <div className="bg-linear-to-br from-[#ffffff] via-[#f0f7ff] to-[#e6f0fa] text-on-background antialiased min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* Mouse Glow Overlay */}
      <div className="mouse-glow" id="mouseGlow" />

      {/* Modular sections */}
      <Navbar {...props} />
      <Hero {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <SocialProof {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Integrations {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <PainPoints {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <ChatbotDemo {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <EmailAutomation {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <PatientRecord {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Modules {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Stats {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Security {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <UseCases {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Testimonials {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <Pricing {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <FAQ {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <CTABanner {...props} />
      <hr className="border-none h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-5xl" />
      <TrustBadges {...props} />
      <Footer {...props} />
      
      {/* Floating social proof notifications */}
      <LiveNotifications {...props} />
    </div>
  );
}
