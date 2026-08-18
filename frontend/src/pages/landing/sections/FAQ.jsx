import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Heading, FadeIn } from '../../../design-system';
import { FAQS, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../constants.jsx';
import UnifiedBackground from './UnifiedBackground.jsx';

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <Section id="faq" variant="white" className="border-t border-outline-variant/20">
      {/* Unified Background System */}
      <UnifiedBackground />
      <Container className="max-w-[760px]">
        <FadeIn className="text-center mb-16">
          <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
          <p className="font-body-lg text-[18px] text-on-surface-variant">Answers to the most common questions from dental clinic owners.</p>
        </FadeIn>

        <motion.div 
          className="space-y-3" 
          variants={STAGGER_CONTAINER_VARIANTS} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-60px' }}
        >
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div 
                key={i} 
                variants={STAGGER_ITEM_VARIANTS} 
                className={`bg-surface-container-lowest border overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'faq-item-open border-primary/50 border-l-4 border-l-primary rounded-2xl' 
                    : 'rounded-2xl border-outline-variant/50 hover:border-primary/30'
                }`}
              >
                <button 
                  className="w-full flex justify-between items-center px-6 py-5 text-left cursor-pointer group" 
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <span className="font-bold text-on-background text-[14px] leading-snug pr-8 group-hover:text-primary transition-colors">
                    {faq.q}
                  </span>
                  <span 
                    className={`material-symbols-outlined text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    style={{ fontSize: '20px' }}
                  >
                    expand_more
                  </span>
                </button>

                <div className={`faq-collapse ${isOpen ? 'open' : ''}`}>
                  <div className="faq-collapse-inner">
                    <div className="px-6 pb-5 text-on-surface-variant text-[14px] leading-relaxed border-t border-outline-variant/20 pt-4">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </Section>
  );
}
