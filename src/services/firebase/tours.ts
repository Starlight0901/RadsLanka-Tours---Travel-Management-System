import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import {
  FIRESTORE_COLLECTIONS,
  type MediaAsset,
  type Tour,
  type TourItineraryDay,
  type TourPricingBasis,
} from '@/types/models.ts'
import { isPricingBasis } from '@/utils/tourPricing.ts'

export type TourRecord = Tour & {
  id: string
  /** Free-text value stored on tours created before travel styles were a collection. */
  legacyTravelStyle: string
}

export type TourInput = Omit<Tour, 'createdAt' | 'updatedAt'>

const TITLE_MAX = 160
const SLUG_MAX = 160
const DESCRIPTION_MAX = 8000
const DURATION_MAX = 120
const TEXT_MAX = 4000
const ITEM_MAX = 300
const CUSTOM_PRICE_MAX = 80

function readPricingBasis(value: unknown): TourPricingBasis {
  return isPricingBasis(value) ? value : 'per_person'
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function readItinerary(value: unknown): TourItineraryDay[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return { day: index + 1, title: '', description: '', locations: [] }
    }

    const record = item as Record<string, unknown>
    const day = typeof record.day === 'number' && Number.isFinite(record.day) ? record.day : index + 1

    return {
      day,
      title: readString(record.title),
      description: readString(record.description),
      locations: readStringList(record.locations),
    }
  })
}

function readImages(value: unknown): MediaAsset[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const record = item as Record<string, unknown>
    if (typeof record.imageUrl !== 'string' || typeof record.publicId !== 'string') {
      return []
    }

    const image: MediaAsset = {
      imageUrl: record.imageUrl,
      publicId: record.publicId,
      altText: readString(record.altText),
    }
    if (typeof record.caption === 'string' && record.caption.trim()) {
      image.caption = record.caption
    }

    return [image]
  })
}

function toTour(id: string, data: Record<string, unknown>): TourRecord {
  const price = typeof data.price === 'number' && Number.isFinite(data.price) ? data.price : 0

  return {
    id,
    title: readString(data.title),
    slug: readString(data.slug),
    description: readString(data.description),
    duration: readString(data.duration),
    price,
    pricingBasis: readPricingBasis(data.pricingBasis),
    pricingCustomLabel: readString(data.pricingCustomLabel),
    travelStyleId: readString(data.travelStyleId),
    legacyTravelStyle: readString(data.travelStyle),
    destinations: readStringList(data.destinations),
    accommodationIds: readStringList(data.accommodationIds),
    tagIds: readStringList(data.tagIds),
    itinerary: readItinerary(data.itinerary),
    included: readStringList(data.included),
    excluded: readStringList(data.excluded),
    images: readImages(data.images),
    featured: data.featured === true,
    popular: data.popular === true,
    published: data.published === true,
    createdAt: data.createdAt as Tour['createdAt'],
    updatedAt: data.updatedAt as Tour['updatedAt'],
  }
}

function requireText(value: string, label: string, max: number): string {
  const text = value.trim()
  if (!text) {
    throw new Error(`Enter a ${label}.`)
  }
  if (text.length > max) {
    throw new Error(`Keep the ${label} under ${max} characters.`)
  }

  return text
}

function cleanItems(items: string[], label: string): string[] {
  return items.flatMap((item) => {
    const text = item.trim()
    if (!text) {
      return []
    }
    if (text.length > ITEM_MAX) {
      throw new Error(`Keep each ${label} under ${ITEM_MAX} characters.`)
    }

    return [text]
  })
}

function toStoredImage(image: MediaAsset): MediaAsset {
  const imageUrl = image.imageUrl.trim()
  const publicId = image.publicId.trim()
  const altText = image.altText.trim()

  if (!imageUrl || !publicId) {
    throw new Error('Each image needs a Cloudinary URL and public ID.')
  }
  if (!altText) {
    throw new Error('Enter alt text for each image.')
  }
  if (altText.length > ITEM_MAX) {
    throw new Error(`Keep each image alt text under ${ITEM_MAX} characters.`)
  }

  const stored: MediaAsset = { imageUrl, publicId, altText }
  const caption = image.caption?.trim() ?? ''
  if (caption.length > ITEM_MAX) {
    throw new Error(`Keep each image caption under ${ITEM_MAX} characters.`)
  }
  if (caption) {
    stored.caption = caption
  }

  return stored
}

function toStoredItinerary(days: TourItineraryDay[]): TourItineraryDay[] {
  const stored: TourItineraryDay[] = []

  for (const day of days) {
    const title = day.title.trim()
    const description = day.description.trim()
    const locations = cleanItems(day.locations, 'location')
    if (!title && !description && locations.length === 0) {
      continue
    }
    if (!title) {
      throw new Error('Enter a title for each itinerary day.')
    }
    if (title.length > TITLE_MAX) {
      throw new Error(`Keep each itinerary title under ${TITLE_MAX} characters.`)
    }
    if (description.length > TEXT_MAX) {
      throw new Error(`Keep each itinerary description under ${TEXT_MAX} characters.`)
    }
    if (!Number.isInteger(day.day) || day.day < 1) {
      throw new Error(`Enter a valid day number for “${title}”.`)
    }

    stored.push({ day: day.day, title, description, locations })
  }

  return stored
}

function sanitizeTourInput(input: TourInput): TourInput {
  const title = requireText(input.title, 'tour title', TITLE_MAX)
  const slug = requireText(input.slug, 'tour slug', SLUG_MAX)
  const description = input.description.trim()
  const duration = requireText(input.duration, 'duration', DURATION_MAX)
  const travelStyleId = (input.travelStyleId ?? '').trim()

  if (description.length > DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${DESCRIPTION_MAX} characters.`)
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error('Enter a valid price.')
  }
  const pricingBasis = isPricingBasis(input.pricingBasis) ? input.pricingBasis : 'per_person'
  const pricingCustomLabel = (input.pricingCustomLabel ?? '').trim()
  if (pricingBasis === 'custom' && !pricingCustomLabel) {
    throw new Error('Enter a custom pricing label.')
  }
  if (pricingCustomLabel.length > CUSTOM_PRICE_MAX) {
    throw new Error(`Keep the custom pricing label under ${CUSTOM_PRICE_MAX} characters.`)
  }

  return {
    title,
    slug,
    description,
    duration,
    price: input.price,
    pricingBasis,
    pricingCustomLabel: pricingBasis === 'custom' ? pricingCustomLabel : '',
    travelStyleId,
    destinations: input.destinations.map((id) => id.trim()).filter(Boolean),
    accommodationIds: (input.accommodationIds ?? []).map((id) => id.trim()).filter(Boolean),
    tagIds: (input.tagIds ?? []).map((id) => id.trim()).filter(Boolean),
    itinerary: toStoredItinerary(input.itinerary),
    included: cleanItems(input.included, 'included item'),
    excluded: cleanItems(input.excluded, 'excluded item'),
    images: input.images.map(toStoredImage),
    featured: input.featured === true,
    popular: input.popular === true,
    published: input.published === true,
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

const POPULAR_TOUR_LIMIT = 5

function createdAtMillis(tour: TourRecord): number {
  if (tour.createdAt && typeof tour.createdAt.toMillis === 'function') {
    return tour.createdAt.toMillis()
  }

  return 0
}

export async function listPublishedTours(): Promise<TourRecord[]> {
  const firestore = requireDb()
  const snapshot = await getDocs(
    query(collection(firestore, FIRESTORE_COLLECTIONS.tours), where('published', '==', true)),
  )

  return snapshot.docs
    .map((item) => toTour(item.id, item.data()))
    .filter((tour) => tour.published)
    .sort((a, b) => createdAtMillis(b) - createdAtMillis(a))
}

export async function listPopularTours(): Promise<TourRecord[]> {
  const firestore = requireDb()
  const snapshot = await getDocs(
    query(
      collection(firestore, FIRESTORE_COLLECTIONS.tours),
      where('published', '==', true),
      where('popular', '==', true),
    ),
  )

  return snapshot.docs
    .map((item) => toTour(item.id, item.data()))
    .filter((tour) => tour.published && tour.popular)
    .sort((a, b) => createdAtMillis(b) - createdAtMillis(a))
    .slice(0, POPULAR_TOUR_LIMIT)
}

export async function getPublishedTourBySlug(slug: string): Promise<TourRecord | null> {
  const normalized = slug.trim()
  if (!normalized) {
    return null
  }

  const firestore = requireDb()
  const snapshot = await getDocs(
    query(
      collection(firestore, FIRESTORE_COLLECTIONS.tours),
      where('published', '==', true),
      where('slug', '==', normalized),
      limit(1),
    ),
  )
  const first = snapshot.docs[0]
  if (!first) {
    return null
  }

  const tour = toTour(first.id, first.data())
  return tour.published ? tour : null
}

export async function listAllTours(): Promise<TourRecord[]> {
  const firestore = requireDb()
  const snapshot = await getDocs(
    query(collection(firestore, FIRESTORE_COLLECTIONS.tours), orderBy('createdAt', 'desc')),
  )

  return snapshot.docs.map((item) => toTour(item.id, item.data()))
}

export async function getTour(id: string): Promise<TourRecord | null> {
  const tourId = id.trim()
  if (!tourId) {
    throw new Error('A tour id is required.')
  }

  const snapshot = await getDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.tours, tourId))
  if (!snapshot.exists()) {
    return null
  }

  return toTour(snapshot.id, snapshot.data())
}

export async function createTour(input: TourInput): Promise<string> {
  const tour = sanitizeTourInput(input)
  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.tours), {
    ...tour,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateTour(id: string, input: TourInput): Promise<void> {
  const tourId = id.trim()
  if (!tourId) {
    throw new Error('A tour id is required.')
  }

  const tour = sanitizeTourInput(input)
  const ref = doc(requireDb(), FIRESTORE_COLLECTIONS.tours, tourId)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    throw new Error('This tour could not be found.')
  }

  await updateDoc(ref, {
    ...tour,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTour(id: string): Promise<void> {
  const tourId = id.trim()
  if (!tourId) {
    throw new Error('A tour id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.tours, tourId))
}
