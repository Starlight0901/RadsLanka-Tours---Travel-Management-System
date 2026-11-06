import { mockReviews } from '@/data/reviews.ts'
import type { CatalogReview } from '@/types/tours.ts'

export function isApprovedReview(review: CatalogReview) {
  return review.status === 'approved'
}

export function listApprovedReviews(): CatalogReview[] {
  return mockReviews.filter(isApprovedReview)
}

/**
 * Overall score for the public reviews heading.
 * Catalog reviews are still placeholders and Firestore reviews are not wired,
 * so this stays empty instead of presenting a fabricated rating.
 */
export function overallPublishedRating(): number | null {
  return null
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
  return filterCatalogReviews(listApprovedReviews(), query, tag)
}

export function filterCatalogReviews(reviews: CatalogReview[], query: string, tag: string): CatalogReview[] {
  const needle = query.trim().toLowerCase()
  return reviews.filter((review) => {
    const destinationNames = review.destinationNames ?? []
    const matchesTag =
      tag === 'all' || (review.tags ?? []).includes(tag) || destinationNames.includes(tag) || review.tourTitle === tag
    const haystack = [
      review.travelerName,
      review.title,
      review.review,
      review.chauffeurName,
      review.tourTitle,
      ...(review.tags ?? []),
      ...destinationNames,
    ]
      .join(' ')
      .toLowerCase()
    return matchesTag && (!needle || haystack.includes(needle))
  })
}
