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
import { FIRESTORE_COLLECTIONS, type Destination } from '@/types/models.ts'
import { db } from '@/services/firebase/firestore.ts'

export type DestinationRecord = Destination & { id: string }

function toDestination(id: string, data: Record<string, unknown>): DestinationRecord {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : '',
    slug: typeof data.slug === 'string' ? data.slug : '',
    description: typeof data.description === 'string' ? data.description : '',
    coverImage: (data.coverImage as Destination['coverImage']) ?? null,
    thingsToDo: Array.isArray(data.thingsToDo) ? (data.thingsToDo as string[]) : [],
    placesToVisit: Array.isArray(data.placesToVisit) ? (data.placesToVisit as string[]) : [],
    bestTime: typeof data.bestTime === 'string' ? data.bestTime : '',
    travelInfo: typeof data.travelInfo === 'string' ? data.travelInfo : '',
    gallery: Array.isArray(data.gallery) ? (data.gallery as Destination['gallery']) : [],
    relatedTours: Array.isArray(data.relatedTours) ? (data.relatedTours as string[]) : [],
    published: data.published === true,
    availableForInquiry: data.availableForInquiry === true,
    createdAt: data.createdAt as Destination['createdAt'],
    updatedAt: data.updatedAt as Destination['updatedAt'],
  }
}

export async function listInquiryDestinations(): Promise<DestinationRecord[]> {
  if (!db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, FIRESTORE_COLLECTIONS.destinations),
      where('availableForInquiry', '==', true),
    ),
  )

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listAllDestinations(): Promise<DestinationRecord[]> {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.destinations))

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listPublishedDestinations(): Promise<DestinationRecord[]> {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.destinations), where('published', '==', true)),
  )

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .filter((destination) => destination.published)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createDestination(input: {
  name: string
  slug: string
  published: boolean
  availableForInquiry: boolean
}): Promise<string> {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.destinations), {
    name: input.name,
    slug: input.slug,
    description: '',
    coverImage: null,
    thingsToDo: [],
    placesToVisit: [],
    bestTime: '',
    travelInfo: '',
    gallery: [],
    relatedTours: [],
    published: input.published,
    availableForInquiry: input.availableForInquiry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateDestination(
  id: string,
  input: {
    name: string
    slug: string
    published: boolean
    availableForInquiry: boolean
  },
): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.destinations, id), {
    name: input.name,
    slug: input.slug,
    published: input.published,
    availableForInquiry: input.availableForInquiry,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteDestination(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.destinations, id))
}
