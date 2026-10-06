import inquiryBackground from '@/assets/home_inquiry_form_background.jpg'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { DestinationCard } from '@/components/destinations/DestinationCard.tsx'
import { InquiryForm } from '@/components/forms/InquiryForm.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { RatingStars } from '@/components/ui/RatingStars.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { listPublishedDestinations } from '@/data/destinationCatalog.ts'

const steps = [
  {
    title: 'Share Your Vision',
    body: 'Specify your flight window, pace, favorite scenery, and stay inclinations. Whether seeking misty tea estates or coastal surf retreats, our designers listen closely.',
  },
  {
    title: 'Tailored Blueprint',
    body: 'Receive an hour-by-hour route schedule, hand-selected boutique stays, and clear inclusive pricing with a certified chauffeur-guide in under 24 hours.',
  },
  {
    title: 'Unwind in Luxury',
    body: 'Arrive at Colombo BIA to cold towels and fresh coconuts. Your designated English-speaking driver guide handles every mountain pass, toll, and park gate entry.',
  },
]

const landscapes = [
  { id: 'sigiriya', title: 'Sigiriya & Dambulla', body: 'Fifth-century sky citadel, cave fresco sanctuaries, and wild elephant corridors.' },
  { id: 'nuwara-eliya', title: 'Ella & Nuwara Eliya', body: "Cool mountain breezes, Nine Arches stone bridge, and historic Ceylon planters' bungalows." },
  { id: 'yala-minneriya', title: 'Yala & Udawalawe', body: "World's highest density of leopards, sloth bears, and herds of magnificent wild elephants." },
  { id: 'galle-coast', title: 'Galle Fort & Mirissa', body: '17th-century cobblestone ramparts, blue whale migrations, and golden surf beaches.' },
]

export function InquiryPage() {
  const destinations = listPublishedDestinations()

  return (
    <>
      <PageMeta
        title="Plan Your Dream Sri Lankan Holiday"
        description="Whether you seek mist-swathed tea plantations, wild leopard safaris, sacred stone citadels, or untouched southern surf sanctuaries, our local trip designers will handcraft an unhurried, private chauffeured expedition tailored entirely around your travel cadence."
      />

      <section className="relative isolate overflow-hidden">
        <img src={inquiryBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-brand/55" />
        <Container className="relative py-12 lg:py-16">
          <p className="text-center text-[13px] font-bold tracking-[0.12em] text-gold-soft uppercase">
            [Bespoke private travel]
          </p>
          <h1 className="mt-3 text-center font-display text-[2.25rem] font-semibold text-on-brand lg:text-[3.25rem]">
            Plan Your Dream Sri Lankan Holiday
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-body text-on-brand-soft/90">
            Whether you seek mist-swathed tea plantations, wild leopard safaris, sacred stone citadels, or untouched
            southern surf sanctuaries, our local trip designers will handcraft an unhurried, private chauffeured
            expedition tailored entirely around your travel cadence.
          </p>

          <div className="mt-10 rounded-2xl bg-surface-elevated p-6 shadow-[0_24px_60px_-12px_rgba(1,45,29,0.35)] lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
              <div>
                <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">[Inquiry kicker]</p>
                <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand">
                  Craft Your Ideal Journey Across Serendib
                </h2>
                <p className="mt-4 text-body text-muted">
                  Whether you seek mist-swathed tea plantations, wild leopard safaris, sacred stone citadels, or untouched
                  southern surf sanctuaries, our local trip designers will handcraft an unhurried, private chauffeured
                  expedition tailored entirely around your travel cadence.
                </p>
                <div className="mt-6 rounded-2xl bg-surface-mist p-5">
                  <RatingStars rating={5} />
                  <p className="mt-3 text-sm text-ink italic">
                    “RadsLanka calibrated our 12-day route to absolute perfection. Our private chauffeur, the heritage
                    bungalows, and the quiet tea trail mornings were extraordinary.”
                  </p>
                  <p className="mt-3 text-[13px] text-muted">— Julian & Clara Montgomery, London • Traveled Jan 2025</p>
                </div>
              </div>
              <InquiryForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading align="center" title="The bespoke RadsLanka architecture" />
          <ol className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-surface-elevated p-8 shadow-card">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-mist font-bold text-brand">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand">{step.title}</h3>
                <p className="mt-3 text-body text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            title="Iconic Landscapes Included in Tailor-Made Routes"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {landscapes.map((item) => {
              const destination = destinations.find((entry) => entry.id === item.id)
              return (
                <li key={item.id}>
                  {destination ? (
                    <DestinationCard destination={{ ...destination, shortDescription: item.body, name: item.title }} variant="overlay" />
                  ) : (
                    <article className="rounded-2xl bg-surface p-6">
                      <h3 className="font-bold text-brand">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted">{item.body}</p>
                    </article>
                  )}
                </li>
              )
            })}
          </ul>
        </Container>
      </section>
    </>
  )
}
