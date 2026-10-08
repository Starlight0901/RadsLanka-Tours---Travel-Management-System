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

export type TourItineraryDay = {
  day: number
  title: string
  description: string
  locations: string[]
}

export type TourPricingBasis = 'per_person' | 'for_2' | 'for_4' | 'custom'

export type Tour = {
  title: string
  slug: string
  description: string
  duration: string
  price: number
  pricingBasis: TourPricingBasis
  pricingCustomLabel: string
  travelStyleId: string
  destinations: string[]
  accommodationIds: string[]
  tagIds: string[]
  itinerary: TourItineraryDay[]
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

export type TravelStyle = {
  name: string
  slug: string
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type TourTag = {
  name: string
  slug: string
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type WhyTravelerItem = {
  title: string
  description: string
  icon: string
  published: boolean
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type Accommodation = {
  name: string
  description: string
  type: string
  location: string
  images: MediaAsset[]
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type Vehicle = {
  name: string
  type: string
  description: string
  passengerCapacity: number
  luggageCapacity: string
  airConditioning: boolean
  features: string[]
  images: MediaAsset[]
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Review = {
  travelerName: string
  email: string
  country: string
  rating: number
  review: string
  photo: MediaAsset | null
  tourId: string
  travelDate: string
  status: ReviewStatus
  featured: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
  publishedAt: FirestoreTimestamp | null
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

export type HeroTextStyle = 'eyebrow' | 'title' | 'subtitle'

export type HeroTextBlock = {
  text: string
  style: HeroTextStyle
}

export type HomepageHeroContent = {
  heroTextBlocks: HeroTextBlock[]
  heroDescription: string
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
  heroTextBlocks: HeroTextBlock[]
  heroDescription: string
  footer: string
}

export const FIRESTORE_COLLECTIONS = {
  admins: 'admins',
  tours: 'tours',
  destinations: 'destinations',
  accommodations: 'accommodations',
  whyTravelerItems: 'whyTravelerItems',
  tags: 'tags',
  travelStyles: 'travelStyles',
  vehicles: 'vehicles',
  reviews: 'reviews',
  gallery: 'gallery',
  inquiries: 'inquiries',
  siteSettings: 'siteSettings',
} as const

export type CollectionName = (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS]
