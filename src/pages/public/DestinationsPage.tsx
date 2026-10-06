import { useMemo, useState } from 'react'
import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { DestinationCard } from '@/components/destinations/DestinationCard.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { destinationRegionJumps, listPublishedDestinations } from '@/data/destinationCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const listingCopy = {
  eyebrow: '[Destinations eyebrow from Figma]',
  title: 'Discover Sri Lanka',
  intro: 'From ancient kingdoms and misty tea highlands to golden southern shores and untamed wilderness. Discover Sri Lanka’s iconic heritage, breathtaking landscapes, and tranquil coastal escapes, each with its own story to tell.',
  collectionEyebrow: '[Collection eyebrow]',
  collectionTitle: 'The Ceylon Collection',
  collectionIntro:
    'Each region reveals distinct elevation, climate, and traditions. Explore handpicked destination hubs tailored with private vehicle door-to-door comfort.',
}

const mobileStats = [
  { value: '[Stat]', label: 'UNESCO Heritage Sites', icon: 'account_balance' },
  { value: '[Stat]', label: 'Wildlife Sanctuaries', icon: 'pets' },
  { value: '[Stat]', label: 'Pristine Coastline', icon: 'waves' },
  { value: '[Stat]', label: 'Private Chauffeur', icon: 'directions_car' },
]

export function DestinationsPage() {
  const destinations = listPublishedDestinations()
  const [region, setRegion] = useState('all')

  const visible = useMemo(() => {
    if (region === 'all') return destinations
    if (region === 'nuwara-eliya') {
      return destinations.filter((item) => item.id === 'nuwara-eliya' || item.id === 'ella')
    }
    return destinations.filter((item) => item.id === region)
  }, [destinations, region])

  return (
    <>
      <PageMeta title="Destinations" description={listingCopy.collectionIntro} />

      <section className="relative isolate overflow-hidden text-on-brand">
        <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/75 to-brand/25" />
        <Container className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] backdrop-blur-md">
            <Icon name="explore" className="text-[16px]" />
            {listingCopy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            {listingCopy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{listingCopy.intro}</p>
          <ul className="mt-8 hidden gap-2 lg:flex">
            {destinationRegionJumps.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setRegion(item.id)}
                  className={cn(
                    'min-h-11 rounded-full px-5 text-[13px] font-semibold',
                    region === item.id ? 'bg-accent text-accent-foreground' : 'bg-white/10',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
            {mobileStats.map((stat) => (
              <li key={stat.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-md">
                <p className="flex items-center gap-2 text-lg font-bold">
                  <Icon name={stat.icon} className="text-[18px]" />
                  {stat.value}
                </p>
                <p className="mt-1 text-[12px] text-on-brand-soft">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-12 lg:py-20">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">{listingCopy.collectionEyebrow}</p>
              <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">{listingCopy.collectionTitle}</h2>
              <p className="mt-2 max-w-2xl text-body text-muted">{listingCopy.collectionIntro}</p>
            </div>
            <p className="text-[13px] text-muted">[MOCK] {visible.length} published destinations</p>
          </div>

          {visible.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No matching regions" message="Choose another region jump to see published destinations." />
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 lg:grid-cols-12">
              {visible.map((destination) => {
                const span =
                  destination.gridCols === 7
                    ? 'lg:col-span-7'
                    : destination.gridCols === 5
                      ? 'lg:col-span-5'
                      : 'lg:col-span-6'
                return (
                  <li key={destination.id} className={span}>
                    <DestinationCard destination={destination} />
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-eyebrow uppercase">
              <Icon name="route" />
              [Route callout]
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">
              [How we connect these regions]
            </h2>
            <p className="mt-4 text-body text-muted">[Chauffeur connection copy from Figma]</p>
            <ul className="mt-6 space-y-4">
              {['[Route benefit]', '[Route benefit]', '[Route benefit]'].map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-2xl bg-surface p-4 shadow-card">
                  <p className="font-bold text-brand">{item}</p>
                  <p className="mt-1 text-body text-muted">[Benefit detail from Figma]</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-80 overflow-hidden rounded-2xl lg:h-[28rem]">
            <PlaceholderMedia label="Island route map [placeholder]" />
          </div>
        </Container>
      </section>

      <section className="bg-brand py-16 text-on-brand lg:py-20">
        <Container className="text-center">
          <h2 className="font-display text-[2rem] font-semibold lg:text-[2.75rem]">Build a route across these regions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-body text-on-brand-soft/90">[Bespoke journey builder copy from Figma]</p>
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
