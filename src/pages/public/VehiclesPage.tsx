import { useMemo, useState, type FormEvent } from 'react'
import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { FormTextarea } from '@/components/forms/FormTextarea.tsx'
import { Select } from '@/components/forms/Select.tsx'
import { VehicleCard } from '@/components/vehicles/VehicleCard.tsx'
import { Button, ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { siteConfig } from '@/config/site.ts'
import {
  filterPublishedVehicles,
  listPublishedVehicles,
  matchVehicleForParty,
  vehicleTypeFilters,
} from '@/data/vehicleCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const serviceStandards = [
  { title: 'Licensed Chauffeur-', body: '[Chauffeur standard detail from Figma]', icon: 'badge' },
  { title: 'All-Inclusive Transparent', body: '[Pricing standard detail from Figma]', icon: 'payments' },
  { title: 'Daily Sanitization & Care', body: '[Care standard detail from Figma]', icon: 'health_and_safety' },
  { title: 'Total Pacing Freedom', body: '[Pacing standard detail from Figma]', icon: 'schedule' },
]

export function VehiclesPage() {
  const [type, setType] = useState('all')
  const [travelers, setTravelers] = useState(2)
  const [terrain, setTerrain] = useState('heritage')
  const [quoteSent, setQuoteSent] = useState(false)
  const vehicles = useMemo(() => filterPublishedVehicles(type), [type])
  const match = matchVehicleForParty(travelers, terrain)
  const phone = siteConfig.phone.trim() || siteConfig.placeholders.phone

  function onQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuoteSent(true)
  }

  return (
    <>
      <PageMeta
        title="Vehicles & Chauffeur Fleet"
        description="Choose the right vehicle for a comfortable and reliable journey across Sri Lanka. Every mile is tailored, private, and guided with gracious local hospitality."
      />

      <section className="relative isolate overflow-hidden text-on-brand">
        <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/75 to-brand/30" />
        <Container className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] backdrop-blur-md">
            <span className="size-2 rounded-full bg-accent" />
            CURATED TRANSPORT
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            Travel in Comfort
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">
            Choose the right vehicle for a comfortable and reliable journey across Sri Lanka. Every mile is tailored,
            private, and guided with gracious local hospitality.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="#fleet" variant="primary">
              Private Fleet Selection
              <Icon name="arrow_forward" className="text-[12px]" />
            </ButtonLink>
            <ButtonLink to="#vehicle-quote" variant="glass">
              Request a Bespoke Quote
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-surface-elevated p-8 shadow-card lg:p-12">
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">UNCOMPROMISING QUALITY</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">The Chauffeur Standard</h2>
            <p className="mt-3 max-w-3xl text-body text-muted">
              More than navigating roads; our drivers are island custodians dedicated to your serenity.
            </p>
          </div>
        </Container>
      </section>

      <section id="fleet" className="pb-12 lg:pb-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Private Fleet Selection</p>
              <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">
                Thoughtfully Selected for Island Terrain
              </h2>
              <p className="mt-2 max-w-xl text-body text-muted">
                Each model meticulously detailed, air-conditioned, and maintained to international executive safety
                standards.
              </p>
            </div>
            <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              {vehicleTypeFilters.map((filter) => (
                <li key={filter.value} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setType(filter.value)}
                    className={cn(
                      'min-h-11 rounded-full px-5 text-[13px] font-semibold',
                      type === filter.value ? 'bg-brand text-on-brand' : 'bg-chip text-chip-text',
                    )}
                  >
                    {filter.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {vehicles.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No matching vehicles" message="Choose another fleet type to see published vehicles." />
            </div>
          ) : (
            <ul className="mt-10 grid gap-8 lg:grid-cols-2">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="The RadsLanka chauffeur standard"
            title="Included service standards"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceStandards.map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface p-6 shadow-card">
                <Icon name={item.icon} className="text-brand" />
                <h3 className="mt-3 text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-2 text-body text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container className="grid gap-8 rounded-2xl bg-surface-elevated p-8 shadow-card lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">FLEET MATCHER CONCIERGE</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">Not sure which vehicle fits your route?</h2>
            <p className="mt-3 text-body text-muted">
              Input your group size and desired Sri Lankan itinerary style. We’ll instantly identify the ideal balance of
              legroom, luggage volume, and terrain dynamics.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-brand">
                TRAVELERS
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={travelers}
                  onChange={(event) => setTravelers(Number(event.target.value) || 1)}
                  className="mt-1.5 h-12 w-full rounded-control border border-border px-4 text-body"
                />
              </label>
              <label className="text-sm font-semibold text-brand">
                TRIP CHARACTER
                <select
                  value={terrain}
                  onChange={(event) => setTerrain(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-control border border-border px-4 text-body"
                >
                  <option value="heritage">[Heritage]</option>
                  <option value="coast">[Coast]</option>
                  <option value="highlands">[Highlands]</option>
                  <option value="safari">[Safari]</option>
                </select>
              </label>
            </div>
          </div>
          <div className="rounded-2xl bg-surface-mist p-6">
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Recommended match</p>
            <h3 className="mt-2 text-xl font-bold text-brand">{match.name}</h3>
            <p className="mt-2 text-body text-muted">{match.idealFor}</p>
            <ButtonLink to={paths.inquiry} className="mt-6">
              Request this vehicle
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section id="vehicle-quote" className="pb-16 lg:pb-24">
        <Container>
          <div className="rounded-2xl bg-surface-elevated p-8 shadow-card lg:p-12">
            <p className="text-[13px] font-bold text-brand">FAST TURNAROUND • WITHIN 2 HOURS</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">Request a Bespoke Quote</h2>
            <p className="mt-2 max-w-2xl text-body text-muted">
              Share your target dates and party configuration. We will craft a guaranteed fixed-rate proposal with zero
              hidden fees.
            </p>
            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onQuote} noValidate>
              <FormInput id="quote-name" name="name" label="Full Name" required placeholder="e.g. Sarah Jenkins" />
              <FormInput id="quote-email" name="email" type="email" label="Email Address" required placeholder="sarah@example.com" />
              <Select
                id="quote-vehicle"
                name="vehicle"
                label="Vehicle of Choice"
                defaultValue=""
                placeholder="[Select vehicle]"
                options={listPublishedVehicles().map((vehicle) => ({ value: vehicle.id, label: vehicle.name }))}
              />
              <FormInput id="quote-start" name="start" type="date" label="Start Date" />
              <FormInput id="quote-duration" name="duration" type="number" label="Duration (Days)" placeholder="7" />
              <FormTextarea
                id="quote-notes"
                name="notes"
                label="Itinerary highlights or special requests"
                placeholder="Tell us your key stops (e.g. Colombo, Kandy, Ella, Yala) or special requests like child seats, surfing boards, or photography stops..."
              />
              {quoteSent ? (
                <p className="rounded-xl bg-surface-mist px-4 py-3 text-sm text-brand md:col-span-2" role="status">
                  Preview only. Vehicle quotes are not stored yet. Reach us at {phone}.
                </p>
              ) : null}
              <div className="md:col-span-2">
                <Button type="submit">Request Quote</Button>
              </div>
            </form>
          </div>
        </Container>
      </section>
    </>
  )
}
