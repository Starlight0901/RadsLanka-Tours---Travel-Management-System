import { useParams } from 'react-router-dom'
import { ImageGallery } from '@/components/common/ImageGallery.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { TourBookingCard } from '@/components/tours/TourBookingCard.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { TourItinerary } from '@/components/tours/TourItinerary.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { getPublishedReviewsForTour, getRelatedTours, getTourBySlug } from '@/data/tourCatalog.ts'
import { NotFoundPage } from '@/pages/public/NotFoundPage.tsx'
import { paths } from '@/routes/paths.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'
import { siteConfig } from '@/config/site.ts'

export function TourDetailPage() {
  const { slug } = useParams()
  const tour = slug ? getTourBySlug(slug) : undefined

  if (!tour) {
    return <NotFoundPage />
  }

  const reviews = getPublishedReviewsForTour(tour.id)
  const related = getRelatedTours(tour)
  const hero = tour.images[0]
  const gallery = tour.images.slice(1)
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)

  return (
    <>
      <PageMeta title={tour.title} description={tour.shortDescription} />

      <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Breadcrumbs
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Tours', to: paths.tours },
            { label: tour.title },
          ]}
        />
        <ul className="hidden gap-2 lg:flex">
          <li className="rounded-full bg-surface-mist px-3 py-1 text-[12px] font-semibold text-brand">
            {tour.duration}
          </li>
          {tour.journeyStyle ? (
            <li className="rounded-full bg-surface-mist px-3 py-1 text-[12px] font-semibold text-brand">
              {tour.journeyStyle}
            </li>
          ) : null}
          {tour.category ? (
            <li className="rounded-full bg-surface-mist px-3 py-1 text-[12px] font-semibold text-brand">
              {tour.category}
            </li>
          ) : null}
        </ul>
      </Container>

      <Container className="pb-10">
        <section className="relative isolate overflow-hidden rounded-2xl text-on-brand">
          <div className="relative min-h-[28rem] lg:min-h-[37.5rem]">
            {hero?.src ? (
              <img src={hero.src} alt={hero.alt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <PlaceholderMedia label={hero?.alt ?? tour.title} className="absolute inset-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/55 to-brand/20" />
            <div className="relative z-10 flex min-h-[28rem] flex-col justify-end p-6 lg:min-h-[37.5rem] lg:p-14">
              <div className="absolute top-5 right-5 flex gap-2 lg:top-10 lg:right-10">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-[13px] font-semibold backdrop-blur-md"
                  onClick={() => {
                    void navigator.clipboard.writeText(window.location.href)
                  }}
                >
                  <Icon name="share" className="text-[16px]" />
                  Share journey
                </button>
              </div>
              <p className="inline-flex items-center gap-2 text-[13px] text-gold-soft">
                <span className="size-2 rounded-full bg-accent" />
                {tour.kicker ?? tour.category}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-[2.25rem] leading-tight font-semibold lg:text-[3.5rem]">
                {tour.title}
              </h1>
              <p className="mt-3 max-w-2xl text-body text-on-brand-soft/90">{tour.shortDescription}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.55px] uppercase text-on-brand-dim">Duration</dt>
                  <dd className="mt-1 text-lg font-bold">{tour.duration}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.55px] uppercase text-on-brand-dim">Journey style</dt>
                  <dd className="mt-1 text-lg font-bold">{tour.journeyStyle ?? '[Journey style]'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.55px] uppercase text-on-brand-dim">Accommodation</dt>
                  <dd className="mt-1 text-lg font-bold">{tour.accommodation ?? '[Accommodation]'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.55px] uppercase text-on-brand-dim">
                    All-inclusive from
                  </dt>
                  <dd className="mt-1 text-lg font-bold">
                    {tour.priceLabel ?? '[Price]'}
                    {tour.priceNote ? <span className="ml-1 text-sm font-semibold">{tour.priceNote}</span> : null}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="#booking" variant="primary">
                  Request this journey
                  <Icon name="arrow_forward" className="text-[12px]" />
                </ButtonLink>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-white/20 bg-white/10 px-6 text-sm font-semibold"
                  >
                    <Icon name="chat" className="text-[16px]" />
                    WhatsApp a specialist
                  </a>
                ) : (
                  <span className="inline-flex min-h-12 items-center rounded-control border border-white/20 px-6 text-sm">
                    {siteConfig.placeholders.whatsapp}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)] lg:flex lg:items-center lg:justify-between lg:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-surface-mist text-brand">
              <Icon name="map" className="text-[22px]" />
            </span>
            <p className="max-w-xl text-body text-muted">{tour.routeSummary ?? tour.routeLabel}</p>
          </div>
          <ul className="mt-6 grid grid-cols-3 gap-4 text-[13px] font-semibold text-brand lg:mt-0">
            <li className="flex items-center gap-2">
              <Icon name="schedule" />
              {tour.durationDays} days
            </li>
            <li className="flex items-center gap-2">
              <Icon name="place" />
              {tour.destinationIds.length || '—'} stops
            </li>
            <li className="flex items-center gap-2">
              <Icon name="directions_car" />
              Private
            </li>
          </ul>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:items-start">
          <div className="space-y-16">
            <article>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">
                <Icon name="menu_book" className="text-[16px]" />
                Journey overview
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-tight font-semibold text-brand">
                {tour.title}
              </h2>
              <p className="mt-4 text-body text-muted">{tour.fullDescription}</p>
            </article>

            <section>
              <h2 className="font-display text-[2rem] font-semibold text-brand">Signature Tour Highlights</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {tour.highlights.map((highlight, index) => (
                  <li key={`${highlight.title}-${index}`} className="rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-surface-mist text-brand">
                      <Icon name={highlight.icon} className="text-[22px]" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-brand">{highlight.title}</h3>
                    <p className="mt-2 text-body text-muted">{highlight.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <TourItinerary days={tour.itinerary} />

            <section>
              <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Gallery</p>
              <h2 className="mt-1 font-display text-[2rem] font-semibold text-brand">Glimpses of Your Journey</h2>
              <div className="mt-6">
                <ImageGallery items={gallery.length > 0 ? gallery : tour.images} />
              </div>
            </section>

            <section>
              <h2 className="font-display text-[2rem] font-semibold text-brand">What’s Included & Excluded</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-brand">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-mist">
                      <Icon name="check" />
                    </span>
                    Included
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {tour.inclusions.map((item, index) => (
                      <li key={`inclusion-${index}`} className="flex gap-2 text-body text-muted">
                        <Icon name="check" className="mt-0.5 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-brand">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-mist">
                      <Icon name="close" />
                    </span>
                    Not included
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {tour.exclusions.map((item, index) => (
                      <li key={`exclusion-${index}`} className="flex gap-2 text-body text-muted">
                        <Icon name="close" className="mt-0.5 text-muted" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-surface-mist p-6 lg:p-8">
              <h2 className="font-display text-2xl font-semibold text-brand">Essential advice</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {tour.practicalNotes.map((note) => (
                  <li key={note.title}>
                    <h3 className="text-[15px] font-bold text-brand">{note.title}</h3>
                    <p className="mt-2 text-body text-muted">{note.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeading
                title="Verified Traveler Reviews"
                description="Approved reviews linked by tour ID. Firebase reviews are not wired yet."
                actionLabel="Read all reviews"
                actionTo={paths.reviews}
              />
              {reviews.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No published reviews for this tour yet"
                    message="When approved reviews exist for this tour ID, they will appear here."
                  />
                </div>
              ) : (
                <ul className="mt-8 grid gap-6 lg:grid-cols-3">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard
                        travelerName={review.travelerName}
                        country={review.country}
                        dateLabel={review.dateLabel}
                        rating={review.rating}
                        review={review.review}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div id="booking" className="lg:pt-2">
            <TourBookingCard tour={tour} />
          </div>
        </div>

        <section className="mt-20 pb-8">
          <SectionHeading title="More Handcrafted Journeys" actionLabel="View all tours" actionTo={paths.tours} />
          <ul className="mt-8 grid gap-8 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <TourCard tour={item} />
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  )
}
