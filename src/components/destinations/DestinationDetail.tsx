import { ImageGallery } from '@/components/common/ImageGallery.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { paths } from '@/routes/paths.ts'
import type { CatalogDestination } from '@/types/destinations.ts'
import type { CatalogReview, CatalogTour } from '@/types/tours.ts'
import { cn } from '@/utils/cn.ts'

export type DestinationDetailProps = {
  destination: CatalogDestination
  tours: CatalogTour[]
  reviews: CatalogReview[]
}

const seasonTone: Record<CatalogDestination['seasons'][number]['status'], string> = {
  best: 'bg-accent text-accent-foreground',
  good: 'bg-surface-mist text-brand',
  note: 'bg-surface-container text-muted',
}

export function DestinationDetail({ destination, tours, reviews }: DestinationDetailProps) {
  const hero = destination.images[0]
  const gallery = destination.images.slice(1)

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
            {destination.kicker ? (
              <p className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] backdrop-blur-md">
                <span className="size-2 rounded-full bg-accent" />
                {destination.kicker}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-4xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[4.25rem]">
              {destination.name}
            </h1>
            {destination.tagline ? (
              <p className="mt-4 max-w-3xl font-sans text-xl text-on-brand-soft lg:text-[2rem] lg:leading-10">
                {destination.tagline}
              </p>
            ) : null}
            <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{destination.shortDescription}</p>
          </Container>
        </div>
        <Container className="relative z-20 -mt-16">
          <ul className="grid gap-4 rounded-2xl bg-surface-elevated p-4 shadow-[0_16px_40px_-16px_rgba(27,67,50,0.2)] sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
            {destination.facts.map((fact, index) => (
              <li key={`${fact.label}-${index}`} className="flex items-center gap-3 text-ink">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-surface-mist text-brand">
                  <Icon name={fact.icon} />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.55px] text-muted uppercase">{fact.label}</p>
                  <p className="text-[15px] font-bold text-brand">{fact.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          <article>
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Destination overview</p>
            <h2 className="mt-3 font-display text-[2rem] leading-tight font-semibold text-brand lg:text-[2.5rem]">
              {destination.overviewTitle ?? destination.name}
            </h2>
            {destination.fullDescription.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-5 text-body text-muted">
                {paragraph}
              </p>
            ))}
            {destination.stats.length > 0 ? (
              <ul className="mt-10 grid gap-6 sm:grid-cols-3">
                {destination.stats.map((stat) => (
                  <li key={stat.label}>
                    <p className="font-display text-4xl text-brand">{stat.value}</p>
                    <p className="mt-1 text-[15px] font-bold text-brand">{stat.label}</p>
                    <p className="mt-1 text-[13px] text-muted">{stat.note}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
          <aside className="space-y-4">
            <div className="rounded-2xl bg-surface-elevated p-8 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
              <h3 className="font-display text-2xl text-brand">Native Ceylon Hospitality</h3>
              <ul className="mt-6 space-y-5">
                {destination.whyVisit.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="flex gap-3">
                    <Icon name="check_circle" className="mt-0.5 text-brand" />
                    <div>
                      <p className="font-bold text-brand">{item.title}</p>
                      <p className="mt-1 text-body text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Things to do"
            title={`Curated Experiences in ${destination.name.split('&')[0]?.trim() ?? destination.name}`}
            description="[Experiences introduction from Figma]"
          />
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {destination.highlights.map((item, index) => (
              <li key={`${item.title}-${index}`} className="overflow-hidden rounded-2xl bg-surface shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                <div className="relative h-56">
                  <PlaceholderMedia label={item.imageAlt} />
                  {item.category ? (
                    <BadgeLike className="absolute top-4 left-4">{item.category}</BadgeLike>
                  ) : null}
                  {item.duration ? (
                    <span className="absolute right-4 bottom-4 rounded-full bg-brand/70 px-3 py-1 text-[12px] font-semibold text-on-brand">
                      {item.duration}
                    </span>
                  ) : null}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-brand">{item.title}</h3>
                  <p className="mt-3 text-body text-muted">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Places to visit"
            title={destination.placesTitle ?? `Places around ${destination.name}`}
            description={destination.placesIntro}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destination.places.map((place) => (
              <li key={place.name} className="overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                <div className="h-48">
                  <PlaceholderMedia label={place.imageAlt} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-brand">{place.name}</h3>
                  <p className="mt-1 text-[13px] font-semibold text-eyebrow">{place.label}</p>
                  <p className="mt-3 text-body text-muted">{place.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Best time to visit"
            title={`Best Seasons to Experience ${destination.name.split('&')[0]?.trim() ?? destination.name}`}
          />
          <ul className="mt-4 flex flex-wrap gap-4 text-[13px] text-muted">
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-accent" /> [Best]
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-surface-mist" /> [Good]
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-surface-container" /> [Note]
            </li>
          </ul>
          <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-12">
            {destination.seasons.map((season) => (
              <li
                key={season.month}
                className={cn('rounded-xl px-2 py-4 text-center text-[13px] font-bold', seasonTone[season.status])}
              >
                {season.month}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow="Travel information" title="Traveler essentials" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {destination.travelInfo.map((item, index) => (
              <li key={`${item.title}-${index}`} className="rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                <h3 className="text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-2 text-body text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Gallery"
            title={`${destination.name.split('&')[0]?.trim() ?? destination.name} Moments`}
          />
          <div className="mt-8">
            <ImageGallery items={gallery.length > 0 ? gallery : destination.images} />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Journeys"
            title={`Journeys Featuring ${destination.name.split('&')[0]?.trim() ?? destination.name}`}
            actionLabel="View all tours"
            actionTo={paths.tours}
          />
          {tours.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No published tours linked yet"
                message="Tours that include this destination ID will appear here."
              />
            </div>
          ) : (
            <ul className="mt-8 grid gap-8 lg:grid-cols-3">
              {tours.slice(0, 3).map((tour) => (
                <li key={tour.id}>
                  <TourCard tour={tour} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            title="Verified traveler notes"
            description="Approved reviews may list one or more destination IDs. Association is optional. Firebase is not wired yet."
          />
          {reviews.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No destination-linked reviews yet"
                message="When an approved review includes this destination ID, it will show here."
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
        </Container>
      </section>

      <section className="bg-brand py-16 text-on-brand lg:py-20">
        <Container className="text-center">
          <h2 className="font-display text-[2rem] font-semibold lg:text-[2.75rem]">Start planning this region</h2>
          <p className="mx-auto mt-4 max-w-2xl text-body text-on-brand-soft/90">
            [Closing callout from Figma]
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to={paths.inquiry} variant="primary">
              Plan this journey
            </ButtonLink>
            <ButtonLink to={paths.tours} variant="glass">
              Browse tours
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}

function BadgeLike({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand', className)}>
      {children}
    </span>
  )
}
