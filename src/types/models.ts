import type { Timestamp } from 'firebase/firestore'

export type FirestoreTimestamp = Timestamp

export type MediaAsset = {
  imageUrl: string
  publicId: string
  altText: string
  caption?: string
}

export type AdminRole = 'owner' | 'admin'

export type AdminProfile = {
  email: string
  displayName: string
  role: AdminRole
  createdAt: FirestoreTimestamp
}

export type Tour = {
  title: string
  slug: string
  description: string
  duration: string
  price: number
  destinations: string[]
  itinerary: string[]
  included: string[]
  excluded: string[]
  images: MediaAsset[]
  featured: boolean
  popular: boolean
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type Destination = {
  name: string
  slug: string
  description: string
  coverImage: MediaAsset | null
  thingsToDo: string[]
  placesToVisit: string[]
  bestTime: string
  travelInfo: string
  gallery: MediaAsset[]
  relatedTours: string[]
  published: boolean
  availableForInquiry: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type Vehicle = {
  name: string
  type: string
  description: string
  passengerCapacity: number
  luggageCapacity: string
  features: string[]
  images: MediaAsset[]
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type Review = {
  travelerName: string
  country: string
  rating: number
  review: string
  photo: MediaAsset | null
  tourId: string
  date: FirestoreTimestamp
  published: boolean
  featured: boolean
}

export type GalleryItem = {
  imageUrl: string
  publicId: string
  category: string
  caption: string
  altText: string
  published: boolean
  createdAt: FirestoreTimestamp
}

export type InquiryType = 'package_tour' | 'custom_tour' | 'general'

export type InquiryStatus = 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Closed'

export type Inquiry = {
  type: InquiryType
  name: string
  email: string
  phone: string
  travelDate?: string
  returnDate?: string
  travellers?: number
  adults?: number
  children?: number
  country?: string
  tourId?: string
  destinations?: string[]
  destinationIds?: string[]
  otherDestination?: string
  interests?: string[]
  budget?: string
  accommodation?: string
  vehiclePreference?: string
  message: string
  status: InquiryStatus
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type SiteSettings = {
  logo: MediaAsset | null
  phone: string
  whatsapp: string
  email: string
  address: string
  socialLinks: {
    facebook?: string
    instagram?: string
    youtube?: string
  }
  heroText: string
  footer: string
}

export const FIRESTORE_COLLECTIONS = {
  admins: 'admins',
  tours: 'tours',
  destinations: 'destinations',
  vehicles: 'vehicles',
  reviews: 'reviews',
  gallery: 'gallery',
  inquiries: 'inquiries',
  siteSettings: 'siteSettings',
} as const

export type CollectionName = (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS]
