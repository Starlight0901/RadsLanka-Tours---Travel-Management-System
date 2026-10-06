import { useMemo, useState } from 'react'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { homeHero } from '@/data/home.ts'
import { filterApprovedReviews, listApprovedReviews, reviewExperienceFilters } from '@/data/reviewCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const trustPillars = [
  { title: 'Uncompromising Transparency', body: 'Every review is tied directly to a completed chauffeured itinerary voucher and verified booking reference.', icon: 'verified' },
  { title: '[Unedited guest accounts]', body: 'We publish every legitimate guest account without editorial curation or selective omission.', icon: 'forum' },
  { title: '[Driver-guide debriefings]', body: 'Direct driver-guide debriefings after each tour guarantee our high benchmarks in hygiene and safety.', icon: 'diversity_3' },
]

export function ReviewsPage() {
  const [tag, setTag] = useState('all')
  const [query, setQuery] = useState('')
  const approved = listApprovedReviews()
  const reviews = useMemo(() => filterApprovedReviews(query, tag), [query, tag])

  return (
    <>
      <PageMeta title="Reviews" description="What Our Travelers Say" />

      <Container className="py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Reviews' }]} />
      </Container>

      <section>
        <Container className="grid gap-8 pb-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-eyebrow uppercase">
              <span className="size-2 rounded-full bg-accent" />
              VERIFIED GUEST FEEDBACK • INDEPENDENT REVIEWS
            </p>
            <h1 className="mt-3 font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">
              What Our Travelers Say
            </h1>
            <p className="mt-3 max-w-2xl text-body text-muted">[Reviews introduction from Figma]</p>
          </div>
          <div className="rounded-2xl bg-surface-mist p-6">
            <p className="text-3xl font-bold text-brand">{homeHero.ratingHighlight}</p>
            <p className="mt-1 text-sm text-muted">[Aggregate rating note from Figma]</p>
            <p className="mt-3 text-[13px] text-muted">{approved.length} approved reviews</p>
          </div>
        </Container>
      </section>

      <section className="pb-6">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              {reviewExperienceFilters.map((filter) => (
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
                placeholder="Search driver, tour, or place..."
                className="h-12 w-full rounded-control border border-border bg-surface-elevated pr-4 pl-11 text-body outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </label>
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container>
          {reviews.length === 0 ? (
            <EmptyState title="No matching reviews" message="Only approved reviews are shown. Try another filter or search." />
          ) : (
            <ul className="grid gap-8 lg:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    travelerName={review.travelerName}
                    country={review.country}
                    dateLabel={review.dateLabel}
                    rating={review.rating}
                    title={review.title}
                    review={review.review}
                    chauffeurName={review.chauffeurName}
                    tags={review.tags}
                    photoAlt={review.photoAlt}
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading align="center" eyebrow="OUR TRUST PROMISE" title="Authenticity standards" />
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
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
            <ButtonLink to={paths.writeAReview} variant="primary">
              Share your experience
            </ButtonLink>
            <ButtonLink to={paths.inquiry} variant="glass">
              Plan Your Sri Lankan Journey
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
