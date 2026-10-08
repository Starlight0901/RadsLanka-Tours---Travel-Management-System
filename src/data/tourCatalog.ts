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
  tags: string[]
  budget: string
  sort: 'featured' | 'duration'
}

export const defaultTourListFilters: TourListFilters = {
  query: '',
  duration: 'all',
  region: 'all',
  style: 'all',
  quick: '',
  tags: [],
  budget: 'all',
  sort: 'featured',
}

export const tourBudgetFilters = [
  { value: 'all', label: 'Any budget' },
  { value: 'under-150', label: 'Under LKR 150,000' },
  { value: '150-400', label: 'LKR 150,000 – 400,000' },
  { value: '400-800', label: 'LKR 400,000 – 800,000' },
  { value: '800-plus', label: 'LKR 800,000+' },
] as const

function matchesBudget(price: number | undefined, budget: string) {
  if (budget === 'all') return true
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return false
  if (budget === 'under-150') return price < 150_000
  if (budget === '150-400') return price >= 150_000 && price < 400_000
  if (budget === '400-800') return price >= 400_000 && price < 800_000
  if (budget === '800-plus') return price >= 800_000
  return true
}

function matchesDuration(tour: CatalogTour, duration: string) {
  if (duration === 'all') return true
  if (duration === '1-6') return tour.durationDays <= 6
  if (duration === '7-10') return tour.durationDays >= 7 && tour.durationDays <= 10
  if (duration === '11+') return tour.durationDays >= 11
  return true
}

export function filterTours(tours: CatalogTour[], filters: TourListFilters): CatalogTour[] {
  const query = filters.query.trim().toLowerCase()

  const matches = tours.filter((tour) => {
    const haystack = [
      tour.title,
      tour.shortDescription,
      tour.fullDescription,
      tour.routeLabel,
      tour.travelStyle,
      ...(tour.destinationNames ?? []),
      ...tour.tags,
      ...tour.destinationIds,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query || haystack.includes(query)
    const selectedTags = filters.tags.map((tag) => tag.toLowerCase())
    const matchesTags =
      selectedTags.length === 0 || tour.tags.some((tag) => selectedTags.includes(tag.toLowerCase()))
    const matchesRegion =
      filters.region === 'all' ||
      tour.destinationIds.includes(filters.region) ||
      (filters.region === 'nuwara-eliya' && tour.destinationIds.includes('ella'))
    const selectedStyle = filters.style.trim().toLowerCase()
    const matchesStyle =
      selectedStyle === 'all' ||
      tour.category.toLowerCase() === selectedStyle ||
      (tour.travelStyle ?? '').toLowerCase() === selectedStyle
    const matchesQuick =
      !filters.quick ||
      tour.category === filters.quick ||
      tour.tags.some((tag) => tag.toLowerCase() === filters.quick.toLowerCase())
    return (
      matchesQuery &&
      matchesTags &&
      matchesDuration(tour, filters.duration) &&
      matchesRegion &&
      matchesStyle &&
      matchesQuick &&
      matchesBudget(tour.price, filters.budget)
    )
  })

  return [...matches].sort((a, b) => {
    if (filters.sort === 'duration') {
      return a.durationDays - b.durationDays
    }
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  })
}

export function filterPublishedTours(filters: TourListFilters): CatalogTour[] {
  return filterTours(listPublishedTours(), filters)
}
