import { listPublishedAccommodations, type AccommodationRecord } from '@/services/firebase/accommodations.ts'
import { listAllTags, type TagRecord } from '@/services/firebase/tags.ts'
import { listAllTravelStyles, type TravelStyleRecord } from '@/services/firebase/travelStyles.ts'
import { listPublishedDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import type { Tour } from '@/types/models.ts'
import type { CatalogAccommodation, CatalogTour } from '@/types/tours.ts'
import { formatLkrAmount, pricingBasisNote } from '@/utils/tourPricing.ts'

type PublicTourRecord = Tour & { id: string; legacyTravelStyle?: string }

function durationDays(duration: string, itineraryLength: number): number {
  const match = duration.match(/\d+/)
  if (match) {
    const value = Number(match[0])
    if (Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return itineraryLength > 0 ? itineraryLength : 1
}

function formatPrice(price: number): string {
  return formatLkrAmount(price)
}

function toCatalogAccommodation(record: AccommodationRecord): CatalogAccommodation {
  const image = record.images[0]

  return {
    id: record.id,
    name: record.name.trim(),
    description: record.description.trim(),
    type: record.type.trim(),
    location: record.location.trim(),
    ...(image?.imageUrl
      ? {
          imageSrc: image.imageUrl,
          imageAlt: image.altText.trim() || record.name,
        }
      : {}),
  }
}

function resolveTravelStyleName(tour: PublicTourRecord, styles: TravelStyleRecord[]): string | undefined {
  const selected = styles.find((style) => style.id === tour.travelStyleId)?.name.trim()
  const legacy = tour.legacyTravelStyle?.trim()
  const name = selected || legacy || ''
  return name || undefined
}

function resolveTagNames(ids: string[] | undefined, tags: TagRecord[]): string[] {
  const byId = new Map(tags.map((tag) => [tag.id, tag]))
  const names: string[] = []
  for (const id of ids ?? []) {
    const name = byId.get(id)?.name.trim()
    if (name) {
      names.push(name)
    }
  }
  return names
}

export function toCatalogTour(
  tour: PublicTourRecord,
  destinations: DestinationRecord[],
  accommodations: AccommodationRecord[] = [],
  tags: TagRecord[] = [],
  travelStyles: TravelStyleRecord[] = [],
): CatalogTour {
  const byId = new Map(destinations.map((destination) => [destination.id, destination]))
  const matched = tour.destinations
    .map((id) => byId.get(id))
    .filter((destination): destination is DestinationRecord => Boolean(destination))
  const names = matched.map((destination) => destination.name.trim()).filter(Boolean)
  const routeLabel = names.join(' · ')
  const accommodationById = new Map(accommodations.map((item) => [item.id, item]))
  const assignedAccommodations = (tour.accommodationIds ?? [])
    .map((id) => accommodationById.get(id))
    .filter((item): item is AccommodationRecord => Boolean(item?.published))
    .map(toCatalogAccommodation)
    .filter((item) => item.name)

  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    shortDescription: tour.description,
    fullDescription: tour.description,
    duration: tour.duration,
    durationDays: durationDays(tour.duration, tour.itinerary.length),
    price: tour.price,
    priceLabel: formatPrice(tour.price),
    priceNote: pricingBasisNote(tour.pricingBasis ?? 'per_person', tour.pricingCustomLabel ?? ''),
    travelStyle: resolveTravelStyleName(tour, travelStyles),
    routeLabel: routeLabel || undefined,
    routeSummary: routeLabel || undefined,
    tags: resolveTagNames(tour.tagIds, tags),
    category: '',
    featured: tour.featured,
    featuredLabel: tour.featured ? 'Featured' : undefined,
    images: tour.images.map((image) => ({
      src: image.imageUrl,
      alt: image.altText.trim() || tour.title,
      ...(image.caption?.trim() ? { caption: image.caption.trim() } : {}),
    })),
    highlights: [],
    itinerary: tour.itinerary.map((day) => ({
      day: day.day,
      title: day.title,
      summary: day.description,
      locations: day.locations,
    })),
    inclusions: [...tour.included],
    exclusions: [...tour.excluded],
    practicalNotes: [],
    destinationIds: matched.map((destination) => destination.slug).filter(Boolean),
    destinationNames: names,
    accommodations: assignedAccommodations,
    relatedTourIds: [],
    published: tour.published,
  }
}

export async function toCatalogTours(records: PublicTourRecord[]): Promise<CatalogTour[]> {
  if (records.length === 0) {
    return []
  }

  let destinations: DestinationRecord[] = []
  let accommodations: AccommodationRecord[] = []
  let tags: TagRecord[] = []
  let travelStyles: TravelStyleRecord[] = []
  try {
    destinations = await listPublishedDestinations()
  } catch {
    destinations = []
  }
  try {
    accommodations = await listPublishedAccommodations()
  } catch {
    accommodations = []
  }
  try {
    tags = await listAllTags()
  } catch {
    tags = []
  }
  try {
    travelStyles = await listAllTravelStyles()
  } catch {
    travelStyles = []
  }

  return records.map((record) => toCatalogTour(record, destinations, accommodations, tags, travelStyles))
}
