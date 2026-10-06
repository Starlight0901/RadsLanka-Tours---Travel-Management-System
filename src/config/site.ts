import logoSrc from '@/assets/logo.png'

/**
 * Central public-site chrome configuration.
 * Fill real contact values when they are supplied. Empty strings keep Figma placeholders.
 */
export const siteConfig = {
  name: 'RadsLanka Tours',
  logo: {
    src: logoSrc,
    alt: 'RadsLanka Tours',
  },
  tagline: 'Explore Sri Lanka with Local Experts',
  phone: '+94717537070',
  whatsapp: '+94717537070',
  email: 'radslankatours@gmail.com',
  address: '134/13, Lewis Place, Negombo',
  legalName: '',
  copyrightYear: null as number | null,
  placeholders: {
    phone: '[Your Contact Phone Number]',
    whatsapp: '[Your WhatsApp Number]',
    email: '[contact@yourdomain.com]',
    address: '[Business Address / City, Sri Lanka]',
    legalName: '[Company Legal Name]',
    year: '[Year]',
  },
  socialLinks: [
    { id: 'instagram', label: 'Instagram', href: '', icon: 'photo_camera' },
    { id: 'facebook', label: 'Facebook', href: '', icon: 'public' },
    { id: 'youtube', label: 'YouTube', href: '', icon: 'smart_display' },
    { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/94717537070', icon: 'chat' },
  ],
  trustBadge: {
    visible: false,
    label: '',
  },
  footer: {
    ctaTitle: 'Ready to experience the untamed beauty of Sri Lanka?',
    ctaBody:
      'Direct consultation with native specialists. Tailored routes, verified drivers, boutique sanctuaries.',
    ctaPrimary: 'Plan Your Sri Lankan Journey',
    ctaSecondary: 'WhatsApp Us',
    blurbDesktop:
      'Handcrafted expeditions, certified chauffeur-guides, and secluded boutique stays across the emerald landscapes of Sri Lanka.',
    blurbMobile: 'Curated journeys, bespoke itineraries, and thoughtful private travel across Sri Lanka.',
    connectBlurb: 'Travel stories, live expedition chronicles, and authentic highlights from across Ceylon.',
  },
  heroTitle: 'Discover the Beauty of Sri Lanka, Your Way',
  heroIntro:
    'Private tours and custom itineraries, planned with local knowledge and unhurried care.',
  shortDescription:
    'A small Sri Lankan travel studio helping visitors explore the island with flexible, personal itineraries.',
  developer: {
    label: 'WeGrow',
    url: '',
  },
  whyChooseUs: [
    {
      title: 'Personalized Travel Experiences',
      description: 'Every itinerary is shaped around how you like to travel, not a fixed group script.',
    },
    {
      title: 'Local Expertise',
      description: 'Routes, timing, and recommendations come from someone who lives and works in Sri Lanka.',
    },
    {
      title: 'Flexible Itineraries',
      description: 'Change the pace, swap a destination, or add a quiet afternoon when you need one.',
    },
    {
      title: 'Hassle-Free Planning',
      description: 'One person coordinates the journey so you are not juggling vendors and messages.',
    },
    {
      title: 'Friendly Support',
      description: 'Clear communication before you arrive, and a reachable contact while you travel.',
    },
  ],
} as const

export const siteFallback = siteConfig
