import { mockDestinations } from '@/data/destinations.ts'
import { mockReviews } from '@/data/reviews.ts'
import { listPublishedTours } from '@/data/tourCatalog.ts'
import type { CatalogDestination } from '@/types/destinations.ts'
import type { CatalogReview, CatalogTour } from '@/types/tours.ts'

export function listPublishedDestinations(): CatalogDestination[] {
  return mockDestinations.filter((destination) => destination.published)
}

export function getDestinationBySlug(slug: string): CatalogDestination | undefined {
  return listPublishedDestinations().find((destination) => destination.slug === slug)
}

export function getToursForDestination(destinationId: string): CatalogTour[] {
  return listPublishedTours().filter((tour) => tour.destinationIds.includes(destinationId))
}

export function getPublishedReviewsForDestination(destinationId: string): CatalogReview[] {
  return mockReviews.filter(
    (review) => review.status === 'approved' && (review.destinationIds ?? []).includes(destinationId),
  )
}

export const destinationRegionJumps = [
  { id: 'all', label: 'All regions' },
  { id: 'sigiriya', label: 'Cultural Triangle' },
  { id: 'nuwara-eliya', label: 'Tea Country' },
  { id: 'yala-minneriya', label: 'Wildlife' },
  { id: 'galle-coast', label: 'Southern Coast' },
  { id: 'kandy', label: 'Kandy' },
] as const
