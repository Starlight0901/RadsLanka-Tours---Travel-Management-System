import heroBackground from '@/assets/background_hero_image.png'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { DestinationCard } from '@/components/destinations/DestinationCard.tsx'
import { HomeInquirySection } from '@/components/home/HomeInquirySection.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import {
  homeHero,
  homePillars,
  homeReviews,
  homeTrustItems,
} from '@/data/home.ts'
import { listPublishedDestinations } from '@/data/destinationCatalog.ts'
import { listPublishedTours } from '@/data/tourCatalog.ts'
import { paths } from '@/routes/paths.ts'

export function HomePage() {
  return (
    <>
      <PageMeta
        title="Home"
        description={`${homeHero.overline} ${homeHero.title} ${homeHero.subtitle}. ${homeHero.intro}`}
      />

      <section className="relative isolate min-h-[50.9rem] overflow-hidden text-on-brand lg:min-h-[46.875rem]">
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand via-brand/70 to-transparent lg:via-brand/55"
          aria-hidden="true"
        />
        <Container className="relative z-10 flex min-h-[50.9rem] items-end pb-40 pt-16 lg:min-h-[46.875rem] lg:items-center lg:py-0 lg:pb-24 lg:pt-10">
          <div className="w-full max-w-xl lg:max-w-3xl">
            <p className="font-display text-[2rem] italic leading-10 text-gold-soft">{homeHero.overline}</p>
            <h1 className="mt-1 font-sans text-[2.75rem] font-bold leading-[1.1] tracking-tight text-on-brand sm:text-6xl lg:text-[3.75rem] lg:leading-[3.78rem]">
              {homeHero.title}
            </h1>
            <p className="mt-3 font-sans text-2xl font-normal text-on-brand sm:text-[2rem] sm:leading-10">
              {homeHero.subtitle}
            </p>
            <p className="mt-6 max-w-lg text-body text-on-brand-soft/90">{homeHero.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to={paths.tours} variant="secondary" className="gap-3 px-6">
                {homeHero.primaryCta}
                <Icon name="arrow_forward" className="text-[12px]" />
              </ButtonLink>
              <ButtonLink to="#bespoke-planner" variant="primary">
                {homeHero.secondaryCta}
              </ButtonLink>
            </div>
            <p className="mt-8 inline-flex max-w-full items-start gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[13px] text-on-brand-soft backdrop-blur-md">
              <Icon name="verified" filled className="mt-0.5 text-[15px] text-accent" />
              <span>
                <strong className="font-bold text-on-brand">{homeHero.ratingHighlight}</strong> {homeHero.ratingNote}
              </span>
            </p>
          </div>
        </Container>
      </section>

      <Container className="relative z-20 -mt-28 lg:-mt-14">
        <div className="rounded-2xl bg-surface-elevated px-6 py-8 shadow-[0_20px_50px_-12px_rgba(27,67,50,0.18)] lg:px-8 lg:py-8">
          <ul className="grid grid-cols-2 gap-y-8 lg:grid-cols-6 lg:gap-0">
            {homeTrustItems.map((item, index) => (
              <li
                key={item.title}
                className={`flex flex-col items-center px-3 text-center ${index > 0 ? 'lg:border-l lg:border-border' : ''}`}
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-mist text-brand shadow-control">
                  <Icon name={item.icon} className="text-[20px]" />
                </span>
                <h2 className="mt-4 text-[15px] font-bold leading-snug text-brand">{item.title}</h2>
                <p className="mt-1 text-[13px] leading-5 text-muted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <section className="pt-16 pb-8 lg:pt-28 lg:pb-12">
        <Container>
          <SectionHeading
            eyebrow="Signature itineraries"
            title="Popular Tour Packages"
            description="Curated Sri Lankan journeys crafted for intimacy, authentic heritage, and absolute comfort."
            actionLabel="View All Handcrafted Tours"
            actionTo={paths.tours}
          />
          <ul className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-start">
            {listPublishedTours()
              .slice(0, 3)
              .map((tour) => (
                <li key={tour.id}>
                  <TourCard tour={tour} />
                </li>
              ))}
          </ul>
          <p className="mt-8 text-center lg:hidden">
            <ButtonLink to={paths.tours} variant="ghost" className="px-0 text-[15px]">
              View All 18 Handcrafted Tours
              <Icon name="arrow_forward" className="text-[12px]" />
            </ButtonLink>
          </p>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="The Ceylon landscape"
            title="Destinations"
            description="From ancient kingdoms and misty tea highlands to golden southern shores and untamed wilderness. Discover Sri Lanka’s iconic heritage, breathtaking landscapes, and tranquil coastal escapes, each with its own story to tell."
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listPublishedDestinations()
              .slice(0, 6)
              .map((destination) => (
                <li key={destination.id}>
                  <DestinationCard destination={destination} variant="overlay" />
                </li>
              ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="The RadsLanka distinction"
            title="Why Choose RadsLanka"
            description="We are islanders passionate about sharing the soul of Sri Lanka with integrity, luxury, and warmth."
          />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {homePillars.map((pillar) => (
              <li
                key={pillar.title}
                className="flex h-full flex-col rounded-2xl bg-surface-elevated p-8 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-mist text-brand">
                  <Icon name={pillar.icon} className="text-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug text-brand">{pillar.title}</h3>
                <p className="mt-3 flex-1 text-body text-muted">{pillar.body}</p>
                <p className="mt-6 border-t border-border pt-4 text-[11px] font-bold uppercase tracking-[0.55px] text-muted">
                  {pillar.footer}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <HomeInquirySection />

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Traveler stories"
            title="What Our Travelers Are Saying"
          />
          <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-3 rounded-full bg-surface-mist px-4 py-2 text-[13px] text-muted">
            <span className="font-bold text-brand">{homeHero.ratingHighlight}</span>
            <span>[Aggregate rating note from Figma]</span>
          </p>
          <ul className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-start">
            {homeReviews.map((review, index) => (
              <li key={`${review.travelerName}-${index}`}>
                <ReviewCard {...review} />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated px-6 py-5 text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
            <p className="inline-flex items-center gap-2">
              <Icon name="workspace_premium" className="text-brand" />
              [Licensing / accreditation from Figma]
            </p>
            <p className="inline-flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <Icon name="star" filled className="text-accent" />
                [Independent review platform]
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="verified" className="text-brand" />
                [Second accreditation]
              </span>
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
