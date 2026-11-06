import { ImageGallery } from '@/components/common/ImageGallery.tsx'
import { FormattedText } from '@/components/common/FormattedText.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { DestinationEssenceSection } from '@/components/destinations/DestinationEssenceSection.tsx'
import { DestinationExperiencesSection } from '@/components/destinations/DestinationExperiencesSection.tsx'
import { DestinationOverviewSidebar } from '@/components/destinations/DestinationOverviewSidebar.tsx'
import { ReviewCarousel } from '@/components/reviews/ReviewCarousel.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { paths } from '@/routes/paths.ts'
import type { CatalogDestination } from '@/types/destinations.ts'
import type { CatalogReview, CatalogTour } from '@/types/tours.ts'
import { cn } from '@/utils/cn.ts'
import { visibleCopy } from '@/utils/placeholderCopy.ts'

export type DestinationDetailProps = {
  destination: CatalogDestination
  tours: CatalogTour[]
  reviews: CatalogReview[]
}

export function DestinationDetail({ destination, tours, reviews }: DestinationDetailProps) {
  const hero = destination.images[0]
  const gallery = destination.images.slice(1).filter((image) => Boolean(image.src))
  const heroKicker = visibleCopy(destination.kicker)
  const heroSubtitle = visibleCopy(destination.tagline)
  const heroDescription = visibleCopy(destination.shortDescription)
  const overviewTitle = visibleCopy(destination.overviewTitle)
  const overviewDescription = visibleCopy(destination.fullDescription)
  const hasOverviewCopy = Boolean(overviewTitle || overviewDescription)
  const hasGlance = Boolean(
    destination.glance?.bestTime ||
      destination.glance?.location ||
      destination.glance?.recommendedStay ||
      (destination.glance?.characteristics && destination.glance.characteristics.length > 0) ||
      (destination.glance?.idealFor && destination.glance.idealFor.length > 0),
  )
  const publishedHighlights = (destination.keyHighlights ?? []).filter((item) => item.title.trim())
  const hasSidebar = hasGlance || publishedHighlights.length > 0
  const travelInfo = destination.travelInfo.filter((item) => visibleCopy(item.title) && visibleCopy(item.body))
  const regionName = destination.name.split('&')[0]?.trim() ?? destination.name

  return (
    <>
      <Container className="py-4">
        <Breadcrumbs
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Destinations', to: paths.destinations },
            { label: destination.name },
          ]}
        />
      </Container>

      <section className="relative isolate overflow-hidden text-on-brand">
        <div className="relative min-h-[32rem] lg:min-h-[46rem]">
          {hero?.src ? (
            <img src={hero.src} alt={hero.alt} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <PlaceholderMedia label={hero?.alt ?? destination.name} className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/55 to-brand/20" />
          <Container className="relative z-10 flex min-h-[32rem] flex-col justify-end pb-28 pt-16 lg:min-h-[46rem] lg:pb-36">
            {heroKicker ? (
              <p className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] backdrop-blur-md">
                <span className="size-2 rounded-full bg-accent" />
                {heroKicker}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-4xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[4.25rem]">
              {destination.name}
            </h1>
            {heroSubtitle ? (
              <p className="mt-4 max-w-3xl font-sans text-xl text-on-brand-soft lg:text-[2rem] lg:leading-10">
                {heroSubtitle}
              </p>
            ) : null}
            {heroDescription ? (
              <p className="mt-4 max-w-2xl text-body whitespace-pre-line text-on-brand-soft/90">{heroDescription}</p>
            ) : null}
          </Container>
        </div>
      </section>

      {hasOverviewCopy || hasSidebar ? (
        <Container as="section" className="py-16 lg:py-24">
          <div
            className={cn(
              'grid gap-10 lg:gap-14',
              hasOverviewCopy && hasSidebar ? 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]' : 'grid-cols-1',
            )}
          >
            {hasOverviewCopy ? (
              <article className="min-w-0">
                <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Destination overview</p>
                {overviewTitle ? (
                  <h2 className="mt-3 font-display text-[2rem] leading-tight font-semibold break-words text-brand lg:text-[2.5rem]">
                    {overviewTitle}
                  </h2>
                ) : null}
                {overviewDescription ? (
                  <FormattedText
                    text={overviewDescription}
                    className="mt-5 space-y-5 text-body break-words text-muted"
                  />
                ) : null}
              </article>
            ) : null}
            {hasSidebar ? (
              <div className={cn('min-w-0', !hasOverviewCopy && 'w-full md:max-w-md md:justify-self-end')}>
                <DestinationOverviewSidebar glance={destination.glance} highlights={publishedHighlights} />
              </div>
            ) : null}
          </div>
        </Container>
      ) : null}

      <DestinationEssenceSection themes={destination.essenceThemes} />

      <DestinationExperiencesSection destinationName={destination.name} experiences={destination.experiences} />

      {travelInfo.length > 0 ? (
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeading eyebrow="Travel information" title="Traveler essentials" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {travelInfo.map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                  <h3 className="text-lg font-bold text-brand">{item.title}</h3>
                  <p className="mt-2 text-body text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="bg-surface-elevated py-16 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="Gallery"
              title={`${regionName} Moments`}
            />
            <div className="mt-8">
              <ImageGallery items={gallery} />
            </div>
          </Container>
        </section>
      ) : null}

      {tours.length > 0 ? (
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="Journeys"
              title={`Journeys Featuring ${regionName}`}
              actionLabel="View all tours"
              actionTo={paths.tours}
            />
            <ul className="mt-8 grid gap-8 lg:grid-cols-3">
              {tours.map((tour) => (
                <li key={tour.id}>
                  <TourCard tour={tour} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="bg-surface-elevated py-16 lg:py-24">
          <Container>
            <SectionHeading title="Verified traveler notes" />
            <div className="mt-8">
              <ReviewCarousel reviews={reviews} showTour showDestinations={false} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-surface pt-16 pb-24 lg:pt-24 lg:pb-32">
        <Container>
          <div className="rounded-2xl border border-[#C99700]/25 bg-[linear-gradient(160deg,rgba(15,40,30,0.96)_0%,rgba(27,67,50,0.92)_100%)] px-8 py-12 text-center text-on-brand shadow-[inset_0_1px_0_rgba(255,223,158,0.14),0_24px_48px_-18px_rgba(15,40,30,0.42)] backdrop-blur-xl lg:px-16 lg:py-16">
            <h2 className="font-display text-[2rem] font-semibold text-[#FBFDF8] lg:text-[2.75rem]">Start planning this region</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to={paths.inquiry} variant="primary">
                Plan this journey
              </ButtonLink>
              <ButtonLink to={paths.tours} variant="glass">
                Browse tours
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
