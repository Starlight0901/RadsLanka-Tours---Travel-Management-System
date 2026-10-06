import { mockReviews } from '@/data/reviews.ts'
import type { CatalogReview } from '@/types/tours.ts'

export function isApprovedReview(review: CatalogReview) {
  return review.status === 'approved'
}

export function listApprovedReviews(): CatalogReview[] {
  return mockReviews.filter(isApprovedReview)
}

export const reviewExperienceFilters = [
  { value: 'all', label: 'All experiences' },
  { value: 'Hill country', label: 'Hill country' },
  { value: 'Solo travel', label: 'Solo travel' },
  { value: 'Honeymoon', label: 'Honeymoon' },
  { value: 'Wildlife', label: 'Wildlife' },
  { value: 'Heritage', label: 'Heritage' },
] as const

export function filterApprovedReviews(query: string, tag: string): CatalogReview[] {
  const needle = query.trim().toLowerCase()
  return listApprovedReviews().filter((review) => {
    const matchesTag = tag === 'all' || (review.tags ?? []).includes(tag)
    const haystack = [
      review.travelerName,
      review.title,
      review.review,
      review.chauffeurName,
      ...(review.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return matchesTag && (!needle || haystack.includes(needle))
  })
}
