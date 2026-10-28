import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { listPublishedDestinations } from '@/services/firebase/destinations.ts'
import { db } from '@/services/firebase/firestore.ts'
import { listPublishedTours } from '@/services/firebase/tours.ts'
import { FIRESTORE_COLLECTIONS, type GalleryItem, type MediaAsset } from '@/types/models.ts'
import type { CatalogGalleryItem, GalleryCategory } from '@/types/gallery.ts'
import {
  GALLERY_ASSOCIATION_LIMIT,
  GALLERY_TITLE_MAX,
  associatedGalleryKeys,
  embeddedTourGalleryImages,
  galleryImageKey,
  galleryLimitMessage,
} from '@/utils/galleryLimits.ts'

export type GalleryRecord = GalleryItem & { id: string }

export type GalleryInput = {
  title: string
  imageUrl: string
  publicId: string
  tourId: string
  destinationId: string
}

const URL_MAX = 2000
const PUBLIC_ID_MAX = 500

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function readMediaList(value: unknown): MediaAsset[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }
    const record = item as Record<string, unknown>
    const imageUrl = readString(record.imageUrl)
    const publicId = readString(record.publicId)
    if (!imageUrl && !publicId) {
      return []
    }
    const caption = readString(record.caption)
    return [
      {
        imageUrl,
        publicId,
        altText: readString(record.altText),
        ...(caption ? { caption } : {}),
      },
    ]
  })
}

function createdAtMillis(item: GalleryRecord): number {
  if (item.createdAt && typeof item.createdAt.toMillis === 'function') {
    return item.createdAt.toMillis()
  }

  return 0
}

function toGallery(id: string, data: Record<string, unknown>): GalleryRecord {
  const title = readString(data.title) || readString(data.caption) || readString(data.altText)

  return {
    id,
    imageUrl: readString(data.imageUrl),
    publicId: readString(data.publicId),
    title,
    tourId: readString(data.tourId),
    destinationId: readString(data.destinationId),
    category: readString(data.category),
    caption: readString(data.caption) || title,
    altText: readString(data.altText) || title,
    published: data.published === true,
    createdAt: data.createdAt as GalleryItem['createdAt'],
    updatedAt: data.updatedAt as GalleryItem['updatedAt'],
  }
}

function sanitize(input: GalleryInput) {
  const title = input.title.trim()
  if (!title) {
    throw new Error('Enter an image title.')
  }
  if (title.length > GALLERY_TITLE_MAX) {
    throw new Error(`Keep the image title under ${GALLERY_TITLE_MAX} characters.`)
  }

  const imageUrl = input.imageUrl.trim()
  const publicId = input.publicId.trim()
  if (!imageUrl || !publicId) {
    throw new Error('Upload an image.')
  }
  if (imageUrl.length > URL_MAX) {
    throw new Error('The image URL is too long. Upload the image again.')
  }
  if (publicId.length > PUBLIC_ID_MAX) {
    throw new Error('The image public ID is too long. Upload the image again.')
  }

  return {
    imageUrl,
    publicId,
    title,
    tourId: input.tourId.trim(),
    destinationId: input.destinationId.trim(),
    caption: title,
    altText: title,
    published: true,
  }
}

async function embeddedTourGallery(tourId: string): Promise<MediaAsset[]> {
  const snapshot = await getDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.tours, tourId))
  if (!snapshot.exists()) {
    throw new Error('The selected tour could not be found.')
  }

  return embeddedTourGalleryImages(readMediaList(snapshot.data().images))
}

async function embeddedDestinationGallery(destinationId: string): Promise<MediaAsset[]> {
  const snapshot = await getDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.destinations, destinationId))
  if (!snapshot.exists()) {
    throw new Error('The selected destination could not be found.')
  }

  return readMediaList(snapshot.data().gallery)
}

async function assertAssociationLimit(item: {
  id?: string
  tourId: string
  destinationId: string
  imageUrl: string
  publicId: string
}): Promise<void> {
  const records = await listAllGalleryItems()
  const imageKey = galleryImageKey(item)
  const existing = item.id ? records.find((record) => record.id === item.id) : undefined

  if (item.tourId) {
    const embedded = await embeddedTourGallery(item.tourId)
    const previous = associatedGalleryKeys({
      embedded,
      records,
      tourId: item.tourId,
      excludeRecordId: item.id,
    })
    const alreadyOnTour = previous.has(imageKey)
    const sameAssociation = existing?.tourId === item.tourId
    if (alreadyOnTour && !item.id) {
      throw new Error('This image is already on the tour and already appears in the gallery.')
    }
    if (!alreadyOnTour && !sameAssociation && previous.size >= GALLERY_ASSOCIATION_LIMIT) {
      throw new Error(galleryLimitMessage('tour'))
    }
  }

  if (item.destinationId) {
    const embedded = await embeddedDestinationGallery(item.destinationId)
    const previous = associatedGalleryKeys({
      embedded,
      records,
      destinationId: item.destinationId,
      excludeRecordId: item.id,
    })
    const alreadyOnDestination = previous.has(imageKey)
    const sameAssociation = existing?.destinationId === item.destinationId
    if (alreadyOnDestination && !item.id) {
      throw new Error('This image is already on the destination and already appears in the gallery.')
    }
    if (!alreadyOnDestination && !sameAssociation && previous.size >= GALLERY_ASSOCIATION_LIMIT) {
      throw new Error(galleryLimitMessage('destination'))
    }
  }
}

export async function listAllGalleryItems(): Promise<GalleryRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.gallery))

  return snapshot.docs
    .map((item) => toGallery(item.id, item.data()))
    .sort((a, b) => createdAtMillis(b) - createdAtMillis(a))
}

export async function listPublishedGalleryItems(): Promise<GalleryRecord[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), FIRESTORE_COLLECTIONS.gallery), where('published', '==', true)),
  )

  return snapshot.docs
    .map((item) => toGallery(item.id, item.data()))
    .filter((item) => item.published)
    .sort((a, b) => createdAtMillis(b) - createdAtMillis(a))
}

export async function createGalleryItem(input: GalleryInput): Promise<string> {
  const item = sanitize(input)
  await assertAssociationLimit(item)

  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.gallery), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateGalleryItem(id: string, input: GalleryInput): Promise<void> {
  const galleryId = id.trim()
  if (!galleryId) {
    throw new Error('A gallery id is required.')
  }

  const item = sanitize(input)
  const ref = doc(requireDb(), FIRESTORE_COLLECTIONS.gallery, galleryId)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    throw new Error('This gallery image could not be found.')
  }

  await assertAssociationLimit({ ...item, id: galleryId })

  await updateDoc(ref, {
    imageUrl: item.imageUrl,
    publicId: item.publicId,
    title: item.title,
    tourId: item.tourId,
    destinationId: item.destinationId,
    caption: item.caption,
    altText: item.altText,
    published: true,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const galleryId = id.trim()
  if (!galleryId) {
    throw new Error('A gallery id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.gallery, galleryId))
}

const GALLERY_MOSAIC_CLASSES = [
  'lg:col-span-7 lg:row-span-2 min-h-[20rem] lg:min-h-[30rem]',
  'lg:col-span-5 min-h-[16rem] lg:min-h-[30rem]',
  'lg:col-span-4 min-h-[16rem]',
  'lg:col-span-4 min-h-[16rem]',
  'lg:col-span-4 min-h-[16rem]',
  'lg:col-span-6 min-h-[16rem]',
  'lg:col-span-6 min-h-[16rem]',
]

function storedImageTitle(image: { title?: string; caption?: string; altText?: string }): string {
  return image.title?.trim() || image.caption?.trim() || image.altText?.trim() || ''
}

function mosaicClass(index: number): string {
  return GALLERY_MOSAIC_CLASSES[index % GALLERY_MOSAIC_CLASSES.length] ?? 'lg:col-span-4 min-h-[16rem]'
}

type PublicGalleryDraft = {
  id: string
  src: string
  title: string
  alt: string
  caption: string
  tour?: CatalogGalleryItem['tour']
  destination?: CatalogGalleryItem['destination']
}

function mergeGalleryDraft(existing: PublicGalleryDraft, incoming: PublicGalleryDraft): PublicGalleryDraft {
  return {
    ...existing,
    title: existing.title || incoming.title,
    alt: existing.alt || incoming.alt,
    caption: existing.caption || incoming.caption,
    tour: existing.tour ?? incoming.tour,
    destination: existing.destination ?? incoming.destination,
  }
}

function categoriesForDraft(item: PublicGalleryDraft): GalleryCategory[] {
  const categories: GalleryCategory[] = []
  if (item.destination) {
    categories.push('destinations')
  }
  if (item.tour) {
    categories.push('tours')
  }
  return categories
}

export function assemblePublicGallery(params: {
  records: GalleryRecord[]
  tours: Array<{
    id: string
    slug: string
    title: string
    published: boolean
    images: MediaAsset[]
  }>
  destinations: Array<{
    id: string
    slug: string
    name: string
    published: boolean
    gallery: MediaAsset[]
  }>
}): CatalogGalleryItem[] {
  const toursById = new Map(
    params.tours
      .filter((tour) => tour.published && tour.slug.trim())
      .map((tour) => [tour.id, tour]),
  )
  const destinationsById = new Map(
    params.destinations
      .filter((destination) => destination.published && destination.slug.trim())
      .map((destination) => [destination.id, destination]),
  )
  const drafts = new Map<string, PublicGalleryDraft>()
  const urlKeys = new Map<string, string>()

  function upsert(draft: PublicGalleryDraft, key: string) {
    if (!draft.src) {
      return
    }
    const canonical = urlKeys.get(draft.src) ?? key
    const existing = drafts.get(canonical)
    if (existing) {
      drafts.set(canonical, mergeGalleryDraft(existing, draft))
      return
    }
    drafts.set(key, draft)
    urlKeys.set(draft.src, key)
  }

  for (const record of params.records) {
    if (!record.published || !record.imageUrl) {
      continue
    }
    const tour = record.tourId ? toursById.get(record.tourId) : undefined
    const destination = record.destinationId ? destinationsById.get(record.destinationId) : undefined
    const title = storedImageTitle(record)
    upsert(
      {
        id: record.id,
        src: record.imageUrl,
        title,
        alt: record.altText.trim() || title,
        caption: record.caption.trim() || title,
        ...(tour ? { tour: { slug: tour.slug, label: tour.title.trim() } } : {}),
        ...(destination ? { destination: { slug: destination.slug, label: destination.name.trim() } } : {}),
      },
      galleryImageKey(record) || record.imageUrl,
    )
  }

  for (const destination of destinationsById.values()) {
    for (const [index, image] of destination.gallery.entries()) {
      if (!image.imageUrl) {
        continue
      }
      const title = storedImageTitle(image)
      upsert(
        {
          id: `destination-${destination.id}-${galleryImageKey(image) || index}`,
          src: image.imageUrl,
          title,
          alt: image.altText.trim() || title,
          caption: image.caption?.trim() || title,
          destination: { slug: destination.slug, label: destination.name.trim() },
        },
        galleryImageKey(image) || image.imageUrl,
      )
    }
  }

  for (const tour of toursById.values()) {
    for (const [index, image] of tour.images.entries()) {
      if (!image.imageUrl) {
        continue
      }
      const title = storedImageTitle(image)
      upsert(
        {
          id: `tour-${tour.id}-${galleryImageKey(image) || index}`,
          src: image.imageUrl,
          title,
          alt: image.altText.trim() || title,
          caption: image.caption?.trim() || title,
          tour: { slug: tour.slug, label: tour.title.trim() },
        },
        galleryImageKey(image) || image.imageUrl,
      )
    }
  }

  return [...drafts.values()].map((item, index) => {
    const categories = categoriesForDraft(item)
    return {
      id: item.id,
      title: item.title,
      caption: item.caption,
      alt: item.alt,
      src: item.src,
      category: categories[0] ?? 'travel',
      categories,
      gridClass: mosaicClass(index),
      published: true,
      ...(item.tour ? { tour: item.tour } : {}),
      ...(item.destination ? { destination: item.destination } : {}),
    }
  })
}

export async function listPublicGalleryCatalog(): Promise<CatalogGalleryItem[]> {
  const [records, tours, destinations] = await Promise.all([
    listPublishedGalleryItems().catch(() => []),
    listPublishedTours().catch(() => []),
    listPublishedDestinations().catch(() => []),
  ])

  return assemblePublicGallery({ records, tours, destinations })
}

export function associatedTourGalleryImages(
  tourId: string,
  records: GalleryRecord[],
): Array<{ src: string; alt: string; caption?: string }> {
  return records.flatMap((item) => {
    if (item.tourId !== tourId || !item.imageUrl) {
      return []
    }
    const title = storedImageTitle(item)
    return [
      {
        src: item.imageUrl,
        alt: item.altText.trim() || title,
        ...(title ? { caption: title } : {}),
      },
    ]
  })
}
