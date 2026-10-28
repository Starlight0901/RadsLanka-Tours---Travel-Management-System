import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/types/models.ts'
import { db } from '@/services/firebase/firestore.ts'

export type CustomTourInquiryInput = {
  name: string
  email: string
  phone: string
  travelDate: string
  returnDate: string
  travellers: number
  destinations: string[]
  destinationIds: string[]
  otherDestination?: string
  message: string
}

export type GeneralInquiryInput = {
  name: string
  email: string
  phone: string
  travelDate?: string
  returnDate?: string
  estimatedTravelDays?: number
  interests?: string[]
  message: string
}

export async function createGeneralInquiry(input: GeneralInquiryInput): Promise<string> {
  if (!db) {
    throw new Error('Firebase is not configured. Add your .env.local values first.')
  }

  const payload: Record<string, unknown> = {
    type: 'general',
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    status: 'New',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (input.travelDate) {
    payload.travelDate = input.travelDate
  }
  if (input.returnDate) {
    payload.returnDate = input.returnDate
  }
  if (
    typeof input.estimatedTravelDays === 'number' &&
    Number.isInteger(input.estimatedTravelDays) &&
    input.estimatedTravelDays >= 1 &&
    input.estimatedTravelDays <= 400
  ) {
    payload.estimatedTravelDays = input.estimatedTravelDays
  }
  if (input.interests && input.interests.length > 0) {
    payload.interests = input.interests
  }

  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.inquiries), payload)
  return ref.id
}

export async function createCustomTourInquiry(input: CustomTourInquiryInput): Promise<string> {
  if (!db) {
    throw new Error('Firebase is not configured. Add your .env.local values first.')
  }

  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.inquiries), {
    type: 'custom_tour',
    name: input.name,
    email: input.email,
    phone: input.phone,
    travelDate: input.travelDate,
    returnDate: input.returnDate,
    travellers: input.travellers,
    destinations: input.destinations,
    destinationIds: input.destinationIds,
    otherDestination: input.otherDestination ?? '',
    message: input.message,
    status: 'New',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}
