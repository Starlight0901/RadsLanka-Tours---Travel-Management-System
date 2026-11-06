import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { FormTextarea } from '@/components/forms/FormTextarea.tsx'
import { SearchableMultiSelect } from '@/components/forms/SearchableMultiSelect.tsx'
import { SearchableSelectField } from '@/components/forms/SearchableSelectField.tsx'
import { StarRatingInput } from '@/components/forms/StarRatingInput.tsx'
import { Button, ButtonLink } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { paths } from '@/routes/paths.ts'
import { listPublishedDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import {
  createPublicReview,
  isValidReviewRating,
  REVIEW_DESTINATION_IDS_MAX,
  REVIEW_NAME_MAX,
  REVIEW_TEXT_MAX,
} from '@/services/firebase/reviews.ts'
import { listPublishedTours, type TourRecord } from '@/services/firebase/tours.ts'

const reviewSchema = z
  .object({
    tourId: z.string().trim().min(1, 'Select the tour you experienced.'),
    destinationIds: z.array(z.string()),
    rating: z.number(),
    reviewerName: z
      .string()
      .trim()
      .min(1, 'Enter your name.')
      .max(REVIEW_NAME_MAX, `Keep your name under ${REVIEW_NAME_MAX} characters.`),
    reviewText: z
      .string()
      .trim()
      .min(1, 'Enter your review.')
      .max(REVIEW_TEXT_MAX, `Keep your review under ${REVIEW_TEXT_MAX} characters.`),
  })
  .superRefine((value, context) => {
    if (!isValidReviewRating(value.rating)) {
      context.addIssue({
        code: 'custom',
        path: ['rating'],
        message: 'Choose a rating from 1 to 5 stars.',
      })
    }
  })

type ReviewValues = {
  tourId: string
  destinationIds: string[]
  rating: number
  reviewerName: string
  reviewText: string
}

const emptyValues: ReviewValues = {
  tourId: '',
  destinationIds: [],
  rating: 0,
  reviewerName: '',
  reviewText: '',
}

export function ReviewForm() {
  const [tours, setTours] = useState<TourRecord[]>([])
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [optionsLoading, setOptionsLoading] = useState(isFirebaseConfigured)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: emptyValues,
  })

  const loadOptions = useCallback(async () => {
    if (!isFirebaseConfigured) {
      return
    }

    setOptionsLoading(true)
    setLoadError(null)
    try {
      const [nextTours, nextDestinations] = await Promise.all([
        listPublishedTours(),
        listPublishedDestinations(),
      ])
      setTours(nextTours)
      setDestinations(nextDestinations)
    } catch {
      setLoadError('Tours and destinations could not be loaded. Please try again.')
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOptions()
  }, [loadOptions])

  async function onSubmit(values: ReviewValues) {
    setSubmitError(null)
    try {
      await createPublicReview({
        reviewerName: values.reviewerName,
        tourId: values.tourId,
        destinationIds: values.destinationIds,
        rating: values.rating,
        reviewText: values.reviewText,
      })
      reset(emptyValues)
      setSuccess(true)
    } catch (error) {
      setSuccess(false)
      setSubmitError(error instanceof Error && error.message ? error.message : 'Unable to submit your review.')
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <ErrorState
        title="Reviews are unavailable"
        message="Add Firebase configuration before submitting a review."
      />
    )
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center" role="status">
        <p className="font-display text-2xl text-brand">Thank you</p>
        <p className="mt-3 text-body text-ink">
          Thank you for sharing your experience! Your review has been submitted successfully.
        </p>
        <div className="mt-6">
          <ButtonLink to={paths.reviews} variant="secondary">
            Return to Reviews
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {loadError ? (
        <div className="space-y-3">
          <ErrorState title="Unable to load tours and destinations" message={loadError} />
          <Button type="button" variant="ghost" onClick={() => void loadOptions()}>
            Try again
          </Button>
        </div>
      ) : null}
      {submitError ? (
        <ErrorState
          title="Your review was not submitted"
          message={`${submitError} Your answers are still here — you can try again.`}
        />
      ) : null}

      <Controller
        name="tourId"
        control={control}
        render={({ field }) => (
          <SearchableSelectField
            id="review-tour"
            label="Which tour did you experience?"
            placeholder="Search and select a tour"
            options={tours.map((tour) => ({
              value: tour.id,
              label: tour.title.trim() || tour.slug || 'Untitled tour',
            }))}
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            loading={optionsLoading}
            emptyMessage="No published tours are available yet."
            error={errors.tourId?.message}
          />
        )}
      />

      <Controller
        name="destinationIds"
        control={control}
        render={({ field }) => (
          <SearchableMultiSelect
            label="Which destinations did you visit?"
            placeholder="Optional — search and select destinations"
            options={destinations.map((destination) => ({
              id: destination.id,
              label: destination.name.trim() || destination.slug || 'Untitled destination',
            }))}
            selectedIds={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            loading={optionsLoading}
            emptyMessage="No published destinations are available yet."
            maxSelected={REVIEW_DESTINATION_IDS_MAX}
            error={errors.destinationIds?.message}
          />
        )}
      />

      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <StarRatingInput
            label="How would you rate your experience?"
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            error={errors.rating?.message}
          />
        )}
      />

      <FormInput
        id="review-name"
        label="Your Name"
        autoComplete="name"
        aria-required="true"
        disabled={isSubmitting}
        error={errors.reviewerName?.message}
        {...register('reviewerName')}
      />

      <FormTextarea
        id="review-text"
        label="Share Your Experience"
        rows={6}
        aria-required="true"
        disabled={isSubmitting}
        error={errors.reviewText?.message}
        placeholder="Tell us about your journey, the places you visited, and what made your experience memorable..."
        {...register('reviewText')}
      />

      <Button type="submit" disabled={isSubmitting || optionsLoading || tours.length === 0}>
        {isSubmitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  )
}
