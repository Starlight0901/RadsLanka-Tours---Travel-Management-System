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
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type ContactFaq } from '@/types/models.ts'

export type ContactFaqRecord = ContactFaq & { id: string }

export type ContactFaqInput = {
  question: string
  answer: string
  published: boolean
  order: number
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function faqsCollection() {
  return collection(requireDb(), FIRESTORE_COLLECTIONS.contactFaqs)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toItem(id: string, data: Record<string, unknown>): ContactFaqRecord {
  const order = typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0

  return {
    id,
    question: readString(data.question),
    answer: readString(data.answer),
    published: data.published === true,
    order,
    createdAt: data.createdAt as ContactFaq['createdAt'],
    updatedAt: data.updatedAt as ContactFaq['updatedAt'],
  }
}

function byOrder(a: ContactFaqRecord, b: ContactFaqRecord) {
  if (a.order !== b.order) {
    return a.order - b.order
  }
  return a.question.localeCompare(b.question)
}

function requireId(id: string): string {
  const value = id.trim()
  if (!value) {
    throw new Error('An FAQ id is required.')
  }
  return value
}

function sanitize(input: ContactFaqInput): ContactFaqInput {
  const question = input.question.trim()
  const answer = input.answer.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  if (!question) {
    throw new Error('Enter a question.')
  }
  if (!answer) {
    throw new Error('Enter an answer.')
  }
  if (!Number.isFinite(input.order)) {
    throw new Error('Enter a valid display order.')
  }

  return {
    question,
    answer,
    published: input.published === true,
    order: Math.floor(input.order),
  }
}

export async function listAllContactFaqs(): Promise<ContactFaqRecord[]> {
  const snapshot = await getDocs(faqsCollection())
  return snapshot.docs.map((item) => toItem(item.id, item.data())).sort(byOrder)
}

export async function listPublishedContactFaqs(): Promise<ContactFaqRecord[]> {
  const snapshot = await getDocs(query(faqsCollection(), where('published', '==', true)))
  return snapshot.docs.map((item) => toItem(item.id, item.data())).sort(byOrder)
}

export async function createContactFaq(input: ContactFaqInput): Promise<string> {
  const item = sanitize(input)
  const ref = await addDoc(faqsCollection(), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateContactFaq(id: string, input: ContactFaqInput): Promise<void> {
  await updateDoc(doc(faqsCollection(), requireId(id)), {
    ...sanitize(input),
    updatedAt: serverTimestamp(),
  })
}

export async function setContactFaqPublished(id: string, published: boolean): Promise<void> {
  await updateDoc(doc(faqsCollection(), requireId(id)), {
    published: published === true,
    updatedAt: serverTimestamp(),
  })
}

export async function reorderContactFaqs(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(requireDb())
  orderedIds.forEach((id, index) => {
    batch.update(doc(faqsCollection(), id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export async function deleteContactFaq(id: string): Promise<void> {
  await deleteDoc(doc(faqsCollection(), requireId(id)))
}
