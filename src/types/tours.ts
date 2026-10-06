export type TourImage = {
  alt: string
  caption?: string
  src?: string
}

export type TourHighlight = {
  title: string
  description: string
  icon: string
}

export type TourItineraryDay = {
  day: number
  title: string
  summary: string
  stay?: string
  meals?: string
}

export type TourPracticalNote = {
  title: string
  body: string
}

export type CatalogTour = {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  duration: string
  durationDays: number
  priceLabel?: string
  priceNote?: string
  journeyStyle?: string
  accommodation?: string
  routeLabel?: string
  routeSummary?: string
  kicker?: string
  tags: string[]
  category: string
  featured?: boolean
  featuredLabel?: string
  images: TourImage[]
  highlights: TourHighlight[]
  itinerary: TourItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  practicalNotes: TourPracticalNote[]
  destinationIds: string[]
  relatedTourIds: string[]
  published: boolean
}

export type ReviewStatus = 'approved' | 'pending' | 'rejected'

export type CatalogReview = {
  id: string
  tourId?: string
  destinationIds?: string[]
  travelerName: string
  country?: string
  dateLabel?: string
  rating: number
  title?: string
  review: string
  chauffeurName?: string
  tags?: string[]
  photoAlt?: string
  status: ReviewStatus
  published: boolean
}
