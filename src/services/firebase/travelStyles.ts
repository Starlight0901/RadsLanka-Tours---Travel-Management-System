import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type TravelStyle } from '@/types/models.ts'
import { slugify } from '@/utils/slugify.ts'

export type TravelStyleRecord = TravelStyle & { id: string }

export type TravelStyleInput = {
  name: string
  slug: string
}

const NAME_MAX = 80
const SLUG_MAX = 80
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeTravelStyleName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function toTravelStyle(id: string, data: Record<string, unknown>): TravelStyleRecord {
  return {
    id,
    name: readString(data.name),
    slug: readString(data.slug),
    createdAt: data.createdAt as TravelStyle['createdAt'],
    updatedAt: data.updatedAt as TravelStyle['updatedAt'],
  }
}

function requireStyle(input: TravelStyleInput): TravelStyleInput {
  const name = input.name.trim().replace(/\s+/g, ' ')
  const slug = slugify(input.slug || name)
  if (!name) {
    throw new Error('Enter a travel style name.')
  }
  if (name.length > NAME_MAX) {
    throw new Error(`Keep the travel style name under ${NAME_MAX} characters.`)
  }
  if (!slug || !slugPattern.test(slug)) {
    throw new Error('Use a travel style name that can become a valid slug.')
  }
  if (slug.length > SLUG_MAX) {
    throw new Error(`Keep the travel style slug under ${SLUG_MAX} characters.`)
  }

  return { name, slug }
}

function assertUnique(styles: TravelStyleRecord[], input: TravelStyleInput, ignoreId?: string) {
  const name = normalizeTravelStyleName(input.name)
  const clash = styles.find((style) => {
    if (style.id === ignoreId) {
      return false
    }
    return normalizeTravelStyleName(style.name) === name || style.slug === input.slug
  })
  if (clash) {
    throw new Error('A travel style with this name already exists. Select it from the list.')
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

export async function listAllTravelStyles(): Promise<TravelStyleRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.travelStyles))

  return snapshot.docs
    .map((item) => toTravelStyle(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createTravelStyle(input: TravelStyleInput): Promise<string> {
  const style = requireStyle(input)
  const existing = await listAllTravelStyles()
  assertUnique(existing, style)

  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.travelStyles), {
    ...style,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateTravelStyle(id: string, input: TravelStyleInput): Promise<void> {
  const styleId = id.trim()
  if (!styleId) {
    throw new Error('A travel style id is required.')
  }

  const style = requireStyle(input)
  const existing = await listAllTravelStyles()
  assertUnique(existing, style, styleId)

  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.travelStyles, styleId), {
    ...style,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTravelStyle(id: string): Promise<void> {
  const styleId = id.trim()
  if (!styleId) {
    throw new Error('A travel style id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.travelStyles, styleId))
}
