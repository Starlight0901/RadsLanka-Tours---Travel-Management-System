import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ImageGallery } from '@/components/common/ImageGallery.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { TourBookingCard } from '@/components/tours/TourBookingCard.tsx'
import { ShareJourneyButton } from '@/components/tours/ShareJourneyButton.tsx'
import { TourInclusions } from '@/components/tours/TourInclusions.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { TourItinerary } from '@/components/tours/TourItinerary.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { getPublishedReviewsForTour, getRelatedTours } from '@/data/tourCatalog.ts'
import { NotFoundPage } from '@/pages/public/NotFoundPage.tsx'
import { toCatalogTours } from '@/services/firebase/tourAdapter.ts'
import { getPublishedTourBySlug } from '@/services/firebase/tours.ts'
import type { CatalogTour } from '@/types/tours.ts'
import { paths } from '@/routes/paths.ts'
import { absoluteAssetUrl, buildTourShareUrl } from '@/utils/shareJourney.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'
import { siteConfig } from '@/config/site.ts'

function formatDetailPrice(priceLabel: string): string {
  if (/^LKR\b/i.test(priceLabel)) {
    return priceLabel
  }

  return `LKR ${priceLabel}`
}

const destinationNamesOf = (tour: CatalogTour): string[] => tour.destinationNames?.filter(Boolean) ?? []

export function TourDetailPage() {
  const { slug } = useParams()
  const [tour, setTour] = useState<CatalogTour | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')

  useEffect(() => {
    let active = true

    if (!slug) {
      setTour(null)
      setStatus('missing')
      return
    }

    setStatus('loading')
    getPublishedTourBySlug(slug)
      .then(async (record) => {
        if (!active) {
          return
        }
        if (!record) {
          setTour(null)
          setStatus('missing')
          return
        }

        const [next] = await toCatalogTours([record])
        if (!active) {
          return
        }
        setTour(next ?? null)
        setStatus(next ? 'ready' : 'missing')
      })
      .catch(() => {
        if (active) {
          setTour(null)
          setStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <Container className="py-16">
        <LoadingState label="Loading tour" />
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container className="py-16">
        <ErrorState title="This tour is unavailable" message="Please try again in a moment." />
      </Container>
    )
  }

  if (!tour) {
    return <NotFoundPage />
  }

  const reviews = getPublishedReviewsForTour(tour.id)
  const related = getRelatedTours(tour)
  const hero = tour.images[0]
  const gallery = tour.images.slice(1)
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)
  const destinationNames = destinationNamesOf(tour)
  const shareUrl = buildTourShareUrl(tour.slug)
  const shareImage = absoluteAssetUrl(hero?.src)

  return (
    <>
      <PageMeta
        title={tour.title}
        description={tour.shortDescription}
        socialTitle={tour.title}
        url={shareUrl}
        image={shareImage}
        type="website"
      />

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
              <div className="absolute top-5 right-5 z-20 flex gap-2 lg:top-10 lg:right-10">
                <ShareJourneyButton title={tour.title} description={tour.shortDescription} url={shareUrl} />
              </div>
              {tour.kicker || tour.category ? (
                <p className="inline-flex items-center gap-2 text-[13px] text-gold-soft">
                  <span className="size-2 rounded-full bg-accent" />
                  {tour.kicker ?? tour.category}
                </p>
              ) : null}
              <h1 className="mt-3 max-w-3xl font-display text-[2.25rem] leading-tight font-semibold lg:text-[3.5rem]">
                {tour.title}
              </h1>
              <p className="mt-3 max-w-2xl text-body text-on-brand-soft/90">{tour.shortDescription}</p>
              {tour.tags.length > 0 ? (
                <p className="mt-3 text-[11px] font-bold tracking-[0.14em] text-gold-soft uppercase">
                  {tour.tags.join(' · ')}
                </p>
              ) : null}
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.55px] text-on-brand-dim uppercase">Duration</dt>
                  <dd className="mt-1 text-lg font-bold">{tour.duration}</dd>
                </div>
                {tour.travelStyle ? (
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.55px] text-on-brand-dim uppercase">
                      Travel Style
                    </dt>
                    <dd className="mt-1 text-lg font-bold">{tour.travelStyle}</dd>
                  </div>
                ) : null}
                {tour.priceLabel ? (
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.55px] text-on-brand-dim uppercase">From</dt>
                    <dd className="mt-1 text-lg font-bold">
                      {formatDetailPrice(tour.priceLabel)}
                      {tour.priceNote ? (
                        <span className="mt-0.5 block text-sm font-semibold text-on-brand-soft">{tour.priceNote}</span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="#booking" variant="primary" className="lift-button">
                  Request This Journey
                  <Icon name="arrow_forward" className="text-[12px]" />
                </ButtonLink>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-white/20 bg-white/10 px-6 text-sm font-semibold"
                  >
                    <Icon name="chat" className="text-[16px]" />
                    Talk to Us on WhatsApp
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

        {destinationNames.length > 0 ? (
          <section className="mt-6 rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)] lg:p-8">
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Destinations</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {destinationNames.map((name) => (
                <li
                  key={name}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-mist px-4 py-2 text-sm font-semibold text-brand"
                >
                  <Icon name="place" className="text-[16px]" />
                  {name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tour.accommodations && tour.accommodations.length > 0 ? (
          <section className="mt-6 rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)] lg:p-8">
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Accommodation</p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tour.accommodations.map((accommodation) => (
                <li key={accommodation.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  {accommodation.imageSrc ? (
                    <img
                      src={accommodation.imageSrc}
                      alt={accommodation.imageAlt || accommodation.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    {accommodation.type ? (
                      <p className="text-[11px] font-bold tracking-[0.08em] text-eyebrow uppercase">{accommodation.type}</p>
                    ) : null}
                    <h2 className="mt-1 text-lg font-bold text-brand">{accommodation.name}</h2>
                    {accommodation.location ? (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                        <Icon name="place" className="text-[16px]" />
                        {accommodation.location}
                      </p>
                    ) : null}
                    {accommodation.description ? (
                      <p className="mt-3 text-body text-muted">{accommodation.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tour.highlights.length > 0 ? (
          <section className="mt-12">
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
        ) : null}

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <TourItinerary days={tour.itinerary} />
          <div id="booking" className="lg:sticky lg:top-28">
            <TourBookingCard tour={tour} />
          </div>
        </div>

        {tour.images.length > 0 ? (
          <section className="mt-16">
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Gallery</p>
            <h2 className="mt-1 font-display text-[2rem] font-semibold text-brand">Glimpses of Your Journey</h2>
            <div className="mt-6">
              <ImageGallery items={gallery.length > 0 ? gallery : tour.images} />
            </div>
          </section>
        ) : null}

        <TourInclusions included={tour.inclusions} excluded={tour.exclusions} />

        {tour.practicalNotes.length > 0 ? (
          <section className="mt-16 rounded-2xl bg-surface-mist p-6 lg:p-8">
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
        ) : null}

        <section className="mt-16">
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

        {related.length > 0 ? (
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
        ) : null}
      </Container>
    </>
  )
}
