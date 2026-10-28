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

export type TourItineraryLocation = {
  name: string
  /** Firestore destination document ID when this stop is linked to a destination page. */
  destinationId?: string
}

export type TourItineraryDay = {
  day: number
  title: string
  description: string
  locations: TourItineraryLocation[]
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

/** Recurring annual season. Months are 1-12; endMonth before startMonth wraps past December. */
export type DestinationMonthRange = {
  startMonth: number
  endMonth: number
}

export type DestinationStayUnit = 'morning' | 'evening' | 'days' | 'nights'

/** value is set for days and nights and null for morning and evening. */
export type DestinationStay = {
  unit: DestinationStayUnit
  value: number | null
}

export type DestinationGlanceDetails = {
  bestTimeMonths: DestinationMonthRange | null
  /** Province identifier from config/destinationContent, or empty. */
  province: string
  /** District identifier from config/destinationContent, or empty. */
  district: string
  recommendedStay: DestinationStay | null
  /** Characteristic identifiers from config/destinationContent. */
  characteristics: string[]
  /** Custom label used when the "other" characteristic is selected. */
  characteristicOther: string
  /** Audience labels, e.g. "Couples". */
  idealFor: string[]
}

export type DestinationHighlightItem = {
  id: string
  title: string
  detail: string
  /** Approved Lucide icon identifier, or empty. */
  icon: string
  published: boolean
}

/** Admin-managed destination experience. Display order is the array index. */
export type DestinationExperienceItem = {
  id: string
  title: string
  description: string
  image: MediaAsset | null
  published: boolean
}

/** Reusable custom "Ideal For" label. The document ID is the normalised label. */
export type AudienceCategory = {
  name: string
  createdAt: FirestoreTimestamp
}

export type Destination = {
  name: string
  slug: string
  /** Hero subtitle. */
  subtitle: string
  /** Short introductory description. */
  description: string
  /** Hero image. */
  coverImage: MediaAsset | null
  glance: DestinationGlanceDetails
  essenceThemes: string[]
  overviewTitle: string
  /** Markdown subset rendered by FormattedText. */
  overviewDescription: string
  /** Ordered highlight items. */
  keyHighlights: DestinationHighlightItem[]
  /** Ordered experience cards. Missing on older documents. */
  experiences: DestinationExperienceItem[]
  thingsToDo: string[]
  placesToVisit: string[]
  bestTime: string
  travelInfo: string
  gallery: MediaAsset[]
  relatedTours: string[]
  featured: boolean
  popular: boolean
  published: boolean
  availableForInquiry: boolean
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

export type HeroBenefit = {
  title: string
  description: string
  icon: string
  order: number
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type HeroBenefitsSettings = {
  mobileAutoScrollSpeed: number
  initialized: boolean
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
  /** Required display title. Older documents may only have caption or altText. */
  title: string
  /** Optional tour association. Empty when unassociated. */
  tourId: string
  /** Optional destination association. Empty when unassociated. */
  destinationId: string
  /** Legacy category label. Preserved on older documents. */
  category: string
  caption: string
  altText: string
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
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
  /** Inclusive trip length in calendar days. Missing on older inquiries. */
  estimatedTravelDays?: number
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

export type AboutDistinctionFact = {
  id: string
  icon: string
  title: string
  description: string
}

/** Singleton document at siteSettings/about. Repeatable rows live in subcollections. */
export type AboutPageSettings = {
  heroTitle: string
  heroDescription: string
  heroImage: MediaAsset | null
  distinctionCatchphrase: string
  distinctionDescription: string
  distinctionFacts: AboutDistinctionFact[]
  distinctionFactsConfigured: boolean
  originsPublished: boolean
  originsImage: MediaAsset | null
  originsTitle: string
  originsDescription: string
  /** Historical completed-journey count from before website tracking. Never auto-incremented. */
  journeyBaseline: number
  approachesInitialized: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type AboutTeamMember = {
  name: string
  image: MediaAsset | null
  designation: string
  description: string
  order: number
  published: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type AboutApproach = {
  title: string
  description: string
  order: number
  deleted: boolean
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export type ContactFaq = {
  question: string
  answer: string
  published: boolean
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export const FIRESTORE_COLLECTIONS = {
  admins: 'admins',
  tours: 'tours',
  destinations: 'destinations',
  audienceCategories: 'audienceCategories',
  accommodations: 'accommodations',
  whyTravelerItems: 'whyTravelerItems',
  heroBenefits: 'heroBenefits',
  tags: 'tags',
  vehicles: 'vehicles',
  reviews: 'reviews',
  gallery: 'gallery',
  inquiries: 'inquiries',
  siteSettings: 'siteSettings',
  contactFaqs: 'contactFaqs',
} as const

export type CollectionName = (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS]
