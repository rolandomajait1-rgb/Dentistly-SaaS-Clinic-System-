// MIGRATED TO DESIGN SYSTEM
import { Section, Container, FadeIn } from '../../../design-system';
import { INTEGRATIONS, getIntegrationTheme } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function Integrations() {
  return (
    <Section id="integrations" variant="default" className="border-y border-slate-200/30" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      {/* Unified Background System */}
      <UnifiedBackground />
      <FadeIn>
        <Container>
          <div className="flex items-center gap-8">
            <p className="text-slate-600 text-[11px] uppercase mr-4 whitespace-nowrap shrink-0 tracking-widest font-bold">
              Works With
            </p>
            <div 
              className="relative flex-1 overflow-hidden" 
              style={{ 
                maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', 
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' 
              }}
            >
              <div className="flex gap-8 drifting-animation" style={{ width: 'max-content' }}>
                {[...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS].map((item, i) => (
                  <div
                    key={i}
                    className={`logo-ticker-item ${getIntegrationTheme(item.name)}`}
                    style={{ '--ticker-glow': item.glow || 'rgba(0,78,71,0.12)' }}
                  >
                    {item.icon}
                    <span className="font-headline-sm text-slate-600 font-bold text-[14px] whitespace-nowrap opacity-80">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </FadeIn>
    </Section>
  );
}
