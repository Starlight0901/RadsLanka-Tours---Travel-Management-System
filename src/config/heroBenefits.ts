export const HERO_BENEFITS_MAX_ITEMS = 6
export const HERO_BENEFIT_TITLE_MAX = 60
export const HERO_BENEFIT_DESCRIPTION_MAX = 120

export const HERO_BENEFITS_SPEED_MIN = 1
export const HERO_BENEFITS_SPEED_MAX = 10
export const HERO_BENEFITS_SPEED_DEFAULT = 4

/** Ensures speed is an integer from 1 (slowest) to 10 (fastest). */
export function clampHeroBenefitsSpeed(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) {
    return HERO_BENEFITS_SPEED_DEFAULT
  }

  return Math.min(HERO_BENEFITS_SPEED_MAX, Math.max(HERO_BENEFITS_SPEED_MIN, Math.round(number)))
}

const SPEED_BASE_PX_PER_SECOND = 8
const SPEED_STEP_PX_PER_SECOND = 6

/** Level 1 moves 8px/s and level 10 moves 62px/s. Higher levels are always faster. */
export function heroBenefitsSpeedToPxPerSecond(level: number): number {
  return SPEED_BASE_PX_PER_SECOND + (clampHeroBenefitsSpeed(level) - HERO_BENEFITS_SPEED_MIN) * SPEED_STEP_PX_PER_SECOND
}

export const HERO_BENEFIT_ICON_OPTIONS = [
  { id: 'id-card', label: 'Licensed driver', keywords: 'driver chauffeur guide license badge' },
  { id: 'user-check', label: 'Trusted person', keywords: 'driver guide verified staff' },
  { id: 'car', label: 'Car', keywords: 'vehicle transport sedan drive' },
  { id: 'car-front', label: 'Car front', keywords: 'vehicle transport drive' },
  { id: 'bus', label: 'Bus', keywords: 'vehicle coach van group transport' },
  { id: 'map', label: 'Map', keywords: 'itinerary tour plan route' },
  { id: 'map-pinned', label: 'Map pin', keywords: 'destination location place' },
  { id: 'route', label: 'Route', keywords: 'journey itinerary road trip' },
  { id: 'compass', label: 'Compass', keywords: 'explore discover navigation' },
  { id: 'wallet', label: 'Wallet', keywords: 'price money budget pay' },
  { id: 'hand-coins', label: 'Coins', keywords: 'price money value rates' },
  { id: 'badge-dollar-sign', label: 'Price badge', keywords: 'price guarantee money deal' },
  { id: 'piggy-bank', label: 'Savings', keywords: 'price money save budget' },
  { id: 'headset', label: 'Headset', keywords: 'support help service concierge call' },
  { id: 'message-circle', label: 'Chat', keywords: 'whatsapp support message concierge' },
  { id: 'phone', label: 'Phone', keywords: 'call support contact' },
  { id: 'clock', label: 'Clock', keywords: '24/7 time hours always' },
  { id: 'shield-check', label: 'Shield', keywords: 'safe secure reliable insurance' },
  { id: 'badge-check', label: 'Verified', keywords: 'quality trusted reliable approved' },
  { id: 'heart-handshake', label: 'Care', keywords: 'trust hospitality service friendly' },
  { id: 'award', label: 'Award', keywords: 'quality best rated' },
  { id: 'star', label: 'Star', keywords: 'rating review quality' },
  { id: 'sparkles', label: 'Sparkles', keywords: 'special custom premium' },
  { id: 'users', label: 'Group', keywords: 'family friends travelers people' },
  { id: 'hotel', label: 'Hotel', keywords: 'stay accommodation room' },
  { id: 'plane', label: 'Plane', keywords: 'airport flight transfer' },
  { id: 'luggage', label: 'Luggage', keywords: 'bags travel trip' },
  { id: 'calendar-check', label: 'Calendar', keywords: 'booking schedule flexible dates' },
  { id: 'leaf', label: 'Leaf', keywords: 'nature eco tea green' },
  { id: 'mountain', label: 'Mountain', keywords: 'hills hiking highlands nature' },
  { id: 'camera', label: 'Camera', keywords: 'photo sightseeing memories' },
  { id: 'globe', label: 'Globe', keywords: 'world international travel' },
] as const

export type HeroBenefitIconId = (typeof HERO_BENEFIT_ICON_OPTIONS)[number]['id']

export const HERO_BENEFIT_FALLBACK_ICON: HeroBenefitIconId = 'badge-check'

export function isHeroBenefitIconId(value: unknown): value is HeroBenefitIconId {
  return HERO_BENEFIT_ICON_OPTIONS.some((option) => option.id === value)
}

export const DEFAULT_HERO_BENEFITS: readonly { title: string; description: string; icon: HeroBenefitIconId }[] = [
  { title: 'Experienced Local Drivers', description: 'SLTDA-licensed chauffeur-guides', icon: 'id-card' },
  { title: 'Comfortable Vehicles', description: 'Private climate-controlled fleet', icon: 'car' },
  { title: 'Custom Tour Packages', description: '100% tailor-made itineraries', icon: 'map' },
  { title: 'Best Price Guarantee', description: 'Direct-to-local transparent rates', icon: 'wallet' },
  { title: '24/7 Customer Support', description: 'Concierge by WhatsApp', icon: 'headset' },
  { title: 'Safe and Reliable Services', description: 'Inspected vehicles and trained drivers', icon: 'shield-check' },
]
