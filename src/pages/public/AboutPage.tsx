import { useEffect, useState } from 'react'
import { AboutApproachSection } from '@/components/about/AboutApproachSection.tsx'
import { AboutTeamSection } from '@/components/about/AboutTeamSection.tsx'
import { AboutWhyTravelersSection } from '@/components/about/AboutWhyTravelersSection.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  ABOUT_DEFAULT_HERO_IMAGE_URL,
  ABOUT_DEFAULT_ORIGINS_IMAGE_URL,
  ABOUT_DISTINCTION_FALLBACK_ICON,
  originsQuoteBody,
} from '@/config/aboutContent.ts'
import { siteConfig } from '@/config/site.ts'
import {
  getPublicAboutPage,
  type PublicAboutPage,
} from '@/services/firebase/about.ts'
import { listPublishedWhyTravelerItems, type WhyTravelerRecord } from '@/services/firebase/whyTravelers.ts'
import { cn } from '@/utils/cn.ts'

function FallbackImage({
  src,
  fallback,
  alt,
  className,
}: {
  src: string
  fallback: string
  alt: string
  className?: string
}) {
  const [current, setCurrent] = useState(src || fallback)

  useEffect(() => {
    setCurrent(src || fallback)
  }, [src, fallback])

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== fallback) {
          setCurrent(fallback)
        }
      }}
    />
  )
}

function factColumns(count: number): string {
  if (count <= 1) {
    return ''
  }
  if (count === 2) {
    return 'sm:grid-cols-2'
  }
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

export function AboutPage() {
  const [content, setContent] = useState<PublicAboutPage | null>(null)
  const [whyItems, setWhyItems] = useState<WhyTravelerRecord[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    getPublicAboutPage()
      .then((page) => {
        if (active) {
          setContent(page)
        }
      })
      .catch(() => {
        if (active) {
          setError(true)
        }
      })

    listPublishedWhyTravelerItems()
      .then((items) => {
        if (active) {
          setWhyItems(items.filter((item) => item.title.trim() && item.description.trim()))
        }
      })
      .catch(() => {
        if (active) {
          setWhyItems([])
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <>
        <PageMeta title="About us" description={siteConfig.shortDescription} />
        <section className="py-24">
          <Container>
            <ErrorState title="About Us could not be loaded" message="Please refresh the page and try again." />
          </Container>
        </section>
      </>
    )
  }

  if (!content) {
    return (
      <>
        <PageMeta title="About us" description={siteConfig.shortDescription} />
        <section className="py-24">
          <LoadingState label="Loading About Us" />
        </section>
      </>
    )
  }

  const { hero, distinction, origins } = content
  const heroDescription = hero.description.trim()
  const pageDescription = heroDescription || siteConfig.shortDescription
  const originsQuote = originsQuoteBody(origins.description)

  return (
    <>
      <PageMeta title="About us" description={pageDescription} />

      <section className="relative isolate min-h-[66.67vh] overflow-hidden text-on-brand supports-[height:1svh]:min-h-[66.67svh]">
        <FallbackImage
          src={hero.imageUrl}
          fallback={ABOUT_DEFAULT_HERO_IMAGE_URL}
          alt=""
          className="absolute inset-0 size-full object-cover object-[85%_center] lg:object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand via-brand/80 to-brand/35"
          aria-hidden="true"
        />
        <Container className="relative z-10 flex min-h-[66.67vh] flex-col justify-center pt-14 pb-20 supports-[height:1svh]:min-h-[66.67svh] lg:pt-28 lg:pb-24">
          <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-gold-soft">About</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            {hero.title}
          </h1>
          {heroDescription ? (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-body text-on-brand-soft/90">{heroDescription}</p>
          ) : null}
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">THE RADSLANKA DISTINCTION</p>
            <h2 className="mt-2 whitespace-pre-line font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">
              {distinction.catchphrase}
            </h2>
          </div>
          <div>
            <p className="whitespace-pre-line text-body text-muted">{distinction.description}</p>
            {distinction.facts.length > 0 ? (
              <ul className={cn('mt-8 grid gap-4', factColumns(distinction.facts.length))}>
                {distinction.facts.map((card) => (
                  <li key={card.id} className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                    <Icon name={card.icon.trim() || ABOUT_DISTINCTION_FALLBACK_ICON} className="text-brand" />
                    <h3 className="mt-3 whitespace-pre-line font-bold text-brand">{card.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted">{card.description}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </section>

      {origins.published ? (
        <section className="bg-surface-elevated py-16 lg:py-24">
          <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-surface-mist p-8 sm:h-96 lg:h-[28rem]">
              <FallbackImage
                src={origins.imageUrl}
                fallback={ABOUT_DEFAULT_ORIGINS_IMAGE_URL}
                alt="RadsLanka Tours"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">OUR ORIGINS</p>
              <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">{origins.title}</h2>
              {originsQuote ? (
                <blockquote className="mt-6 border-l-2 border-accent pl-4 text-body text-ink italic">
                  <span className="whitespace-pre-line">“{originsQuote}”</span>
                </blockquote>
              ) : null}
              <ul className="mt-8 grid grid-cols-2 gap-2 sm:gap-3">
                <li className="min-w-0 rounded-xl bg-surface-mist p-3 text-center sm:p-4">
                  <p className="text-xl font-bold text-brand">{origins.journeyCount}</p>
                  <p className="mt-1 text-[11px] font-bold tracking-[0.08em] break-words text-balance text-muted uppercase">
                    Journeys
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">No. of journeys completed so far</p>
                </li>
                <li className="min-w-0 rounded-xl bg-surface-mist p-3 text-center sm:p-4">
                  <p className="text-xl font-bold text-brand">{origins.ownershipValue}</p>
                  <p className="mt-1 text-[11px] font-bold tracking-[0.08em] break-words text-balance text-muted uppercase">
                    {origins.ownershipLabel}
                  </p>
                </li>
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

      {content.teamLoaded ? <AboutTeamSection members={content.team} /> : null}
      {whyItems ? <AboutWhyTravelersSection items={whyItems} /> : null}
      {content.approachesLoaded ? <AboutApproachSection approaches={content.approaches} /> : null}
    </>
  )
}
