import heroBackground from '@/assets/background_hero_image.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'

const ethosCards = [
  { title: 'True Unhurried Pacing', body: 'No whistle-stop schedules. Leisurely breakfasts and sunset pauses designed into every day.', icon: 'schedule' },
  { title: 'Sanctuary Stays', body: 'Deep ties with independent heritage estates, private colonial villas, and eco-retreats.', icon: 'villa' },
  { title: 'Zero Hidden Costs', body: 'Total pricing clarity. Expressway tolls, fuel, parking, and driver lodging strictly covered.', icon: 'payments' },
]

const strengths = [
  { title: 'Experienced Local Drivers', body: 'Professionally vetted, national-guide licensed by the Sri Lanka Tourism Development Authority (SLTDA), fluent in English, and versed in native history, birdlife, and botanical heritage.', icon: 'badge' },
  { title: 'Comfortable Vehicles', body: 'Immaculate fleet of whisper-quiet hybrid sedans, executive touring vans, and expedition 4x4s. All outfitted with dual-zone climate control, complimentary Wi-Fi, and cool bottled thambili.', icon: 'directions_car' },
  { title: 'Custom Tour Packages', body: 'Every route is 100% tailor-made. Whether prioritizing slow luxury tea estates, wildlife photography, or architectural heritage, itineraries adjust organically in real time.', icon: 'map' },
  { title: 'Best Price Guarantee', body: 'Direct-to-local transparent rates with zero intermediate booking commissions or forced tourist shop detours. Expressway tolls, driver boarding, and all taxes included upfront.', icon: 'verified' },
  { title: '24/7 Customer Support', body: 'A dedicated Colombo operations concierge is assigned to your trip. From immediate restaurant reservations to sudden weather reroutes, assistance is one WhatsApp message away.', icon: 'headset_mic' },
  { title: 'Safe and Reliable Services', body: 'Full comprehensive passenger and vehicle insurance, daily pre-journey vehicle safety inspections, and seasoned defensive drivers trained for mountain passes and coastal tracks.', icon: 'verified_user' },
]

const stewardship = [
  { title: 'Zero Single-Use Plastics', body: 'We furnish refillable borosilicate flasks and chilled purified spring water throughout all vehicles.' },
  { title: 'Direct Village Economy', body: '100% of village safari tracker fees and artisan experiences go directly to local families and communities.' },
  { title: 'Wildlife Distance Ethics', body: 'Strict non-intrusive park protocols in Yala, Wilpattu, and Udawalawe to protect endangered leopards and elephants.' },
]

const approach = [
  { title: 'Listening & Crafting', body: 'We begin with a personal consultation to understand your cadence. Whether prioritizing secluded tea planter bungalows, wild elephant tracking, or Ayurvedic retreats, drive times are calibrated so you never experience travel fatigue.' },
  { title: 'Native Knowledge in Every Mile', body: "Your chauffeur is a seasoned cultural interpreter. They know precisely when the morning mist clears over Little Adam's Peak, secure temple entries before bus crowds, and introduce you to authentic family kitchens off the map." },
  { title: 'Sanctuary Stays & Care', body: 'From curbside airport reception with cool towels to seamless check-in at independent heritage properties, your private vehicle stays at your service for spontaneous sunset dinners or early morning game drives.' },
]

export function AboutPage() {
  return (
    <>
      <PageMeta title="About us" description={siteConfig.shortDescription} />

      <section className="relative isolate overflow-hidden text-on-brand">
        <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/80 to-brand/35" />
        <Container className="relative z-10 pt-14 pb-20 lg:pt-24 lg:pb-28">
          <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-gold-soft">[About kicker from Figma]</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-tight font-semibold lg:text-[3.75rem]">
            [About headline from Figma]
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{siteConfig.shortDescription}</p>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">THE RADSLANKA DISTINCTION</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">
              Not tour brokers. Custodians of Ceylon.
            </h2>
          </div>
          <div>
            <p className="text-body text-muted">
              We are not a generic tour bus, automated booking engine, or distant international travel broker. We are
              local guardians of Sri Lanka, pairing discerning global voyagers with experienced, SLTDA-certified
              chauffeur-guides who know every quiet mountain hairpin, undiscovered sunrise crest, and roadside king coconut
              stall.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {ethosCards.map((card) => (
                <li key={card.title} className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                  <Icon name={card.icon} className="text-brand" />
                  <h3 className="mt-3 font-bold text-brand">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted">{card.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="h-[28rem] overflow-hidden rounded-2xl">
            <PlaceholderMedia label="Priyantha Radampola, Founder and Lead Chauffeur-Guide overlooking Sri Lanka tea hills" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">OUR ORIGINS</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">Born from a Love of Ceylon’s Winding Roads</h2>
            <blockquote className="mt-6 border-l-2 border-accent pl-4 text-body text-ink italic">
              “In Sri Lanka, hospitality is not an industry metric; it is our ancestral breath. In our care, you are an
              honored houseguest.”
            </blockquote>
            <ul className="mt-8 grid grid-cols-3 gap-3">
              <li className="rounded-xl bg-surface-mist p-4 text-center">
                <p className="text-xl font-bold text-brand">[Stat]</p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.08em] uppercase text-muted">[Journeys]</p>
              </li>
              <li className="rounded-xl bg-surface-mist p-4 text-center">
                <p className="text-xl font-bold text-brand">[Stat]</p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.08em] uppercase text-muted">[Guides]</p>
              </li>
              <li className="rounded-xl bg-surface-mist p-4 text-center">
                <p className="text-xl font-bold text-brand">100%</p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.08em] uppercase text-muted">SRI LANKAN OWNED</p>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            title="Why discerning travelers choose RadsLanka"
            description="[Why-travel section introduction from Figma]"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface-elevated p-8 shadow-card">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-mist text-brand">
                  <Icon name={item.icon} className="text-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-3 text-body text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading align="center" eyebrow="How we travel" title="Our approach" />
          <ol className="mt-10 grid gap-6 lg:grid-cols-3">
            {approach.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-surface p-8 shadow-card">
                <p className="text-[13px] font-bold text-eyebrow">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-bold text-brand">{step.title}</h3>
                <p className="mt-3 text-body text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">RESPONSIBLE CUSTODIANSHIP</p>
          <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">Preserving Sri Lanka’s Delicate Ecosystems</h2>
          <ul className="mt-8 grid gap-6 lg:grid-cols-3">
            {stewardship.map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface-elevated p-8 shadow-card">
                <h3 className="text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-3 text-body text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand py-16 text-on-brand lg:py-20">
        <Container className="text-center">
          <h2 className="font-display text-[2rem] font-semibold lg:text-[2.75rem]">Start Planning Your Journey</h2>
          <p className="mx-auto mt-4 max-w-2xl text-body text-on-brand-soft/90">{siteConfig.footer.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to={paths.inquiry} variant="primary">
              Plan Your Sri Lankan Journey
            </ButtonLink>
            <ButtonLink to={paths.contact} variant="glass">
              WhatsApp Us
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
