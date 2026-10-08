import { Reveal } from '@/components/common/Reveal.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { paths } from '@/routes/paths.ts'

const features = ['Custom pacing', 'Stay preferences', 'Private chauffeur', 'Flexible dates']

export function BespokeJourneySection() {
  return (
    <section className="bg-brand py-16 text-on-brand lg:py-20">
      <Container>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[13px] text-gold-soft">
                <Icon name="auto_awesome" className="text-[16px]" />
                Make your own journey
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
                Can&apos;t find the exact route you&apos;re looking for?
              </h2>
              <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">
                Every RadsLanka journey can be custom-tailored to your exact pace, hotel preferences, budget, and travel
                dates. Whether you seek quiet secret bays or high-altitude mountain hiking, our Ceylon travel architects
                curate the perfect private itinerary.
              </p>
              <ul className="mt-6 grid gap-3 text-[15px] sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <ButtonLink to={paths.inquiry} variant="primary" className="lift-button">
                Create your Own Tour Plan
              </ButtonLink>
              <ButtonLink to={paths.contact} variant="glass" className="lift-button">
                Talk to Us
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
