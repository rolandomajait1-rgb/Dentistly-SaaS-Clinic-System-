import assets from '../../assets';

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const STAGGER_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const HERO_SLIDES = [
  { src: assets.heroDashboard,    label: 'Dashboard Overview' },
  { src: assets.heroAppointments, label: 'Appointment Schedule' },
  { src: assets.heroPatients,     label: 'Patient Information' },
  { src: assets.heroReports,      label: 'Reports & Analytics' },
  { src: assets.heroStaffUsers,   label: 'Staff & Users' },
];

export const INTEGRATIONS = [
  {
    name: 'GCash',
    glow: 'rgba(0,92,255,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#005CFF"/>
        <path d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12H15C15 13.657 13.657 15 12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9C13.657 9 15 10.343 15 12H18C18 8.686 15.314 6 12 6Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Maya',
    glow: 'rgba(87,0,123,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#57007B"/>
        <path d="M7 16V8H9.5L12 11.5L14.5 8H17V16H15.2V10.5L12.5 14H11.5L8.8 10.5V16H7Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Semaphore',
    glow: 'rgba(0,210,138,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#00D28A"/>
        <path d="M8 8H16V10H8V8ZM8 12H16V14H8V12ZM8 16H13V18H8V16Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Messenger',
    glow: 'rgba(160,51,255,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.14 2 11.25C2 13.98 3.28 16.38 5.3 18.01V22L9.12 19.9C10.04 20.16 11.01 20.3 12 20.3C17.52 20.3 22 16.16 22 11.05C22 5.94 17.52 2 12 2ZM13.06 13.94L10.56 11.25L5.69 13.94L10.94 8.36L13.44 11.05L18.31 8.36L13.06 13.94Z" fill="url(#messenger-grad)"/>
        <defs>
          <linearGradient id="messenger-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#09f" />
            <stop offset="60%" stopColor="#a033ff" />
            <stop offset="100%" stopColor="#ff5252" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Google Calendar',
    glow: 'rgba(26,115,232,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="17" rx="2" fill="#1A73E8"/>
        <path d="M3 9H21V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V9Z" fill="white"/>
        <path d="M7 2V5M17 2V5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <text x="12" y="17" fill="#1A73E8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">31</text>
      </svg>
    ),
  },
  {
    name: 'Twilio SMS',
    glow: 'rgba(242,47,70,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#F22F46"/>
        <circle cx="9" cy="9" r="2" fill="white"/>
        <circle cx="15" cy="9" r="2" fill="white"/>
        <circle cx="9" cy="15" r="2" fill="white"/>
        <circle cx="15" cy="15" r="2" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Stripe Payments',
    glow: 'rgba(99,91,255,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#635BFF"/>
        <path d="M11.8 10.3C11.8 9.7 12.3 9.4 13.2 9.4C14.4 9.4 15.4 9.8 16.1 10.2V8C15.2 7.7 14.2 7.5 13.1 7.5C10.2 7.5 8.3 9.1 8.3 11.7C8.3 15.6 13.6 14.8 13.6 16.6C13.6 17.3 12.9 17.7 12 17.7C10.7 17.7 9.5 17.1 8.7 16.6V18.9C9.7 19.3 10.9 19.6 12.1 19.6C15.1 19.6 17.2 18.1 17.2 15.3C17.2 11.2 11.8 12.1 11.8 10.3Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'SendGrid Email',
    glow: 'rgba(0,179,227,0.20)',
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#00B3E3"/>
        <path d="M6 8L12 12L18 8V16H6V8Z" fill="white"/>
        <path d="M12 12L18 8H6L12 12Z" fill="#0092B8"/>
      </svg>
    ),
  }
];

export const PAIN_POINTS = [
  {
    before: { icon: 'phone_disabled',    text: 'Missed calls = missed patients. No after-hours booking possible.' },
    after:  { icon: 'smart_toy',         text: 'AI chatbot books patients 24/7, even at midnight — automatically.' },
  },
  {
    before: { icon: 'event_busy',        text: 'Paper logs, sticky notes, and manual double-bookings every day.' },
    after:  { icon: 'calendar_month',    text: 'Smart digital calendar with drag-and-drop and conflict prevention.' },
  },
  {
    before: { icon: 'folder_off',        text: 'Patient records buried in filing cabinets or scattered spreadsheets.' },
    after:  { icon: 'clinical_notes',    text: 'Full EHR, tooth chart & prescriptions — searchable in seconds.' },
  },
  {
    before: { icon: 'notifications_off', text: 'Forgotten reminders and last-minute no-shows cost real revenue.' },
    after:  { icon: 'sms',              text: 'Automated SMS & email reminders fired the moment you approve.' },
  },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: ' (Beta)',
    tagline: 'Perfect for solo practitioners.',
    features: [
      'Up to 100 patient records',
      'Appointment scheduling',
      'Queue manager',
      'Basic SMS reminders (Semaphore)',
      'Email confirmations',
      'Dashboard KPIs',
      'Services catalog',
      'In-app notification center',
      'Email support',
    ],
    cta: 'Get Started',
    highlight: false,
    badge: 'Free',
  },
  {
    name: 'Professional',
    price: 'Free',
    period: ' (Beta)',
    tagline: 'The complete clinic toolkit.',
    features: [
      'Unlimited patient records',
      '32-Tooth dentition charting',
      'AI Facebook Messenger chatbot (24/7)',
      'Google Calendar two-way sync',
      'Full SMS + Email automation',
      'Custom SMS & email templates',
      'Electronic Health Records (EHR)',
      'Digital prescription generator',
      'Multi-role access (Owner, Dentist, Staff)',
      'Priority support',
    ],
    cta: 'Get Started',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise Clinic',
    price: 'Free',
    period: ' (Beta)',
    tagline: 'Multi-dentist, multi-clinic power.',
    features: [
      'Everything in Professional',
      'Superadmin multi-clinic dashboard',
      'Custom chatbot message templates',
      'Custom SMTP server integration',
      'Advanced analytics & CSV exports',
      'Onboarding wizard for each clinic',
      'Dedicated account manager',
      '24/7 priority phone + chat support',
      'SLA uptime guarantee',
    ],
    cta: 'Get Started',
    highlight: false,
    badge: 'Enterprise',
  },
];

export const FAQS = [
  {
    q: 'Do I need technical knowledge to set up Pivodent?',
    a: 'No. The guided onboarding wizard walks you through everything — clinic profile, Facebook connection, SMS setup, and more. Most clinics are live in under 30 minutes.',
  },
  {
    q: 'Does the Facebook chatbot require a developer to set up?',
    a: 'No. The Settings panel has a built-in Facebook integration wizard. You just paste your Page ID, Access Token, and verify token — no code needed.',
  },
  {
    q: 'Is the SMS service compatible with Philippine networks?',
    a: 'Yes. We use Semaphore, a Philippine-based SMS gateway that supports all local networks (Globe, Smart, DITO) with local sender name support.',
  },
  {
    q: 'Is my patient data secure?',
    a: 'Absolutely. We are fully DPA (Data Privacy Act of 2012) and HIPAA compliant, with end-to-end encryption for all health records.',
  },
  {
    q: 'Can multiple dentists share one Pivodent account?',
    a: 'Yes. You can have as many team members as needed. The role system (Owner, Dentist, Staff) ensures each person sees only what is relevant to them.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data remains accessible for 30 days after cancellation. You can export all patient records at any time from the dashboard — no lock-in.',
  },
  {
    q: 'Can I use my own email server (SMTP)?',
    a: 'Yes. The Professional and Enterprise plans support custom SMTP configuration (host, port, TLS/SSL, username, password) so emails come from your own domain.',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Dr. Ana Reyes',
    role: 'Clinic Owner · Happy Smiles Dental, Makati',
    avatar: 'AR',
    avatarColor: 'from-teal-400 to-emerald-500',
    image: assets.docAnaReyes,
    rating: 5,
    quote: 'Before Pivodent, our front desk was drowning in missed calls and double-bookings. Within 2 weeks, our no-show rate dropped 30% and patients love the SMS reminders. Best investment we ever made for our clinic.',
    stat: '−30% No-Shows',
  },
  {
    name: 'Dr. Mark Villanueva',
    role: 'Dentist · Villanueva Dental Clinic, Quezon City',
    avatar: 'MV',
    avatarColor: 'from-blue-400 to-indigo-500',
    image: assets.docMarkVillanueva,
    rating: 5,
    quote: 'The Facebook chatbot books appointments while I sleep. I wake up to 5–10 new bookings every morning without lifting a finger. My staff now spends zero time answering booking messages.',
    stat: '+40% Bookings',
  },
  {
    name: 'Dr. Carla Santos',
    role: 'Clinic Director · BrightSmile Dental Group, Cebu',
    avatar: 'CS',
    avatarColor: 'from-rose-400 to-pink-500',
    image: assets.docCarlaSantos,
    rating: 5,
    quote: 'We manage 3 clinics from one dashboard now. The superadmin panel alone is worth the Enterprise price. Real-time KPIs for every branch — it is like having a full business intelligence tool built in.',
    stat: '3x Efficiency',
  },
  {
    name: 'Dra. Liza Mendoza',
    role: 'Pediatric Dentist · KidsFirst Dental, BGC',
    avatar: 'LM',
    avatarColor: 'from-amber-400 to-orange-500',
    image: assets.docLizaMendoza,
    rating: 5,
    quote: 'Pivodent replaced 3 separate apps we were paying for. Everything is in one place — charting, prescriptions, patient history. Setup took 20 minutes. Absolutely love it.',
    stat: '₱18k/mo Saved',
  },
];


// Helper functions
export const getIntegrationTheme = (name) => {
  switch (name) {
    case 'GCash': return 'hover:shadow-[0_8px_24px_rgba(0,92,255,0.18)] hover:border-[#005CFF]';
    case 'Maya': return 'hover:shadow-[0_8px_24px_rgba(87,0,123,0.18)] hover:border-[#57007B]';
    case 'Semaphore': return 'hover:shadow-[0_8px_24px_rgba(0,210,138,0.18)] hover:border-[#00D28A]';
    case 'Messenger': return 'hover:shadow-[0_8px_24px_rgba(160,51,255,0.18)] hover:border-[#a033ff]';
    case 'Google Calendar': return 'hover:shadow-[0_8px_24px_rgba(26,115,232,0.18)] hover:border-[#1A73E8]';
    case 'Twilio SMS': return 'hover:shadow-[0_8px_24px_rgba(242,47,70,0.18)] hover:border-[#F22F46]';
    case 'Stripe Payments': return 'hover:shadow-[0_8px_24px_rgba(99,91,255,0.18)] hover:border-[#635BFF]';
    case 'SendGrid Email': return 'hover:shadow-[0_8px_24px_rgba(0,179,227,0.18)] hover:border-[#00B3E3]';
    default: return 'hover:shadow-md hover:border-primary';
  }
};
