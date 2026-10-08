import { doc, getDocFromServer, setDoc } from 'firebase/firestore'
import { homeHero } from '@/data/home.ts'
import { db } from '@/services/firebase/firestore.ts'
import {
  FIRESTORE_COLLECTIONS,
  type HeroTextBlock,
  type HeroTextStyle,
  type HomepageHeroContent,
  type MediaAsset,
  type SiteSettings,
} from '@/types/models.ts'

export const SITE_SETTINGS_DOCUMENT_ID = 'main'

export const HOMEPAGE_HERO_BLOCK_COUNT = 3

export const HERO_TEXT_MAX_LENGTH = 200

export const HERO_DESCRIPTION_MAX_LENGTH = 800

export const HERO_TEXT_STYLE_OPTIONS: readonly { value: HeroTextStyle; label: string }[] = [
  { value: 'eyebrow', label: 'Eyebrow' },
  { value: 'title', label: 'Title' },
  { value: 'subtitle', label: 'Subtitle' },
]

const HERO_TEXT_STYLES = HERO_TEXT_STYLE_OPTIONS.map((option) => option.value)

type HeroTextBlocks = [HeroTextBlock, HeroTextBlock, HeroTextBlock]

function isHeroTextStyle(value: unknown): value is HeroTextStyle {
  return HERO_TEXT_STYLES.some((style) => style === value)
}

function createDefaultHeroTextBlocks(): HeroTextBlocks {
  return [
    { text: homeHero.overline, style: 'eyebrow' },
    { text: homeHero.title, style: 'title' },
    { text: homeHero.subtitle, style: 'subtitle' },
  ]
}

export function createDefaultHomepageHero(): HomepageHeroContent {
  return {
    heroTextBlocks: createDefaultHeroTextBlocks(),
    heroDescription: homeHero.intro,
  }
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeHeroTextBlock(value: unknown, fallback: HeroTextBlock): HeroTextBlock {
  if (!value || typeof value !== 'object') {
    return { ...fallback }
  }

  const record = value as Record<string, unknown>
  return {
    text: readString(record.text, fallback.text),
    style: isHeroTextStyle(record.style) ? record.style : fallback.style,
  }
}

function normalizeHeroTextBlocks(value: unknown): HeroTextBlocks {
  const defaults = createDefaultHeroTextBlocks()
  if (!Array.isArray(value)) {
    return defaults
  }

  return [
    normalizeHeroTextBlock(value[0], defaults[0]),
    normalizeHeroTextBlock(value[1], defaults[1]),
    normalizeHeroTextBlock(value[2], defaults[2]),
  ]
}

function toMediaAsset(value: unknown): MediaAsset | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  if (
    typeof record.imageUrl !== 'string' ||
    typeof record.publicId !== 'string' ||
    typeof record.altText !== 'string'
  ) {
    return null
  }

  return {
    imageUrl: record.imageUrl,
    publicId: record.publicId,
    altText: record.altText,
    ...(typeof record.caption === 'string' ? { caption: record.caption } : {}),
  }
}

function toSocialLinks(value: unknown): SiteSettings['socialLinks'] {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const record = value as Record<string, unknown>
  return {
    ...(typeof record.facebook === 'string' ? { facebook: record.facebook } : {}),
    ...(typeof record.instagram === 'string' ? { instagram: record.instagram } : {}),
    ...(typeof record.youtube === 'string' ? { youtube: record.youtube } : {}),
  }
}

function toSiteSettings(data: Record<string, unknown>): SiteSettings {
  return {
    logo: toMediaAsset(data.logo),
    phone: readString(data.phone),
    whatsapp: readString(data.whatsapp),
    email: readString(data.email),
    address: readString(data.address),
    socialLinks: toSocialLinks(data.socialLinks),
    heroTextBlocks: normalizeHeroTextBlocks(data.heroTextBlocks),
    heroDescription: readString(data.heroDescription, homeHero.intro),
    footer: readString(data.footer),
  }
}

function siteSettingsRef() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return doc(db, FIRESTORE_COLLECTIONS.siteSettings, SITE_SETTINGS_DOCUMENT_ID)
}

export function homepageHeroFromSettings(settings: SiteSettings | null): HomepageHeroContent {
  if (!settings) {
    return createDefaultHomepageHero()
  }

  return {
    heroTextBlocks: normalizeHeroTextBlocks(settings.heroTextBlocks),
    heroDescription:
      typeof settings.heroDescription === 'string' ? settings.heroDescription : homeHero.intro,
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snapshot = await getDocFromServer(siteSettingsRef())
  if (!snapshot.exists()) {
    return null
  }

  return toSiteSettings(snapshot.data())
}

/**
 * Public homepage read. Missing documents and failed reads use the current hero copy.
 */
export async function getHomepageHeroContent(): Promise<HomepageHeroContent> {
  try {
    return homepageHeroFromSettings(await getSiteSettings())
  } catch {
    return createDefaultHomepageHero()
  }
}

function sanitizeHomepageHero(content: HomepageHeroContent): HomepageHeroContent {
  if (content.heroTextBlocks.length !== HOMEPAGE_HERO_BLOCK_COUNT) {
    throw new Error('The homepage hero uses three text blocks.')
  }

  const heroTextBlocks = content.heroTextBlocks.map((block) => {
    const text = block.text.trim()
    if (!text) {
      throw new Error('Enter text for each hero block.')
    }
    if (text.length > HERO_TEXT_MAX_LENGTH) {
      throw new Error(`Keep each hero line under ${HERO_TEXT_MAX_LENGTH} characters.`)
    }
    if (!isHeroTextStyle(block.style)) {
      throw new Error('Choose a valid formatting style.')
    }

    return { text, style: block.style }
  })
  const heroDescription = content.heroDescription.trim()

  if (!heroDescription) {
    throw new Error('Enter a hero description.')
  }
  if (heroDescription.length > HERO_DESCRIPTION_MAX_LENGTH) {
    throw new Error(`Keep the hero description under ${HERO_DESCRIPTION_MAX_LENGTH} characters.`)
  }

  return { heroTextBlocks, heroDescription }
}

/**
 * Merges homepage hero fields into siteSettings/main.
 * Logo, contact details, social links, and footer are left unchanged.
 */
export async function updateSiteSettings(content: HomepageHeroContent): Promise<void> {
  const hero = sanitizeHomepageHero(content)

  await setDoc(
    siteSettingsRef(),
    {
      heroTextBlocks: hero.heroTextBlocks,
      heroDescription: hero.heroDescription,
    },
    { merge: true },
  )
}
