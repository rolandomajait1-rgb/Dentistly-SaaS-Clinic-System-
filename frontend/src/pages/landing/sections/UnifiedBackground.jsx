import { motion } from 'framer-motion';
import assets from '../../../assets';

/**
 * UnifiedBackground - Consistent light and dark background for all landing page sections
 * Features: Base gradient, cover image, dot pattern, animated orbs, corner accent
 * Supports both light and dark mode variants
 */
export default function UnifiedBackground({ className = '' }) {
  return (
    <>
      <div 
        className={`absolute inset-0 -z-30 bg-linear-to-br from-[#ffffff] via-[#f0f7ff] to-[#e6f0fa] ${className}`} 
      />
      
      {/* Layer 2: AI-Generated Hero photo with mask */}
      <div
        className="absolute inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage: `url(${assets.bgHeroSection})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          mixBlendMode: 'luminosity',
        }}
      />
      
      {/* Layer 3: Mesh dot pattern */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-[0.06]" />
      
      {/* Layer 4: Large ambient glow orbs - LIGHT MODE ONLY */}
      <motion.div
        className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full pointer-events-none -z-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(0,78,71,0.18) 0%, rgba(20,184,166,0.10) 40%, transparent 70%)'
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)'
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)'
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      
      {/* Layer 5: Soft top-right corner accent - LIGHT MODE ONLY */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent -z-10 rounded-bl-[180px]" />
    </>
  );
}
