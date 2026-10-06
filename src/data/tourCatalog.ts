import { mockReviews } from '@/data/reviews.ts'
import { mockTours } from '@/data/tours.ts'
import type { CatalogReview, CatalogTour } from '@/types/tours.ts'

export function listPublishedTours(): CatalogTour[] {
  return mockTours.filter((tour) => tour.published)
}

export function getTourBySlug(slug: string): CatalogTour | undefined {
  return listPublishedTours().find((tour) => tour.slug === slug)
}

export function getTourById(id: string): CatalogTour | undefined {
  return listPublishedTours().find((tour) => tour.id === id)
}

export function getRelatedTours(tour: CatalogTour): CatalogTour[] {
  return tour.relatedTourIds
    .map((id) => getTourById(id))
    .filter((item): item is CatalogTour => Boolean(item))
}

export function getPublishedReviewsForTour(tourId: string): CatalogReview[] {
  return mockReviews.filter((review) => review.status === 'approved' && review.tourId === tourId)
}

export const tourCategories = ['All', 'Heritage', 'Wildlife', 'Coast', 'Tea Country'] as const

export const tourDurationFilters = [
  { value: 'all', label: 'All Durations' },
  { value: '1-6', label: 'Up to 6 days' },
  { value: '7-10', label: '7–10 days' },
  { value: '11+', label: '11+ days' },
] as const

export const tourRegionFilters = [
  { value: 'all', label: 'All Regions' },
  { value: 'sigiriya', label: 'Cultural Triangle' },
  { value: 'nuwara-eliya', label: 'Tea Country' },
  { value: 'yala-minneriya', label: 'National Parks' },
  { value: 'galle-coast', label: 'Southern Coast' },
] as const

export const tourStyleFilters = [
  { value: 'all', label: 'All Travel Styles' },
  { value: 'Heritage', label: 'Heritage' },
  { value: 'Wildlife', label: 'Wildlife' },
  { value: 'Coast', label: 'Coast' },
  { value: 'Tea Country', label: 'Tea Country' },
] as const

export const tourQuickFilters = ['Wildlife', 'Tea Country', 'Coast'] as const

export type TourListFilters = {
  query: string
  duration: string
  region: string
  style: string
  quick: string
  sort: 'featured' | 'duration'
}

export const defaultTourListFilters: TourListFilters = {
  query: '',
  duration: 'all',
  region: 'all',
  style: 'all',
  quick: '',
  sort: 'featured',
}

function matchesDuration(tour: CatalogTour, duration: string) {
  if (duration === 'all') return true
  if (duration === '1-6') return tour.durationDays <= 6
  if (duration === '7-10') return tour.durationDays >= 7 && tour.durationDays <= 10
  if (duration === '11+') return tour.durationDays >= 11
  return true
}

export function filterPublishedTours(filters: TourListFilters): CatalogTour[] {
  const query = filters.query.trim().toLowerCase()

  const matches = listPublishedTours().filter((tour) => {
    const haystack = [tour.title, tour.shortDescription, tour.routeLabel, ...tour.tags, ...tour.destinationIds]
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query || haystack.includes(query)
    const matchesRegion =
      filters.region === 'all' ||
      tour.destinationIds.includes(filters.region) ||
      (filters.region === 'nuwara-eliya' && tour.destinationIds.includes('ella'))
    const matchesStyle = filters.style === 'all' || tour.category === filters.style
    const matchesQuick = !filters.quick || tour.category === filters.quick || tour.tags.includes(filters.quick)
    return matchesQuery && matchesDuration(tour, filters.duration) && matchesRegion && matchesStyle && matchesQuick
  })

  return [...matches].sort((a, b) => {
    if (filters.sort === 'duration') {
      return a.durationDays - b.durationDays
    }
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  })
}
