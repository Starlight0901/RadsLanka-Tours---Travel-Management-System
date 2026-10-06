import { useMemo, useState } from 'react'
import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { TourCard } from '@/components/tours/TourCard.tsx'
import { Button, ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Drawer } from '@/components/ui/Drawer.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import {
  defaultTourListFilters,
  filterPublishedTours,
  listPublishedTours,
  tourCategories,
  tourDurationFilters,
  tourQuickFilters,
  tourRegionFilters,
  tourStyleFilters,
  type TourListFilters,
} from '@/data/tourCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const listingCopy = {
  eyebrow: '[Listing eyebrow from Figma]',
  title: 'Explore Our Sri Lankan Tours',
  intro:
    'Discover unforgettable journeys across Sri Lanka, designed around the places, wildlife, and sanctuary stays you wish to experience.',
  summary: 'Featured Ceylon itineraries',
}

const listingPillars = [
  { icon: 'groups', title: '100% Private & Custom', body: '[Pillar copy from Figma]' },
  { icon: 'hotel', title: 'Handpicked Stays', body: '[Pillar copy from Figma]' },
  { icon: 'badge', title: 'SLTDA Licensed Guides', body: '[Pillar copy from Figma]' },
  { icon: 'support_agent', title: '24/7 Island Concierge', body: '[Pillar copy from Figma]' },
]

export function ToursPage() {
  const [filters, setFilters] = useState<TourListFilters>(defaultTourListFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const publishedCount = listPublishedTours().length
  const tours = useMemo(() => filterPublishedTours(filters), [filters])

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
          <p className="inline-flex items-center gap-2 text-[13px] text-gold-soft">
            <span className="size-2 rounded-full bg-accent" />
            {listingCopy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            {listingCopy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{listingCopy.intro}</p>
          <ul className="-mx-gutter mt-8 flex gap-2 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {tourCategories.map((category) => {
              const active = (filters.style === 'all' && category === 'All') || filters.style === category
              return (
                <li key={category} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => update('style', category === 'All' ? 'all' : category)}
                    className={cn(
                      'min-h-11 rounded-full px-5 py-2 text-[13px] font-semibold',
                      active ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-on-brand backdrop-blur-md',
                    )}
                  >
                    {category}
                  </button>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      <Container className="relative z-20 -mt-16 hidden lg:block">
        <div className="rounded-2xl bg-surface-elevated p-8 shadow-[0_20px_50px_-12px_rgba(27,67,50,0.18)]">
          <FilterFields filters={filters} onChange={update} />
        </div>
      </Container>

      <Container className="pt-6 lg:hidden">
        <Button variant="ghost" className="w-full" onClick={() => setFiltersOpen(true)}>
          <Icon name="tune" className="text-[18px]" />
          Filters & search
        </Button>
      </Container>

      <Drawer open={filtersOpen} title="Filter tours" onClose={() => setFiltersOpen(false)}>
        <FilterFields filters={filters} onChange={update} />
      </Drawer>

      <section className="py-10 lg:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-3 text-lg font-bold text-brand">
              <span className="size-3 rounded-full bg-accent" />
              {listingCopy.summary}
              <span className="rounded-full bg-chip px-3 py-1 text-[12px] font-bold text-chip-text">
                {tours.length} of {publishedCount}
              </span>
            </h2>
            <p className="text-[13px] text-muted">[MOCK] Structured catalog — unpublished tours are hidden.</p>
          </div>

          {tours.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No matching journeys"
                message="Adjust filters to see published tours from the mock catalog."
                action={
                  <Button variant="ghost" onClick={() => setFilters(defaultTourListFilters)}>
                    Reset filters
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-8 grid gap-8 lg:grid-cols-3">
              {tours.map((tour) => (
                <li key={tour.id}>
                  <TourCard tour={tour} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-brand py-16 text-on-brand lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[13px] text-gold-soft">
                <Icon name="auto_awesome" className="text-[16px]" />
                [Bespoke journeys]
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
                Can&apos;t find the exact route you&apos;re looking for?
              </h2>
              <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">
                Every RadsLanka journey can be custom-tailored to your exact pace, hotel preferences, budget, and travel
                dates. Whether you seek quiet secret bays or high-altitude mountain hiking, our Ceylon travel architects
                curate the perfect private itinerary.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-[15px]">
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="text-accent" />
                  [Custom pacing]
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="text-accent" />
                  [Stay preferences]
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="text-accent" />
                  [Private chauffeur]
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="text-accent" />
                  [Flexible dates]
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <ButtonLink to={paths.inquiry} variant="primary">
                Create your Own Tour Plan
              </ButtonLink>
              <ButtonLink to={paths.contact} variant="glass">
                Talk to a specialist
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="The RadsLanka distinction"
            title="Why Travelers Choose RadsLanka"
            description="[Why-travel section introduction from Figma]"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {listingPillars.map((pillar) => (
              <li key={pillar.title} className="rounded-2xl bg-surface-elevated p-8 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-mist text-brand">
                  <Icon name={pillar.icon} className="text-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand">{pillar.title}</h3>
                <p className="mt-3 text-body text-muted">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: TourListFilters
  onChange: <K extends keyof TourListFilters>(key: K, value: TourListFilters[K]) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <label className="relative block">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Search by place, e.g. Sigiriya, Ella, Galle..."
            className="h-12 w-full rounded-control border border-border bg-surface-elevated pr-4 pl-11 text-body outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <select
          value={filters.duration}
          onChange={(event) => onChange('duration', event.target.value)}
          className="h-12 rounded-control border border-border bg-surface-elevated px-4 text-body"
          aria-label="Duration"
        >
          {tourDurationFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={filters.region}
          onChange={(event) => onChange('region', event.target.value)}
          className="h-12 rounded-control border border-border bg-surface-elevated px-4 text-body"
          aria-label="Region"
        >
          {tourRegionFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={filters.style}
          onChange={(event) => onChange('style', event.target.value)}
          className="h-12 rounded-control border border-border bg-surface-elevated px-4 text-body"
          aria-label="Travel style"
        >
          {tourStyleFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.55px] text-muted uppercase">Quick</span>
          {tourQuickFilters.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChange('quick', filters.quick === chip ? '' : chip)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-bold',
                filters.quick === chip ? 'bg-brand text-on-brand' : 'bg-chip text-chip-text',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => onChange('sort', event.target.value as TourListFilters['sort'])}
            className="h-9 rounded-control border border-border bg-surface-elevated px-3 text-body text-ink"
          >
            <option value="featured">Featured first</option>
            <option value="duration">Duration</option>
          </select>
        </label>
      </div>
    </div>
  )
}
