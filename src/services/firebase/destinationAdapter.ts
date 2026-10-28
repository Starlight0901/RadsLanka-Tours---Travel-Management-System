import {
  characteristicLabels,
  essenceThemesInSavedOrder,
  formatLocation,
  formatMonthRange,
  formatStay,
} from '@/config/destinationContent.ts'
import type { DestinationRecord } from '@/services/firebase/destinations.ts'
import type { GalleryRecord } from '@/services/firebase/gallery.ts'
import type {
  CatalogDestination,
  CatalogDestinationExperience,
  DestinationEssenceTheme,
  DestinationGlance,
  DestinationImage,
  DestinationKeyHighlight,
} from '@/types/destinations.ts'
import { galleryImageKey } from '@/utils/galleryLimits.ts'

function nonEmpty(value: string | undefined): string | undefined {
  return value?.trim() ? value : undefined
}

function nonEmptyList(values: string[]): string[] | undefined {
  return values.length > 0 ? values : undefined
}

function publishedHighlights(record: DestinationRecord): DestinationKeyHighlight[] {
  return record.keyHighlights
    .filter((item) => item.published && item.title.trim())
    .map((item) => ({
      title: item.title.trim(),
      detail: item.detail.trim(),
      icon: item.icon.trim() || undefined,
    }))
}

function publishedExperiences(record: DestinationRecord): CatalogDestinationExperience[] {
  return record.experiences
    .filter((item) => item.published && item.title.trim() && item.image?.imageUrl)
    .map((item) => ({
      id: item.id,
      title: item.title.trim(),
      description: item.description,
      imageUrl: item.image?.imageUrl ?? '',
      imageAlt: item.image?.altText || item.title,
    }))
}

function toEssenceThemes(ids: string[]): DestinationEssenceTheme[] {
  return essenceThemesInSavedOrder(ids).map((theme) => ({
    id: theme.id,
    title: theme.label,
    icon: theme.icon,
  }))
}

export function toCatalogGlance(record: DestinationRecord): DestinationGlance {
  const { glance } = record
  return {
    bestTime: nonEmpty(formatMonthRange(glance.bestTimeMonths)),
    location: nonEmpty(formatLocation(glance.province, glance.district)),
    recommendedStay: nonEmpty(formatStay(glance.recommendedStay)),
    characteristics: nonEmptyList(characteristicLabels(glance.characteristics, glance.characteristicOther)),
    idealFor: nonEmptyList(glance.idealFor),
  }
}

function glanceHasValues(glance: DestinationGlance): boolean {
  return Boolean(
    glance.bestTime ||
      glance.location ||
      glance.recommendedStay ||
      (glance.characteristics && glance.characteristics.length > 0) ||
      (glance.idealFor && glance.idealFor.length > 0),
  )
}

function destinationGalleryImages(
  record: DestinationRecord,
  associated: GalleryRecord[] = [],
): DestinationImage[] {
  const seen = new Set<string>()
  const images: DestinationImage[] = []

  function add(image: DestinationImage) {
    const key = galleryImageKey({ imageUrl: image.src, publicId: '' }) || image.src || image.alt
    if (!image.src || seen.has(key)) {
      return
    }
    seen.add(key)
    images.push(image)
  }

  for (const image of record.gallery) {
    if (!image.imageUrl) {
      continue
    }
    const title = image.caption?.trim() || image.altText.trim()
    add({
      src: image.imageUrl,
      alt: image.altText.trim() || title || record.name,
      ...(title ? { caption: title } : {}),
    })
  }

  for (const item of associated) {
    if (item.destinationId !== record.id || !item.imageUrl) {
      continue
    }
    const title = item.title.trim() || item.caption.trim() || item.altText.trim()
    add({
      src: item.imageUrl,
      alt: item.altText.trim() || title || record.name,
      ...(title ? { caption: title } : {}),
    })
  }

  return images
}

/**
 * Overlays admin-managed Firestore fields onto a catalogue destination.
 * Empty CMS fields stay empty — mock catalogue copy is not used as a fallback.
 * Curated experiences, places, seasons, and travel notes stay on the catalogue record.
 */
export function applyFirestoreDestination(
  destination: CatalogDestination,
  record: DestinationRecord,
  associatedGallery: GalleryRecord[] = [],
): CatalogDestination {
  const glance = toCatalogGlance(record)
  const highlights = publishedHighlights(record)
  const essenceThemes = toEssenceThemes(record.essenceThemes)
  const catalogHero = destination.images[0]
  const hero = record.coverImage
    ? { src: record.coverImage.imageUrl, alt: record.coverImage.altText || record.name }
    : catalogHero
  const gallery = destinationGalleryImages(record, associatedGallery)

  return {
    ...destination,
    name: record.name,
    slug: record.slug,
    kicker: undefined,
    tagline: nonEmpty(record.subtitle),
    shortDescription: record.description.trim(),
    images: hero ? [hero, ...gallery] : gallery,
    overviewTitle: nonEmpty(record.overviewTitle),
    fullDescription: record.overviewDescription,
    glance: glanceHasValues(glance) ? glance : undefined,
    keyHighlights: highlights,
    essenceThemes,
    experiences: publishedExperiences(record),
    featured: record.featured,
    popular: record.popular,
    published: record.published,
  }
}

/** Builds a catalogue destination from a Firestore record that has no mock counterpart. */
export function toCatalogDestination(
  record: DestinationRecord,
  associatedGallery: GalleryRecord[] = [],
): CatalogDestination {
  const hero = record.coverImage
    ? [{ src: record.coverImage.imageUrl, alt: record.coverImage.altText || record.name }]
    : []
  const glance = toCatalogGlance(record)
  const gallery = destinationGalleryImages(record, associatedGallery)

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    tagline: nonEmpty(record.subtitle),
    shortDescription: record.description,
    fullDescription: record.overviewDescription,
    overviewTitle: nonEmpty(record.overviewTitle),
    images: [...hero, ...gallery],
    tags: [],
    highlights: [],
    places: [],
    facts: [],
    stats: [],
    whyVisit: [],
    glance: glanceHasValues(glance) ? glance : undefined,
    keyHighlights: publishedHighlights(record),
    essenceThemes: toEssenceThemes(record.essenceThemes),
    experiences: publishedExperiences(record),
    seasons: [],
    travelInfo: [],
    featured: record.featured,
    popular: record.popular,
    published: record.published,
  }
}
