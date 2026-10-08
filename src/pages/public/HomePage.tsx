import { useEffect, useState } from 'react'
import heroBackground from '@/assets/background_hero_image-DVihLKhs.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Reveal } from '@/components/common/Reveal.tsx'
import { DestinationCard } from '@/components/destinations/DestinationCard.tsx'
import { HomeInquirySection } from '@/components/home/HomeInquirySection.tsx'
import { ReviewCard } from '@/components/reviews/ReviewCard.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { WhyTravelersSection } from '@/components/tours/WhyTravelersSection.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { homeHero, homeReviews, homeTrustItems } from '@/data/home.ts'
import { overallPublishedRating } from '@/data/reviewCatalog.ts'
import { listPublishedDestinations } from '@/data/destinationCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { toCatalogTours } from '@/services/firebase/tourAdapter.ts'
import { listPopularTours } from '@/services/firebase/tours.ts'
import type { CatalogTour } from '@/types/tours.ts'
import { createDefaultHomepageHero, getHomepageHeroContent } from '@/services/firebase/siteSettings.ts'
import type { HeroTextBlock, HeroTextStyle } from '@/types/models.ts'
import { cn } from '@/utils/cn.ts'

const heroTextClassName: Record<HeroTextStyle, string> = {
  eyebrow: 'font-display text-[2rem] italic leading-10 text-gold-soft',
  title:
    'font-sans text-[2.75rem] font-bold leading-[1.1] tracking-tight text-on-brand sm:text-6xl lg:text-[3.75rem] lg:leading-[3.78rem]',
  subtitle: 'font-sans text-2xl font-normal text-on-brand sm:text-[2rem] sm:leading-10',
}

const heroTextGapClassName: Record<HeroTextStyle, string> = {
  eyebrow: 'mt-3',
  title: 'mt-1',
  subtitle: 'mt-3',
}

function heroTextStyle(style: string): HeroTextStyle {
  if (style === 'eyebrow' || style === 'title' || style === 'subtitle') {
    return style
  }

  return 'subtitle'
}

function HomepageHeroText({ blocks }: { blocks: HeroTextBlock[] }) {
  const lines = blocks.slice(0, 3).map((block) => ({
    text: block.text,
    style: heroTextStyle(block.style),
  }))
  const headingIndex = lines.findIndex((block) => block.style === 'title')

  return (
    <>
      {lines.map((block, index) => {
        const className = cn(index > 0 && heroTextGapClassName[block.style], heroTextClassName[block.style])
        if (index === headingIndex) {
          return (
            <h1 key={index} className={className}>
              {block.text}
            </h1>
          )
        }

        return (
          <p key={index} className={className}>
            {block.text}
          </p>
        )
      })}
    </>
  )
}

export function HomePage() {
  const [heroContent, setHeroContent] = useState(createDefaultHomepageHero)
  const [popularTours, setPopularTours] = useState<CatalogTour[]>([])
  const [popularLoading, setPopularLoading] = useState(true)
  const [popularError, setPopularError] = useState(false)

  useEffect(() => {
    let active = true

    getHomepageHeroContent()
      .then((content) => {
        if (active) {
          setHeroContent(content)
        }
      })
      .catch(() => {
        if (active) {
          setHeroContent(createDefaultHomepageHero())
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    listPopularTours()
      .then((records) => toCatalogTours(records))
      .then((tours) => {
        if (active) {
          setPopularTours(tours)
        }
      })
      .catch(() => {
        if (active) {
          setPopularError(true)
        }
      })
      .finally(() => {
        if (active) {
          setPopularLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const heroSummary = heroContent.heroTextBlocks
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join(' ')
  const reviewRating = overallPublishedRating()

  return (
    <>
      <PageMeta title="Home" description={`${heroSummary}. ${heroContent.heroDescription}`} />

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
            <HomepageHeroText blocks={heroContent.heroTextBlocks} />
            <p className="mt-6 max-w-lg text-body text-on-brand-soft/90">{heroContent.heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to={paths.tours} variant="secondary" className="lift-button gap-3 px-6">
                {homeHero.primaryCta}
                <Icon name="arrow_forward" className="text-[12px]" />
              </ButtonLink>
              <ButtonLink to="#bespoke-planner" variant="primary" className="lift-button">
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
        <Reveal>
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
        </Reveal>
      </Container>

      <section className="pt-16 pb-8 lg:pt-28 lg:pb-12">
        <Container>
          <Reveal>
          <SectionHeading
            className="reveal-card"
            eyebrow="Signature itineraries"
            title="Popular Tour Packages"
            description="Curated Sri Lankan journeys crafted for intimacy, authentic heritage, and absolute comfort."
          />
          {popularLoading ? (
            <div className="mt-10">
              <LoadingState label="Loading popular tours" />
            </div>
          ) : null}
          {popularError ? (
            <div className="mt-10">
              <ErrorState title="Popular tours are unavailable" message="The rest of this page is still available." />
            </div>
          ) : null}
          {!popularLoading && !popularError && popularTours.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No popular tours yet"
                message="Published tours marked as popular will appear here."
              />
            </div>
          ) : null}
          {!popularLoading && !popularError && popularTours.length > 0 ? (
            <ul className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-start">
              {popularTours.map((tour, index) => (
                <li key={tour.id} className="reveal-card" style={{ animationDelay: `${index * 80}ms` }}>
                  <TourCard tour={tour} />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-10 flex justify-center">
            <ButtonLink to={paths.tours} variant="primary" className="lift-button">
              View All Handcrafted Tours
            </ButtonLink>
          </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <Reveal>
          <SectionHeading
            className="reveal-card"
            align="center"
            eyebrow="The Ceylon landscape"
            title="Destinations"
            description="From ancient kingdoms and misty tea highlands to golden southern shores and untamed wilderness. Discover Sri Lanka’s iconic heritage, breathtaking landscapes, and tranquil coastal escapes, each with its own story to tell."
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listPublishedDestinations()
              .slice(0, 6)
              .map((destination, index) => (
                <li key={destination.id} className="reveal-card" style={{ animationDelay: `${index * 80}ms` }}>
                  <DestinationCard destination={destination} variant="overlay" />
                </li>
              ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <ButtonLink to={paths.destinations} variant="primary" className="lift-button">
              View All Destinations
            </ButtonLink>
          </div>
          </Reveal>
        </Container>
      </section>

      <WhyTravelersSection />

      <Reveal>
        <HomeInquirySection />
      </Reveal>

      <section className="py-16 lg:py-24">
        <Container>
          <Reveal>
          <SectionHeading
            className="reveal-card"
            align="center"
            eyebrow="Traveler stories"
            title="What Our Travelers Are Saying"
          />
          {reviewRating != null ? (
            <p className="reveal-card mt-4 flex items-center justify-center gap-2 text-lg font-bold text-brand">
              <span>{reviewRating.toFixed(1)}/5</span>
              <Icon name="star" filled className="text-[20px] text-accent" label={`${reviewRating.toFixed(1)} out of 5`} />
            </p>
          ) : null}
          <ul className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-start">
            {homeReviews.map((review, index) => (
              <li key={`${review.travelerName}-${index}`} className="reveal-card" style={{ animationDelay: `${index * 80}ms` }}>
                <ReviewCard {...review} />
              </li>
            ))}
          </ul>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
