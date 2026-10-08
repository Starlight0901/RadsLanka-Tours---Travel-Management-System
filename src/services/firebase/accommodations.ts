import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type Accommodation, type MediaAsset } from '@/types/models.ts'

export type AccommodationRecord = Accommodation & { id: string }

export type AccommodationInput = Omit<Accommodation, 'createdAt' | 'updatedAt'>

const NAME_MAX = 120
const DESCRIPTION_MAX = 2000
const TYPE_MAX = 80
const LOCATION_MAX = 160

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
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

function toAccommodation(id: string, data: Record<string, unknown>): AccommodationRecord {
  return {
    id,
    name: readString(data.name),
    description: readString(data.description),
    type: readString(data.type),
    location: readString(data.location),
    images: readImages(data.images),
    published: data.published === true,
    createdAt: data.createdAt as Accommodation['createdAt'],
    updatedAt: data.updatedAt as Accommodation['updatedAt'],
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

function sanitizeImage(image: MediaAsset): MediaAsset {
  const altText = image.altText.trim()
  if (!image.imageUrl.trim() || !image.publicId.trim()) {
    throw new Error('Each image needs a Cloudinary upload.')
  }
  if (!altText) {
    throw new Error('Enter alt text for each image.')
  }
  if (altText.length > 300) {
    throw new Error('Keep each image alt text under 300 characters.')
  }

  const stored: MediaAsset = {
    imageUrl: image.imageUrl.trim(),
    publicId: image.publicId.trim(),
    altText,
  }
  const caption = image.caption?.trim()
  if (caption) {
    if (caption.length > 500) {
      throw new Error('Keep each image caption under 500 characters.')
    }
    stored.caption = caption
  }

  return stored
}

function sanitizeAccommodationInput(input: AccommodationInput): AccommodationInput {
  const description = input.description.trim()
  if (description.length > DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${DESCRIPTION_MAX} characters.`)
  }

  return {
    name: requireText(input.name, 'accommodation name', NAME_MAX),
    description,
    type: requireText(input.type, 'accommodation type', TYPE_MAX),
    location: requireText(input.location, 'location', LOCATION_MAX),
    images: input.images.map(sanitizeImage),
    published: input.published === true,
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

export async function listAllAccommodations(): Promise<AccommodationRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.accommodations))

  return snapshot.docs
    .map((item) => toAccommodation(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listPublishedAccommodations(): Promise<AccommodationRecord[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), FIRESTORE_COLLECTIONS.accommodations), where('published', '==', true)),
  )

  return snapshot.docs
    .map((item) => toAccommodation(item.id, item.data()))
    .filter((item) => item.published)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createAccommodation(input: AccommodationInput): Promise<string> {
  const accommodation = sanitizeAccommodationInput(input)
  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.accommodations), {
    ...accommodation,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateAccommodation(id: string, input: AccommodationInput): Promise<void> {
  const accommodationId = id.trim()
  if (!accommodationId) {
    throw new Error('An accommodation id is required.')
  }

  const accommodation = sanitizeAccommodationInput(input)
  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.accommodations, accommodationId), {
    ...accommodation,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteAccommodation(id: string): Promise<void> {
  const accommodationId = id.trim()
  if (!accommodationId) {
    throw new Error('An accommodation id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.accommodations, accommodationId))
}
