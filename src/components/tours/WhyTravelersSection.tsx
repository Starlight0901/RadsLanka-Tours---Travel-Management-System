import { useEffect, useState } from 'react'
import { Reveal } from '@/components/common/Reveal.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { listPublishedWhyTravelerItems, type WhyTravelerRecord } from '@/services/firebase/whyTravelers.ts'
import { cn } from '@/utils/cn.ts'

const floatClasses = ['why-float-a', 'why-float-b', 'why-float-c', 'why-float-d']

function WhyTravelerCard({ item, index }: { item: WhyTravelerRecord; index: number }) {
  return (
    <article className={cn('why-glass relative h-full overflow-hidden rounded-2xl p-6', floatClasses[index % floatClasses.length])}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.14)_22%,transparent_46%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80"
      />
      <div className="relative">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/45 text-brand">
          <Icon name={item.icon.trim() || 'auto_awesome'} className="text-[22px]" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-brand">{item.title}</h3>
        <p className="mt-2 text-body text-muted">{item.description}</p>
      </div>
    </article>
  )
}

function WhyTravelerTrack({ items, hidden }: { items: WhyTravelerRecord[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <li key={`${hidden ? 'loop' : 'item'}-${item.id}`} className="w-[min(78vw,17.5rem)] shrink-0 sm:w-72">
          <div className="lift-card h-full">
            <WhyTravelerCard item={item} index={index} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function WhyTravelerCarousel({ items }: { items: WhyTravelerRecord[] }) {
  return (
    <div className="why-marquee mt-8 w-full max-w-full overflow-hidden py-3">
      <div
        className="why-marquee-track flex w-max"
        style={{ animationDuration: `${Math.max(items.length, 5) * 8}s` }}
      >
        <WhyTravelerTrack items={items} />
        <WhyTravelerTrack items={items} hidden />
      </div>
    </div>
  )
}

export function WhyTravelersSection() {
  const [items, setItems] = useState<WhyTravelerRecord[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    listPublishedWhyTravelerItems()
      .then((next) => {
        if (active) {
          setItems(next.filter((item) => item.title.trim() && item.description.trim()))
        }
      })
      .catch(() => {
        if (active) {
          setItems([])
        }
      })
      .finally(() => {
        if (active) {
          setReady(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return (
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading align="center" eyebrow="The RadsLanka distinction" title="Why Travelers Choose RadsLanka" />
        </Container>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            className="reveal-card"
            align="center"
            eyebrow="The RadsLanka distinction"
            title="Why Travelers Choose RadsLanka"
          />
          {items.length === 0 ? (
            <p className="reveal-card mx-auto mt-8 max-w-md text-center text-sm text-muted">
              More reasons to travel with us are coming soon.
            </p>
          ) : items.length > 4 ? (
            <div className="reveal-card" style={{ animationDelay: '80ms' }}>
              <WhyTravelerCarousel items={items} />
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="reveal-card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="lift-card h-full">
                    <WhyTravelerCard item={item} index={index} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </Container>
    </section>
  )
}
