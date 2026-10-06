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
