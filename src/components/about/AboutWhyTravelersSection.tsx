import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import type { WhyTravelerRecord } from '@/services/firebase/whyTravelers.ts'
import { cn } from '@/utils/cn.ts'

const floatClasses = ['why-float-a', 'why-float-b', 'why-float-c', 'why-float-d']

type AboutWhyTravelersSectionProps = {
  items: WhyTravelerRecord[]
}

export function AboutWhyTravelersSection({ items }: AboutWhyTravelersSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="overflow-x-clip py-16 lg:py-24">
      <Container>
        <SectionHeading title="Why Our Travellers choose RadsLanka" />
        <ul className="mt-10 grid gap-6 py-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id} className={cn('min-w-0', floatClasses[index % floatClasses.length])}>
              <article className="h-full rounded-2xl bg-surface-elevated p-8 shadow-card">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-mist text-brand">
                  <Icon name={item.icon.trim() || 'auto_awesome'} className="text-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand">{item.title}</h3>
                <p className="mt-3 whitespace-pre-line text-body text-muted">{item.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
