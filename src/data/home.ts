export const homeHero = {
  overline: 'Discover the',
  title: 'Beauty of Sri Lanka',
  subtitle: 'with RadsLanka Tours',
  intro:
    'We offer unforgettable travel experiences with comfortable vehicles, expert drivers, and customized tour packages.',
  primaryCta: 'Explore Tours',
  secondaryCta: 'Book Now',
  ratingHighlight: '4.98/5',
  ratingNote: '[Verified traveler rating copy]',
} as const

export const homeTrustItems = [
  {
    title: 'Experienced Local Drivers',
    detail: 'SLTDA-licensed chauffeur-guides',
    icon: 'badge',
  },
  {
    title: 'Comfortable Vehicles',
    detail: 'Private climate-controlled fleet',
    icon: 'directions_car',
  },
  {
    title: 'Custom Tour Packages',
    detail: '100% tailor-made itineraries',
    icon: 'map',
  },
  {
    title: 'Best Price Guarantee',
    detail: 'Direct-to-local transparent rates',
    icon: 'payments',
  },
  {
    title: '24/7 Customer Support',
    detail: 'Concierge by WhatsApp',
    icon: 'headset_mic',
  },
  {
    title: 'Safe and Reliable Services',
    detail: 'Inspected vehicles and trained drivers',
    icon: 'verified_user',
  },
] as const

export const homeTours = [
  {
    title: 'Royal Ceylon Heritage & Cultural Wonders',
    slug: 'royal-ceylon-heritage-cultural-wonders',
    description: '[Tour description from Figma]',
    duration: '8 Days / 7 Nights',
    imageAlt: 'Sigiriya Rock Fortress at Sunrise',
    routeLabel: 'Sigiriya & Cultural',
    tags: ['Cultural Triangle', 'Heritage', 'Temples'],
    priceLabel: '[Price]',
  },
  {
    title: 'Highland Mist to Southern Ocean',
    slug: 'highland-mist-to-southern-ocean',
    description: '[Tour description from Figma]',
    duration: '[Duration]',
    imageAlt: 'Highland Tea Estates and Mountains',
    routeLabel: 'Highland to Ocean',
    tags: ['Tea Country', 'Highlands', 'Coast'],
    priceLabel: '[Price]',
  },
  {
    title: 'Wild Ceylon Safari & Coastal Escape',
    slug: 'wild-ceylon-safari-coastal-escape',
    description: '[Tour description from Figma]',
    duration: '[Duration]',
    imageAlt: 'Majestic Wild Asian Elephants Safari',
    routeLabel: 'Safari & Coast',
    tags: ['Wildlife', 'Safari', 'Beaches'],
    priceLabel: '[Price]',
  },
] as const

export const homeDestinations = [
  {
    name: 'Sigiriya',
    slug: 'sigiriya',
    imageAlt: 'Sigiriya Lion Citadel',
    region: 'CULTURAL TRIANGLE',
    summary: 'The Lion Citadel & Ancient Rock Kingdoms',
    badge: '[Badge]',
  },
  {
    name: 'Kandy',
    slug: 'kandy',
    imageAlt: 'Kandy',
    region: 'CENTRAL PROVINCE',
    summary: 'Sacred Temple of the Tooth & Royal Lake',
    badge: '[Badge]',
  },
  {
    name: 'Nuwara Eliya & Ella',
    slug: 'nuwara-eliya-ella',
    imageAlt: 'Emerald Tea Valleys in Ella',
    region: 'TEA COUNTRY',
    summary: 'Emerald Tea Valleys & Scenic Railways',
    badge: '[Badge]',
  },
  {
    name: 'Yala & Minneriya',
    slug: 'yala-minneriya',
    imageAlt: 'Wild Elephants in Minneriya',
    region: 'NATIONAL PARKS',
    summary: 'Leopards & Wild Asian Elephant Herds',
    badge: '[Badge]',
  },
  {
    name: 'Galle & Coast',
    slug: 'galle-coast',
    imageAlt: 'Southern Coast Tropical Beach',
    region: 'SOUTHERN PROVINCE',
    summary: 'Dutch Fort Bastions & Palm Beaches',
    badge: '[Badge]',
  },
  {
    name: 'Mirissa & Tangalle',
    slug: 'mirissa-tangalle',
    imageAlt: 'Mirissa Coastal Escape',
    region: 'DEEP SOUTH',
    summary: 'Azure Waters, Whale Watching & Seclusion',
    badge: '[Badge]',
  },
] as const

export const homePillars = [
  {
    title: '100% Private & Flexible Journeys',
    body: 'No rigid bus schedules, no group tour compromises. Stop anytime for roadside king coconuts, spontaneous temple visits, or scenic photo ops.',
    footer: 'YOUR SCHEDULE, YOUR PACE',
    icon: 'schedule',
  },
  {
    title: 'Handpicked Boutique Hotels & Villas',
    body: "Colonial tea planters' bungalows, eco-luxury safari camps, and oceanfront sanctuaries personally vetted for charm, comfort, and sustainable gastronomy.",
    footer: 'VERIFIED LUXURY STAYS',
    icon: 'villa',
  },
  {
    title: 'Certified English-Speaking Chauffeur Guides',
    body: 'Professional, polite, and deeply knowledgeable drivers who are storytellers, wildlife spotters, and proud ambassadors of Ceylon heritage.',
    footer: 'SLTDA NATIONAL GUIDES',
    icon: 'person',
  },
  {
    title: 'Direct Island Concierge',
    body: 'Instant 24/7 WhatsApp assistance throughout your entire stay across Sri Lanka. Table reservations, train tickets, and special celebrations arranged effortlessly.',
    footer: 'ALWAYS BY YOUR SIDE',
    icon: 'chat',
  },
] as const

export const homeInquiry = {
  eyebrow: 'INQUIRY',
  title: 'Plan Your Dream Sri Lankan Holiday',
  body: 'Tell us your travel details and we will create the perfect tour package for you.',
  guarantees: ['100% Customizable', 'No Hidden Charges', 'Best Price Guarantee'],
  contactTitle: 'Prefer to talk?',
  contactBody: 'Reach us on the numbers listed in the header. Submissions are not stored yet.',
  submitLabel: 'Request Your Bespoke Itinerary',
  submitNote: '[Response-time copy from Figma]',
  interests: ['Sigiriya', 'Kandy', 'Ella', 'Yala', 'Nuwara Eliya', 'Galle'],
  durations: [
    { value: '4-6', label: '4–6 days' },
    { value: '7-10', label: '7–10 days' },
    { value: '11-14', label: '11–14 days' },
    { value: '15+', label: '15+ days' },
  ],
  guestOptions: [
    { value: '1-2', label: '1–2 guests' },
    { value: '3-4', label: '3–4 guests' },
    { value: '5-6', label: '5–6 guests' },
    { value: '7+', label: '7+ guests' },
  ],
  stays: [
    { value: 'boutique', label: 'Boutique hotels & villas' },
    { value: 'hotel', label: 'Hotels' },
    { value: 'mix', label: 'A mix of styles' },
  ],
} as const

export const homeReviews = [
  {
    travelerName: '[Traveler name]',
    country: '[Country]',
    dateLabel: '[Travel date]',
    rating: 5,
    review:
      'Our chauffeur-guide Sanjeewa was exceptional. Traveling with our two kids was completely stress-free. The vehicle was spotless every morning, and his knowledge of local wildlife and village viewpoints transformed our holiday.',
  },
  {
    travelerName: '[Traveler name]',
    country: '[Country]',
    dateLabel: '[Travel date]',
    rating: 5,
    review:
      'The tea bungalow stay in Nuwara Eliya and the private safari in Minneriya were once-in-a-lifetime experiences. Highly recommended. Booking with RadsLanka was seamless from start to finish. We will return!',
  },
  {
    travelerName: '[Traveler name]',
    country: '[Country]',
    dateLabel: '[Travel date]',
    rating: 5,
    review:
      "From airport pickup to final drop-off, RadsLanka delivered pure excellence. Truly local, warm, and authentic hospitality. The customized pacing suited our desire to explore without rushing through Sri Lanka's sacred sites.",
  },
] as const
