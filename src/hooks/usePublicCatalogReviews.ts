import { useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '@/config/env.ts'
import { listPublishedDestinations } from '@/services/firebase/destinations.ts'
import {
  filterPublicReviewsForDestination,
  filterPublicReviewsForTour,
  publicReviewsSummary,
  resolveReviewNames,
  subscribePublicReviews,
  toCatalogReview,
  type PublicReviewsSummary,
  type ReviewRecord,
} from '@/services/firebase/reviews.ts'
import { listPublishedTours } from '@/services/firebase/tours.ts'
import type { CatalogReview } from '@/types/tours.ts'

type TourName = { id: string; title: string }
type DestinationName = { id: string; name: string }

export type UsePublicCatalogReviewsOptions = {
  enabled?: boolean
  tourId?: string
  destinationId?: string
}

export type PublicCatalogReviewsState = {
  reviews: CatalogReview[]
  summary: PublicReviewsSummary | null
  ready: boolean
}

export function usePublicCatalogReviews(options: UsePublicCatalogReviewsOptions = {}): PublicCatalogReviewsState {
  const enabled = options.enabled ?? true
  const tourId = options.tourId?.trim() ?? ''
  const destinationId = options.destinationId?.trim() ?? ''
  const [records, setRecords] = useState<ReviewRecord[]>([])
  const [tours, setTours] = useState<TourName[]>([])
  const [destinations, setDestinations] = useState<DestinationName[]>([])
  const [ready, setReady] = useState(!enabled || !isFirebaseConfigured)

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) {
      setRecords([])
      setReady(true)
      return
    }

    let active = true
    setReady(false)

    listPublishedTours()
      .then((next) => {
        if (active) {
          setTours(next.map((tour) => ({ id: tour.id, title: tour.title })))
        }
      })
      .catch(() => {
        if (active) {
          setTours([])
        }
      })

    listPublishedDestinations()
      .then((next) => {
        if (active) {
          setDestinations(next.map((destination) => ({ id: destination.id, name: destination.name })))
        }
      })
      .catch(() => {
        if (active) {
          setDestinations([])
        }
      })

    const unsubscribe = subscribePublicReviews(
      (next) => {
        if (!active) {
          return
        }
        setRecords(next)
        setReady(true)
      },
      () => {
        if (!active) {
          return
        }
        setRecords([])
        setReady(true)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [enabled])

  const filtered = useMemo(() => {
    let list = records
    if (tourId) {
      list = filterPublicReviewsForTour(list, tourId)
    }
    if (destinationId) {
      list = filterPublicReviewsForDestination(list, destinationId)
    }
    return list
  }, [destinationId, records, tourId])

  const reviews = useMemo(
    () => filtered.map((review) => toCatalogReview(review, resolveReviewNames(review, tours, destinations))),
    [destinations, filtered, tours],
  )

  const summary = useMemo(() => publicReviewsSummary(filtered), [filtered])

  return { reviews, summary, ready }
}
