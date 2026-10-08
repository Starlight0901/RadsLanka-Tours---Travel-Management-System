import { useEffect, useMemo, useState } from 'react'
import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Reveal } from '@/components/common/Reveal.tsx'
import { BespokeJourneySection } from '@/components/tours/BespokeJourneySection.tsx'
import { GlassFilterSelect } from '@/components/tours/GlassFilterSelect.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { WhyTravelersSection } from '@/components/tours/WhyTravelersSection.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Drawer } from '@/components/ui/Drawer.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  defaultTourListFilters,
  filterTours,
  tourBudgetFilters,
  tourDurationFilters,
  tourRegionFilters,
  type TourListFilters,
} from '@/data/tourCatalog.ts'
import { toCatalogTours } from '@/services/firebase/tourAdapter.ts'
import { listPublishedTours } from '@/services/firebase/tours.ts'
import type { CatalogTour } from '@/types/tours.ts'
import { cn } from '@/utils/cn.ts'

const listingCopy = {
  title: 'Explore Our Sri Lankan Tours',
  intro:
    'Discover unforgettable journeys across Sri Lanka, designed around the places, wildlife, and sanctuary stays you wish to experience.',
  summary: 'Featured Ceylon itineraries',
}

export function ToursPage() {
  const [filters, setFilters] = useState<TourListFilters>(defaultTourListFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [publishedTours, setPublishedTours] = useState<CatalogTour[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const tours = useMemo(() => filterTours(publishedTours, filters), [publishedTours, filters])
  const availableStyles = useMemo(() => {
    const names = new Set<string>()
    for (const tour of publishedTours) {
      const name = tour.travelStyle?.trim()
      if (name) {
        names.add(name)
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [publishedTours])
  const availableTags = useMemo(() => {
    const names = new Set<string>()
    for (const tour of publishedTours) {
      for (const tag of tour.tags) {
        if (tag.trim()) {
          names.add(tag)
        }
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [publishedTours])

  useEffect(() => {
    let active = true

    listPublishedTours()
      .then((records) => toCatalogTours(records))
      .then((next) => {
        if (active) {
          setPublishedTours(next)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(true)
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

  function update<K extends keyof TourListFilters>(key: K, value: TourListFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <>
      <PageMeta title="Tours" description={listingCopy.intro} />

      <section className="relative isolate overflow-hidden text-on-brand">
        <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/75 to-brand/30" aria-hidden="true" />
        <Container className="relative z-10 pt-10 pb-24 lg:pt-16 lg:pb-36">
          <Reveal>
          <h1 className="max-w-4xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            {listingCopy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{listingCopy.intro}</p>
          </Reveal>
        </Container>
      </section>

      <Container className="relative z-20 -mt-12 hidden lg:block">
        <Reveal>
        <div className="tour-glass relative rounded-2xl p-2.5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.12)_28%,transparent_50%)]"
          />
          <div className="relative">
          <FilterFields
            filters={filters}
            availableStyles={availableStyles}
            availableTags={availableTags}
            onChange={update}
            onReset={() => setFilters(defaultTourListFilters)}
          />
          </div>
        </div>
        </Reveal>
      </Container>

      <Container className="pt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="lift-button flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/75 text-[13px] font-semibold text-brand shadow-[0_8px_24px_rgba(15,40,30,0.06)] backdrop-blur-[16px]"
        >
          <Icon name="tune" className="text-[16px]" />
          Filters & search
        </button>
      </Container>

      <Drawer open={filtersOpen} title="Filter tours" onClose={() => setFiltersOpen(false)}>
        <FilterFields
          filters={filters}
          availableStyles={availableStyles}
          availableTags={availableTags}
          onChange={update}
          onReset={() => setFilters(defaultTourListFilters)}
        />
      </Drawer>

      <section className="py-10 lg:py-16">
        <Container>
          <Reveal>
          <div className="reveal-card flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-3 text-lg font-bold text-brand">
              <span className="size-3 rounded-full bg-accent" />
              {listingCopy.summary}
              <span className="rounded-full bg-chip px-3 py-1 text-[12px] font-bold text-chip-text">
                {tours.length} of {publishedTours.length}
              </span>
            </h2>
            <p className="text-[13px] text-muted">Published tours</p>
          </div>

          {loading ? (
            <div className="mt-8">
              <LoadingState label="Loading tours" />
            </div>
          ) : null}

          {loadError ? (
            <div className="mt-8">
              <ErrorState title="Tours are unavailable" message="Please try again in a moment." />
            </div>
          ) : null}

          {!loading && !loadError && tours.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No matching journeys"
                message="Adjust the filters to see more published tours."
                action={
                  <Button variant="ghost" className="lift-button" onClick={() => setFilters(defaultTourListFilters)}>
                    Reset filters
                  </Button>
                }
              />
            </div>
          ) : null}

          {!loading && !loadError && tours.length > 0 ? (
            <ul className="mt-8 grid gap-8 lg:grid-cols-3">
              {tours.map((tour, index) => (
                <li key={tour.id} className="reveal-card" style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}>
                  <TourCard tour={tour} />
                </li>
              ))}
            </ul>
          ) : null}
          </Reveal>
        </Container>
      </section>

      <BespokeJourneySection />

      <WhyTravelersSection />
    </>
  )
}

const filterControlClass =
  'h-10 rounded-xl border border-white/80 bg-white/60 px-3 text-[13px] text-ink outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-brand/35'

function filtersAreActive(filters: TourListFilters) {
  return (
    filters.query.trim() !== '' ||
    filters.duration !== defaultTourListFilters.duration ||
    filters.region !== defaultTourListFilters.region ||
    filters.style !== defaultTourListFilters.style ||
    filters.quick !== defaultTourListFilters.quick ||
    filters.tags.length > 0 ||
    filters.budget !== defaultTourListFilters.budget ||
    filters.sort !== defaultTourListFilters.sort
  )
}

function FilterFields({
  filters,
  availableStyles,
  availableTags,
  onChange,
  onReset,
}: {
  filters: TourListFilters
  availableStyles: string[]
  availableTags: string[]
  onChange: <K extends keyof TourListFilters>(key: K, value: TourListFilters[K]) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <label className="relative block min-w-0 lg:min-w-52 lg:flex-1">
          <span className="sr-only">Search tours</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[16px] text-muted" />
          <input
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Search by place, style, or keyword"
            className={cn(filterControlClass, 'w-full pr-3 pl-9')}
          />
        </label>
        <GlassFilterSelect
          label="Duration"
          value={filters.duration}
          options={tourDurationFilters.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(value) => onChange('duration', value)}
          className="lg:w-36"
        />
        <GlassFilterSelect
          label="Region"
          value={filters.region}
          options={tourRegionFilters.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(value) => onChange('region', value)}
          className="lg:w-40"
        />
        <GlassFilterSelect
          label="Travel style"
          value={filters.style}
          options={[
            { value: 'all', label: 'All travel styles' },
            ...availableStyles.map((style) => ({ value: style, label: style })),
          ]}
          onChange={(value) => onChange('style', value)}
          className="lg:w-40"
        />
        <GlassFilterSelect
          label="Budget"
          value={filters.budget}
          options={tourBudgetFilters.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(value) => onChange('budget', value)}
          className="lg:w-52"
        />
        <GlassFilterSelect
          label="Sort"
          value={filters.sort}
          options={[
            { value: 'featured', label: 'Featured first' },
            { value: 'duration', label: 'Duration' },
          ]}
          onChange={(value) => onChange('sort', value as TourListFilters['sort'])}
          className="lg:w-36"
        />
        {filtersAreActive(filters) ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 text-[13px] font-semibold text-brand hover:bg-white/70"
          >
            <Icon name="restart_alt" className="text-[16px]" />
            Clear
          </button>
        ) : null}
      </div>
      {availableTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">Keywords</p>
          <ul aria-label="Keywords, match any selected keyword" className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const selected = filters.tags.some((item) => item.toLowerCase() === tag.toLowerCase())
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange(
                        'tags',
                        selected
                          ? filters.tags.filter((item) => item.toLowerCase() !== tag.toLowerCase())
                          : [...filters.tags, tag],
                      )
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] uppercase transition duration-150 hover:scale-[1.02]',
                      selected
                        ? 'border-brand bg-brand text-on-brand'
                        : 'border-brand/10 bg-white/55 text-brand hover:bg-[rgba(27,67,50,0.08)]',
                    )}
                  >
                    {tag}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
