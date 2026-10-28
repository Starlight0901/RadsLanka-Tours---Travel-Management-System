import { useEffect, useMemo, useState } from 'react'
import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { DestinationCard } from '@/components/destinations/DestinationCard.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  DESTINATION_LISTING_FILTERS,
  characteristicLabels,
  destinationMatchesListingFilter,
  formatLocation,
  type DestinationListingFilterId,
} from '@/config/destinationContent.ts'
import { paths } from '@/routes/paths.ts'
import { toCatalogDestination } from '@/services/firebase/destinationAdapter.ts'
import { listPublishedDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import type { CatalogDestination } from '@/types/destinations.ts'
import { cn } from '@/utils/cn.ts'

type VisibilityFilter = 'all' | 'featured' | 'popular'

const visibilityOptions: { value: VisibilityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'featured', label: 'Featured' },
  { value: 'popular', label: 'Popular' },
]

const listingCopy = {
  title: 'Discover Sri Lanka',
  intro: 'From ancient kingdoms and misty tea highlands to golden southern shores and untamed wilderness. Discover Sri Lanka’s iconic heritage, breathtaking landscapes, and tranquil coastal escapes, each with its own story to tell.',
  collectionTitle: 'The Ceylon Collection',
  collectionIntro:
    'Each region reveals distinct elevation, climate, and traditions. Explore handpicked destination hubs tailored with private vehicle door-to-door comfort.',
}

function toListingCard(record: DestinationRecord): CatalogDestination {
  const destination = toCatalogDestination(record)
  const location = formatLocation(record.glance.province, record.glance.district)
  const summary = record.description.trim() || record.subtitle.trim()
  return {
    ...destination,
    region: location || undefined,
    shortDescription: summary,
    tags: characteristicLabels(record.glance.characteristics, record.glance.characteristicOther),
  }
}

function destinationMatchesQuery(record: DestinationRecord, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }
  const location = formatLocation(record.glance.province, record.glance.district)
  const haystack = [
    record.name,
    record.subtitle,
    record.description,
    record.slug,
    location,
    ...characteristicLabels(record.glance.characteristics, record.glance.characteristicOther),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function DestinationsPage() {
  const [records, setRecords] = useState<DestinationRecord[]>([])
  const [region, setRegion] = useState<DestinationListingFilterId>('all')
  const [visibility, setVisibility] = useState<VisibilityFilter>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : 'Add your Firebase web config to load destinations.',
  )

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    listPublishedDestinations()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load published destinations', loadError)
        if (active) {
          setRecords([])
          setError(loadError instanceof Error ? loadError.message : 'Unable to load destinations.')
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

  const visibleRecords = useMemo(() => {
    let next = records
    if (visibility === 'featured') {
      next = next.filter((record) => record.featured)
    } else if (visibility === 'popular') {
      next = next.filter((record) => record.popular)
    }
    next = next.filter((record) => destinationMatchesListingFilter(record, region))
    next = next.filter((record) => destinationMatchesQuery(record, query))
    if (visibility === 'popular') {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    }
    return next
  }, [query, records, region, visibility])
  const visible = useMemo(() => visibleRecords.map(toListingCard), [visibleRecords])
  const filtersActive = visibility !== 'all' || region !== 'all' || query.trim() !== ''

  return (
    <>
      <PageMeta title="Destinations" description={listingCopy.collectionIntro} />

      <section className="relative isolate overflow-hidden text-on-brand lg:flex lg:h-[66.67vh] lg:flex-col">
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[80%_center] sm:object-[72%_center] lg:object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/75 to-brand/25" />
        <Container className="relative z-10 pt-12 pb-16 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pt-20 lg:pb-16">
          <h1 className="max-w-3xl font-display text-[2.25rem] leading-tight font-semibold min-[375px]:text-[2.5rem] lg:text-[3.75rem]">
            {listingCopy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{listingCopy.intro}</p>
          <ul className="mt-8 grid grid-cols-3 gap-2 lg:flex">
            {DESTINATION_LISTING_FILTERS.map((item) => (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  aria-pressed={region === item.id}
                  onClick={() => setRegion(item.id)}
                  className={cn(
                    'flex h-full min-h-11 w-full items-center justify-center rounded-full px-2 text-center text-[12px] leading-tight font-semibold text-balance transition-transform max-lg:active:scale-[0.97] min-[375px]:text-[12.5px] lg:w-auto lg:px-5 lg:text-[13px]',
                    region === item.id ? 'bg-accent text-accent-foreground' : 'bg-white/10',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-12 lg:py-20">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block min-w-0 sm:max-w-sm sm:flex-1">
              <span className="sr-only">Search destinations</span>
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[16px] text-muted"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search destinations"
                className="h-11 w-full rounded-full border border-border bg-white pr-4 pl-10 text-[13px] text-brand outline-none focus-visible:ring-2 focus-visible:ring-[#C99700]"
              />
            </label>
            <label className="block sm:w-48">
              <span className="sr-only">Destination status</span>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as VisibilityFilter)}
                className="h-11 w-full rounded-full border border-border bg-white px-4 text-[13px] font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-[#C99700]"
              >
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-[2rem] font-semibold text-brand">{listingCopy.collectionTitle}</h2>
              <p className="mt-2 max-w-2xl text-body text-muted">{listingCopy.collectionIntro}</p>
            </div>
            {!loading && !error ? (
              <p className="text-[13px] text-muted">
                {visible.length} {visible.length === 1 ? 'destination' : 'destinations'}
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="mt-10">
              <LoadingState label="Loading destinations" />
            </div>
          ) : null}

          {!loading && error ? (
            <div className="mt-10">
              <ErrorState title="Unable to load destinations" message={error} />
            </div>
          ) : null}

          {!loading && !error && records.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No published destinations yet"
                message="Destinations published in the admin panel will appear here."
              />
            </div>
          ) : null}

          {!loading && !error && records.length > 0 && visible.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title={
                  filtersActive ? 'No destinations match these filters' : 'No destinations found in this category yet.'
                }
                message={
                  filtersActive
                    ? 'Try another status, region, or search term. Unpublished destinations stay hidden.'
                    : 'Published destinations appear here when their saved location or destination type matches this filter.'
                }
              />
            </div>
          ) : null}

          {!loading && !error && visible.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
              {visible.map((destination) => (
                <li key={destination.id} className="lg:col-span-6">
                  <DestinationCard destination={destination} />
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      <section className="bg-brand py-16 text-on-brand lg:py-20">
        <Container className="text-center">
          <h2 className="font-display text-[2rem] font-semibold lg:text-[2.75rem]">Build a route across these regions</h2>
          <div className="mt-8">
            <ButtonLink to={paths.inquiry} variant="primary">
              Plan a custom itinerary
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
