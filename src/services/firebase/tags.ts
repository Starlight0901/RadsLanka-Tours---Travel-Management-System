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
import { FIRESTORE_COLLECTIONS, type TourTag } from '@/types/models.ts'
import { slugify } from '@/utils/slugify.ts'

export type TagRecord = TourTag & { id: string }

export type TagInput = {
  name: string
  slug: string
}

const NAME_MAX = 60
const SLUG_MAX = 80
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toTag(id: string, data: Record<string, unknown>): TagRecord {
  return {
    id,
    name: readString(data.name),
    slug: readString(data.slug),
    createdAt: data.createdAt as TourTag['createdAt'],
    updatedAt: data.updatedAt as TourTag['updatedAt'],
  }
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

function requireTag(input: TagInput): TagInput {
  const name = input.name.trim()
  const slug = slugify(input.slug || name)
  if (!name) {
    throw new Error('Enter a tag name.')
  }
  if (name.length > NAME_MAX) {
    throw new Error(`Keep the tag name under ${NAME_MAX} characters.`)
  }
  if (!slug || !slugPattern.test(slug)) {
    throw new Error('Use a tag name that can become a valid slug.')
  }
  if (slug.length > SLUG_MAX) {
    throw new Error(`Keep the tag slug under ${SLUG_MAX} characters.`)
  }

  return { name, slug }
}

function assertUnique(tags: TagRecord[], input: TagInput, ignoreId?: string) {
  const name = normalizeName(input.name)
  const clash = tags.find((tag) => {
    if (tag.id === ignoreId) {
      return false
    }
    return normalizeName(tag.name) === name || tag.slug === input.slug
  })
  if (clash) {
    throw new Error('A tag with this name already exists.')
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

export async function listAllTags(): Promise<TagRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.tags))

  return snapshot.docs
    .map((item) => toTag(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createTag(input: TagInput): Promise<string> {
  const tag = requireTag(input)
  const existing = await listAllTags()
  assertUnique(existing, tag)

  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.tags), {
    ...tag,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateTag(id: string, input: TagInput): Promise<void> {
  const tagId = id.trim()
  if (!tagId) {
    throw new Error('A tag id is required.')
  }

  const tag = requireTag(input)
  const existing = await listAllTags()
  assertUnique(existing, tag, tagId)

  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.tags, tagId), {
    ...tag,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTag(id: string): Promise<void> {
  const tagId = id.trim()
  if (!tagId) {
    throw new Error('A tag id is required.')
  }

  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.tags, tagId))
}
