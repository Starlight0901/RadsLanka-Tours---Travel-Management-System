import { useEffect, useMemo, useState } from 'react'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { ShareReviewButton } from '@/components/reviews/ShareReviewButton.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { RatingStars } from '@/components/ui/RatingStars.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { filterCatalogReviews } from '@/data/reviewCatalog.ts'
import { listPublishedDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import {
  formatAverageRating,
  publicReviewsSummary,
  resolveReviewNames,
  reviewCountLabel,
  subscribePublicReviews,
  toCatalogReview,
  type ReviewRecord,
} from '@/services/firebase/reviews.ts'
import { listPublishedTours, type TourRecord } from '@/services/firebase/tours.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const trustPillars = [
  { title: 'Uncompromising Transparency', body: 'Every review is tied directly to a completed chauffeured itinerary voucher and verified booking reference.', icon: 'verified' },
  { title: '[Unedited guest accounts]', body: 'We publish every legitimate guest account without editorial curation or selective omission.', icon: 'forum' },
  { title: '[Driver-guide debriefings]', body: 'Direct driver-guide debriefings after each tour guarantee our high benchmarks in hygiene and safety.', icon: 'diversity_3' },
]

function WriteReviewButton({ className }: { className?: string }) {
  return (
    <ButtonLink to={paths.shareYourExperience} variant="primary" className={className}>
      Write a Review
    </ButtonLink>
  )
}

export function ReviewsPage() {
  const [tag, setTag] = useState('all')
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<ReviewRecord[]>([])
  const [tours, setTours] = useState<TourRecord[]>([])
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true
    listPublishedTours()
      .then((next) => {
        if (active) {
          setTours(next)
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
          setDestinations(next)
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
        setLoadError(null)
        setLoading(false)
      },
      (error) => {
        if (!active) {
          return
        }
        setLoadError(error.message || 'Unable to load reviews.')
        setLoading(false)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const approved = useMemo(
    () => records.map((review) => toCatalogReview(review, resolveReviewNames(review, tours, destinations))),
    [destinations, records, tours],
  )
  const summary = useMemo(() => publicReviewsSummary(records), [records])
  const filters = useMemo(() => {
    const names = new Set<string>()
    for (const review of approved) {
      for (const name of review.destinationNames ?? []) {
        if (name.trim()) {
          names.add(name)
        }
      }
    }
    return [
      { value: 'all', label: 'All experiences' },
      ...[...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name })),
    ]
  }, [approved])
  const reviews = useMemo(() => filterCatalogReviews(approved, query, tag), [approved, query, tag])
  const hasPublicReviews = Boolean(summary && summary.count > 0)

  return (
    <>
      <PageMeta title="Reviews" description="What Our Travelers Say" />

      <Container className="py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Reviews' }]} />
      </Container>

      <section>
        <Container className="grid gap-8 pb-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)] lg:items-start">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-eyebrow uppercase">
              <span className="size-2 rounded-full bg-accent" />
              VERIFIED GUEST FEEDBACK • INDEPENDENT REVIEWS
            </p>
            <h1 className="mt-3 font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">
              What Our Travelers Say
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <WriteReviewButton />
              <ShareReviewButton />
            </div>
          </div>
          {summary ? (
            <div className="rounded-2xl bg-surface-mist p-6 lg:justify-self-end lg:text-right">
              <p className="text-3xl font-bold text-brand">{formatAverageRating(summary.average)}/5</p>
              <RatingStars rating={summary.average} className="mt-2 text-[18px] lg:justify-end" />
              <p className="mt-2 text-[13px] text-muted">{reviewCountLabel(summary.count)}</p>
            </div>
          ) : null}
        </Container>
      </section>

      {hasPublicReviews ? (
        <section className="pb-6">
          <Container>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                {filters.map((filter) => (
                  <li key={filter.value} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setTag(filter.value)}
                      className={cn(
                        'min-h-11 rounded-full px-4 text-[13px] font-semibold',
                        tag === filter.value ? 'bg-brand text-on-brand' : 'bg-chip text-chip-text',
                      )}
                    >
                      {filter.label}
                    </button>
                  </li>
                ))}
              </ul>
              <label className="relative block w-full lg:max-w-xs">
                <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search traveler, tour, or place..."
                  className="h-12 w-full rounded-control border border-border bg-surface-elevated pr-4 pl-11 text-body outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </label>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="pb-16 lg:pb-24">
        <Container>
          {!isFirebaseConfigured ? (
            <ErrorState
              title="Reviews are unavailable"
              message="Add Firebase configuration to load traveler reviews."
            />
          ) : null}
          {loading ? <LoadingState label="Loading reviews" /> : null}
          {loadError ? <ErrorState title="Unable to load reviews" message={loadError} /> : null}
          {!loading && !loadError && !hasPublicReviews ? (
            <EmptyState
              title="No reviews yet"
              message="Be the first to share your Sri Lankan journey and help fellow travellers discover RadsLanka."
              action={<WriteReviewButton />}
            />
          ) : null}
          {!loading && !loadError && hasPublicReviews && reviews.length === 0 ? (
            <EmptyState
              title="No matching reviews"
              message="Try another filter or search to find a traveler story."
            />
          ) : null}
          {!loading && !loadError && reviews.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 md:gap-8">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    travelerName={review.travelerName}
                    dateLabel={review.dateLabel}
                    rating={review.rating}
                    title={review.title}
                    review={review.review}
                    chauffeurName={review.chauffeurName}
                    tourTitle={review.tourTitle}
                    destinationNames={review.destinationNames}
                    photoAlt={review.photoAlt}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading align="center" eyebrow="OUR TRUST PROMISE" title="Authenticity standards" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trustPillars.map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface p-8 shadow-card">
                <Icon name={item.icon} className="text-brand" />
                <h3 className="mt-3 text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-2 text-body text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container className="rounded-2xl bg-brand px-8 py-12 text-center text-on-brand lg:px-16">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gold-soft">YOUR VOICE SHAPES OUR ISLAND CRAFT</p>
          <h2 className="mt-3 font-display text-[2rem] font-semibold">Traveled with RadsLanka recently?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WriteReviewButton />
            <ButtonLink to={paths.inquiry} variant="glass">
              Plan Your Sri Lankan Journey
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
