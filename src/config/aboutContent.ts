import defaultHeroImage from '@/assets/background_hero_image.jpg'
import defaultOriginsImage from '@/assets/logo.png'
import type { AboutDistinctionFact } from '@/types/models.ts'

export const ABOUT_SETTINGS_DOCUMENT_ID = 'about'
export const ABOUT_TEAM_SUBCOLLECTION = 'teamMembers'
export const ABOUT_APPROACHES_SUBCOLLECTION = 'approaches'

export const ABOUT_HERO_TITLE_DEFAULT = 'Who We Are..'
export const ABOUT_HERO_TITLE_MAX = 120
export const ABOUT_HERO_DESCRIPTION_MAX = 800

export const ABOUT_CATCHPHRASE_DEFAULT = 'Not tour brokers. Custodians of Ceylon.'
export const ABOUT_CATCHPHRASE_MAX = 80
export const ABOUT_DISTINCTION_DESCRIPTION_DEFAULT =
  'We are not a generic tour bus, automated booking engine, or distant international travel broker. We are local guides of Sri Lanka, pairing discerning global voyagers with experienced guides who know every quiet mountain hairpin, undiscovered sunrise crest, and roadside king coconut stall.'
export const ABOUT_DISTINCTION_DESCRIPTION_MAX = 2000

export const ABOUT_FACTS_MAX = 6
export const ABOUT_FACT_TITLE_MAX = 80
export const ABOUT_FACT_DESCRIPTION_MAX = 300

export const ABOUT_ORIGINS_TITLE_DEFAULT = 'Born from a Love of Ceylon’s Winding Roads'
export const ABOUT_ORIGINS_TITLE_MAX = 160
export const ABOUT_ORIGINS_DESCRIPTION_DEFAULT =
  '“In Sri Lanka, hospitality is not an industry metric; it is our way of life. In our care, you are an honored houseguest.”'
export const ABOUT_ORIGINS_DESCRIPTION_MAX = 2000

export const ABOUT_JOURNEY_BASELINE_MAX = 1_000_000
export const ABOUT_OWNERSHIP_VALUE = '100%'
export const ABOUT_OWNERSHIP_LABEL = 'SRI LANKAN OWNED'

export const ABOUT_TEAM_NAME_MAX = 120
export const ABOUT_TEAM_DESIGNATION_MAX = 120
export const ABOUT_TEAM_DESCRIPTION_MAX = 1200

export const ABOUT_APPROACH_TITLE_MAX = 120
export const ABOUT_APPROACH_DESCRIPTION_MAX = 2000

/** Bundled About Us hero used until an admin uploads a replacement. */
export const ABOUT_DEFAULT_HERO_IMAGE_URL = defaultHeroImage

/** Bundled logo used for Our Origins until an admin uploads a replacement. */
export const ABOUT_DEFAULT_ORIGINS_IMAGE_URL = defaultOriginsImage

/**
 * Inquiry statuses (New, Contacted, Follow-up, Converted, Closed) do not mean a trip finished.
 * There is no bookings collection. Converted means an inquiry was won, not that travel completed.
 */
export const ABOUT_JOURNEY_TRACKING = {
  available: false,
  missing:
    'Automatic completed-journey counting is not available yet. This project has no bookings module and no status that unambiguously means a journey was completed. Inquiry statuses such as Converted or Closed are not used as completions. Enter the historical baseline below; tracked completions will be added once a completed-booking record exists.',
} as const

export const ABOUT_DISTINCTION_ICON_OPTIONS = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'villa', label: 'Villa' },
  { id: 'payments', label: 'Payments' },
  { id: 'badge', label: 'Badge' },
  { id: 'directions_car', label: 'Vehicle' },
  { id: 'map', label: 'Map' },
  { id: 'verified', label: 'Verified' },
  { id: 'headset_mic', label: 'Support' },
  { id: 'verified_user', label: 'Shield' },
  { id: 'groups', label: 'Group' },
  { id: 'hotel', label: 'Stay' },
  { id: 'support_agent', label: 'Concierge' },
  { id: 'auto_awesome', label: 'Sparkle' },
  { id: 'explore', label: 'Explore' },
  { id: 'favorite', label: 'Heart' },
  { id: 'local_florist', label: 'Nature' },
  { id: 'health_and_safety', label: 'Safety' },
  { id: 'person', label: 'Person' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'place', label: 'Place' },
] as const

export type AboutDistinctionIconId = (typeof ABOUT_DISTINCTION_ICON_OPTIONS)[number]['id']

export const ABOUT_DISTINCTION_FALLBACK_ICON: AboutDistinctionIconId = 'schedule'

export function isAboutDistinctionIconId(value: unknown): value is AboutDistinctionIconId {
  return ABOUT_DISTINCTION_ICON_OPTIONS.some((option) => option.id === value)
}

export const DEFAULT_DISTINCTION_FACTS: readonly AboutDistinctionFact[] = [
  {
    id: 'default-unhurried',
    icon: 'schedule',
    title: 'True Unhurried Pacing',
    description:
      'No whistle-stop schedules. Leisurely breakfasts and sunset pauses designed into every day.',
  },
  {
    id: 'default-sanctuary',
    icon: 'villa',
    title: 'Sanctuary Stays',
    description: 'Deep ties with independent heritage estates, private colonial villas, and eco-retreats.',
  },
  {
    id: 'default-costs',
    icon: 'payments',
    title: 'Zero Hidden Costs',
    description: 'Total pricing clarity. Expressway tolls, fuel, parking, and driver lodging strictly covered.',
  },
]

export const DEFAULT_ABOUT_APPROACHES: readonly { id: string; title: string; description: string }[] = [
  {
    id: 'listening-crafting',
    title: 'Listening & Crafting',
    description:
      'We begin with a personal consultation to understand your cadence. Whether prioritizing secluded tea planter bungalows, wild elephant tracking, or Ayurvedic retreats, drive times are calibrated so you never experience travel fatigue.',
  },
  {
    id: 'native-knowledge',
    title: 'Native Knowledge in Every Mile',
    description:
      "Your chauffeur is a seasoned cultural interpreter. They know precisely when the morning mist clears over Little Adam's Peak, secure temple entries before bus crowds, and introduce you to authentic family kitchens off the map.",
  },
  {
    id: 'sanctuary-stays-care',
    title: 'Sanctuary Stays & Care',
    description:
      'From curbside airport reception with cool towels to seamless check-in at independent heritage properties, your private vehicle stays at your service for spontaneous sunset dinners or early morning game drives.',
  },
]

export function normalizeMultiline(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/** Counts characters after removing newline characters. Spaces and all other characters still count. */
export function countWithoutNewlines(value: string): number {
  return normalizeMultiline(value).replace(/[\n\r]/g, '').length
}

export function displayedJourneyTotal(baseline: number, trackedCompleted = 0): number {
  const safeBaseline = Number.isFinite(baseline) ? Math.max(0, Math.floor(baseline)) : 0
  const safeTracked = Number.isFinite(trackedCompleted) ? Math.max(0, Math.floor(trackedCompleted)) : 0
  return safeBaseline + safeTracked
}

/** Strips wrapping quotation marks so a public blockquote does not quote the text twice. */
export function originsQuoteBody(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(/^[“”"'‘’]([\s\S]*)[“”"'‘’]$/)
  return match?.[1]?.trim() ?? trimmed
}
