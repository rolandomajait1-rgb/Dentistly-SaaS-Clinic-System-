// DesignSystemConfig - Single source of truth for all design tokens

export const colors = {
  primary: {
    base: '#004E47',
    light: '#14b8a6',
    container: '#7dd3c0',
    onPrimary: '#ffffff',
  },
  error: {
    base: '#ba1a1a',
    light: '#f43f5e',
  },
  emerald: '#10b981',
  indigo: '#6366f1',
  amber: '#f59e0b',
  // Warm accent palette for visual variety
  coral: '#f97066',
  gold: '#e8a830',
  peach: '#fbbf94',
  warmGray: '#f5f0eb',
  
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  gradients: {
    lightSection: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
    // Warm cream-white for sections needing warmth (PainPoints, UseCases)
    warmSection: 'linear-gradient(to bottom, #ffffff 0%, #faf8f5 100%)',
    // Cool slate-white for clinical precision feel (PatientRecord)
    coolSection: 'linear-gradient(to bottom, #ffffff 0%, #f3f5f8 100%)',
    // Neutral clean white-to-gray for dense content (Modules)
    neutralSection: 'linear-gradient(to bottom, #ffffff 0%, #f5f7fa 100%)',
    // Rich deep teal-to-black for premium dark sections
    richSection: 'linear-gradient(135deg, #050e0c 0%, #091b18 50%, #050e0c 100%)',
    textPrimary: 'linear-gradient(90deg, #004E47 0%, #14b8a6 100%)',
    textEmphasis: 'linear-gradient(90deg, #004E47 0%, #10b981 50%, #14b8a6 100%)',
  },
};

export const typography = {
  headings: {
    h1: {
      fontSize: { mobile: '40px', sm: '48px', md: '58px', lg: '64px' },
      fontWeight: 900,
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: { mobile: '30px', md: '48px' },
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: { mobile: '24px', md: '36px' },
      fontWeight: 800,
      lineHeight: 1.2,
    },
  },
  body: {
    large: { fontSize: '17px', fontWeight: 500, lineHeight: 1.6 },
    medium: { fontSize: '15px', fontWeight: 500, lineHeight: 1.5 },
    small: { fontSize: '13px', fontWeight: 500, lineHeight: 1.5 },
  },
  badge: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
};

export const spacing = {
  section: {
    y: { mobile: '4rem', desktop: '5rem' },
    x: '1.5rem',
  },
  container: {
    maxWidth: '1280px',
    padding: '1.5rem',
  },
  gaps: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
};

export const borderRadius = {
  card: { small: '1rem', medium: '1.5rem', large: '2rem' },
  badge: '9999px',
  button: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 32px 64px rgba(0, 40, 36, 0.12)',
  hover: {
    card: '0 16px 32px rgba(0, 78, 71, 0.15)',
    button: '0 12px 24px rgba(0, 78, 71, 0.22)',
  },
};

export const animations = {
  easing: {
    standard: [0.16, 1, 0.3, 1],
    easeInOut: 'easeInOut',
  },
  duration: {
    fast: 0.2,
    medium: 0.4,
    slow: 0.6,
    verySlow: 1,
  },
  viewport: {
    once: true,
    margin: '-80px',
  },
  hover: {
    scale: 1.03,
    translateY: -2,
  },
};
