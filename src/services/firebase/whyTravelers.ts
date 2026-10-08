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
import { FIRESTORE_COLLECTIONS, type WhyTravelerItem } from '@/types/models.ts'

export type WhyTravelerRecord = WhyTravelerItem & { id: string }

export type WhyTravelerInput = {
  title: string
  description: string
  icon: string
  published: boolean
  order: number
}

const TITLE_MAX = 80
const DESCRIPTION_MAX = 400
const ICON_MAX = 40

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toItem(id: string, data: Record<string, unknown>): WhyTravelerRecord {
  const order = typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0

  return {
    id,
    title: readString(data.title),
    description: readString(data.description),
    icon: readString(data.icon),
    published: data.published === true,
    order,
    createdAt: data.createdAt as WhyTravelerItem['createdAt'],
    updatedAt: data.updatedAt as WhyTravelerItem['updatedAt'],
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function sanitize(input: WhyTravelerInput): WhyTravelerInput {
  const title = input.title.trim()
  const description = input.description.trim()
  const icon = input.icon.trim()

  if (!title) {
    throw new Error('Enter a title.')
  }
  if (title.length > TITLE_MAX) {
    throw new Error(`Keep the title under ${TITLE_MAX} characters.`)
  }
  if (!description) {
    throw new Error('Enter a description.')
  }
  if (description.length > DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${DESCRIPTION_MAX} characters.`)
  }
  if (icon.length > ICON_MAX) {
    throw new Error(`Keep the icon name under ${ICON_MAX} characters.`)
  }
  if (!Number.isFinite(input.order)) {
    throw new Error('Enter a valid order.')
  }

  return {
    title,
    description,
    icon,
    published: input.published === true,
    order: input.order,
  }
}

function byOrder(a: WhyTravelerRecord, b: WhyTravelerRecord) {
  if (a.order !== b.order) {
    return a.order - b.order
  }
  return a.title.localeCompare(b.title)
}

export async function listAllWhyTravelerItems(): Promise<WhyTravelerRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.whyTravelerItems))
  return snapshot.docs.map((item) => toItem(item.id, item.data())).sort(byOrder)
}

export async function listPublishedWhyTravelerItems(): Promise<WhyTravelerRecord[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), FIRESTORE_COLLECTIONS.whyTravelerItems), where('published', '==', true)),
  )
  return snapshot.docs.map((item) => toItem(item.id, item.data())).sort(byOrder)
}

export async function createWhyTravelerItem(input: WhyTravelerInput): Promise<string> {
  const item = sanitize(input)
  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.whyTravelerItems), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateWhyTravelerItem(id: string, input: WhyTravelerInput): Promise<void> {
  const itemId = id.trim()
  if (!itemId) {
    throw new Error('An item id is required.')
  }

  const item = sanitize(input)
  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.whyTravelerItems, itemId), {
    ...item,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWhyTravelerItem(id: string): Promise<void> {
  const itemId = id.trim()
  if (!itemId) {
    throw new Error('An item id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.whyTravelerItems, itemId))
}
