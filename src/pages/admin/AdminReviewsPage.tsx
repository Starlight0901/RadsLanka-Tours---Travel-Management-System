import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { ShareReviewButton } from '@/components/reviews/ShareReviewButton.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { RatingStars } from '@/components/ui/RatingStars.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { useAdminNotifications } from '@/hooks/useAdminNotifications.ts'
import { listAllDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import {
  deleteReview,
  keepReview,
  listAllReviews,
  resolveReviewNames,
  type ReviewRecord,
} from '@/services/firebase/reviews.ts'
import { listAllTours, type TourRecord } from '@/services/firebase/tours.ts'
import { cn } from '@/utils/cn.ts'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function formatSubmittedAt(review: ReviewRecord): string {
  if (!review.createdAt || typeof review.createdAt.toDate !== 'function') {
    return '—'
  }

  try {
    return review.createdAt.toDate().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

function statusLabel(review: ReviewRecord): string {
  if (review.status === 'pending') {
    return 'Pending'
  }
  if (review.status === 'rejected') {
    return 'Rejected'
  }
  if (review.retained) {
    return 'Kept'
  }
  return 'Public'
}

export function AdminReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('review')?.trim() || null
  const { markReviewNotificationRead } = useAdminNotifications()
  const [records, setRecords] = useState<ReviewRecord[]>([])
  const [tours, setTours] = useState<TourRecord[]>([])
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh() {
    const [reviews, nextTours, nextDestinations] = await Promise.all([
      listAllReviews(),
      listAllTours(),
      listAllDestinations(),
    ])
    setRecords(reviews)
    setTours(nextTours)
    setDestinations(nextDestinations)
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true
    Promise.all([listAllReviews(), listAllTours(), listAllDestinations()])
      .then(([reviews, nextTours, nextDestinations]) => {
        if (!active) {
          return
        }
        setRecords(reviews)
        setTours(nextTours)
        setDestinations(nextDestinations)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load reviews.'))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      return
    }
    void markReviewNotificationRead(selectedId)
  }, [markReviewNotificationRead, selectedId])

  const selected = useMemo(
    () => records.find((review) => review.id === selectedId) ?? null,
    [records, selectedId],
  )

  function selectReview(id: string) {
    setSearchParams({ review: id })
    setStatus(null)
    setError(null)
  }

  function clearSelection() {
    setSearchParams({})
  }

  async function onKeep(review: ReviewRecord) {
    setBusyId(review.id)
    setError(null)
    setStatus(null)
    try {
      await keepReview(review.id)
      await refresh()
      setStatus('Review kept as a public review.')
    } catch (keepError) {
      setError(errorMessage(keepError, 'Unable to keep this review.'))
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(review: ReviewRecord) {
    if (!window.confirm(`Delete the review from ${review.reviewerName || 'this traveler'}? This cannot be undone.`)) {
      return
    }

    setBusyId(review.id)
    setError(null)
    setStatus(null)
    try {
      await deleteReview(review.id)
      if (selectedId === review.id) {
        clearSelection()
      }
      await refresh()
      setStatus('Review deleted.')
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this review.'))
    } finally {
      setBusyId(null)
    }
  }

  function namesFor(review: ReviewRecord) {
    return resolveReviewNames(review, tours, destinations)
  }

  return (
    <>
      <PageMeta
        title="Admin · Reviews"
        description="Review submitted traveler reviews, keep them on the public site, or delete them."
      />
      <AdminHeader title="Reviews" />
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl text-sm text-slate-600">
            New reviews appear on the public Reviews page immediately. Keep a review to mark it as retained, or delete it
            to remove it from the site and database.
          </p>
          <ShareReviewButton />
        </div>

        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add your Firebase web config to manage reviews."
          />
        ) : null}

        {error ? <ErrorState title="Reviews error" message={error} /> : null}
        {status ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
            {status}
          </p>
        ) : null}

        {loading ? <LoadingState label="Loading reviews" /> : null}

        {!loading && records.length === 0 ? (
          <EmptyState title="No reviews yet" message="Submitted traveler reviews will appear here." />
        ) : null}

        {!loading && records.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Reviewer</th>
                    <th className="px-4 py-3 font-medium">Tour</th>
                    <th className="px-4 py-3 font-medium">Destinations</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Review</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((review) => {
                    const names = namesFor(review)
                    return (
                      <tr
                        key={review.id}
                        className={cn(
                          'border-b border-slate-100 last:border-0',
                          selectedId === review.id && 'bg-slate-50',
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{review.reviewerName || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{names.tourTitle || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {names.destinationNames.length > 0 ? names.destinationNames.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <RatingStars rating={review.rating} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          <p className="line-clamp-2">{review.reviewText || '—'}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatSubmittedAt(review)}</td>
                        <td className="px-4 py-3 text-slate-600">{statusLabel(review)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              className="text-sm font-medium text-slate-900 underline"
                              onClick={() => selectReview(review.id)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="text-sm font-medium text-slate-900 underline disabled:cursor-not-allowed disabled:no-underline disabled:text-slate-400"
                              disabled={busyId === review.id || review.retained}
                              onClick={() => void onKeep(review)}
                            >
                              {review.retained ? 'Kept' : 'Keep'}
                            </button>
                            <button
                              type="button"
                              className="text-sm font-medium text-red-700 underline disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={busyId === review.id}
                              onClick={() => void onDelete(review)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-5">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Selected review</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">{selected.reviewerName}</h2>
                    </div>
                    <button type="button" className="text-sm font-medium text-slate-500 underline" onClick={clearSelection}>
                      Close
                    </button>
                  </div>
                  <RatingStars rating={selected.rating} />
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Tour</dt>
                      <dd className="font-medium text-slate-900">{namesFor(selected).tourTitle || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Destinations</dt>
                      <dd className="font-medium text-slate-900">
                        {namesFor(selected).destinationNames.join(', ') || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Submitted</dt>
                      <dd className="font-medium text-slate-900">{formatSubmittedAt(selected)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="font-medium text-slate-900">{statusLabel(selected)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Review</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-slate-800">{selected.reviewText}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      className="rounded-lg"
                      disabled={busyId === selected.id || selected.retained}
                      onClick={() => void onKeep(selected)}
                    >
                      {selected.retained ? 'Kept' : 'Keep'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                      disabled={busyId === selected.id}
                      onClick={() => void onDelete(selected)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select a review to inspect the full submission before keeping or deleting it.</p>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </>
  )
}
