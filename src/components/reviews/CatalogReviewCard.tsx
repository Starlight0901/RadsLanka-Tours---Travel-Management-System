import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import type { CatalogReview } from '@/types/tours.ts'

export type CatalogReviewCardProps = {
  review: CatalogReview
  showTour?: boolean
  showDestinations?: boolean
  clampText?: boolean
}

export function CatalogReviewCard({
  review,
  showTour = true,
  showDestinations = true,
  clampText = false,
}: CatalogReviewCardProps) {
  return (
    <ReviewCard
      travelerName={review.travelerName}
      country={review.country}
      dateLabel={review.dateLabel}
      rating={review.rating}
      title={review.title}
      review={review.review}
      chauffeurName={review.chauffeurName}
      tourTitle={showTour ? review.tourTitle : undefined}
      destinationNames={showDestinations ? review.destinationNames : undefined}
      photoAlt={review.photoAlt}
      clampText={clampText}
    />
  )
}
