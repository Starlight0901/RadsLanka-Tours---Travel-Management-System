import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'

type TourInclusionsProps = {
  included: string[]
  excluded: string[]
}

export function TourInclusions({ included, excluded }: TourInclusionsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  if (included.length === 0 && excluded.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      className="relative mt-16 overflow-hidden rounded-2xl border border-white/10 bg-brand-deep/85 text-on-brand shadow-[0_18px_40px_-28px_rgba(1,34,26,0.75),0_0_28px_-18px_rgba(165,208,184,0.35)] backdrop-blur-md"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,223,158,0.08)_0%,transparent_36%,rgba(1,45,29,0.2)_100%)]"
      />
      <div aria-hidden="true" className="inclusion-sheen pointer-events-none absolute inset-y-0 w-1/3" />
      <div className="relative px-5 py-7 sm:px-8 sm:py-8">
        <header className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-gold-soft sm:text-[1.75rem]">
            What’s Included & Excluded
          </h2>
          <p className="mt-2 text-sm text-on-brand-soft/80">Know what’s covered before you travel</p>
        </header>

        <div className="mt-7 grid gap-7 lg:mt-8 lg:grid-cols-2 lg:gap-12">
          <InclusionColumn title="Included" items={included} tone="included" visible={visible} />
          <InclusionColumn title="Not included" items={excluded} tone="excluded" visible={visible} />
        </div>
      </div>
    </section>
  )
}

function InclusionColumn({
  title,
  items,
  tone,
  visible,
}: {
  title: string
  items: string[]
  tone: 'included' | 'excluded'
  visible: boolean
}) {
  const included = tone === 'included'

  return (
    <div>
      <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-on-brand uppercase">
        <Icon
          name={included ? 'check' : 'close'}
          className={included ? 'text-[16px] text-gold-soft' : 'text-[16px] text-on-brand-dim'}
        />
        {title}
      </h3>
      <div className="mt-2 h-px bg-white/15" />
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-on-brand-dim">None listed.</p>
      ) : (
        <ul className="mt-2">
          {items.map((item, index) => (
            <li
              key={`${tone}-${index}`}
              className={
                visible
                  ? 'inclusion-rise flex items-start gap-2.5 rounded-md px-1 py-1.5 text-sm text-on-brand-soft transition duration-300 hover:translate-x-0.5 hover:bg-white/5 hover:text-on-brand'
                  : 'flex items-start gap-2.5 rounded-md px-1 py-1.5 text-sm text-on-brand-soft opacity-0'
              }
              style={visible ? { animationDelay: `${Math.min(index, 10) * 60}ms` } : undefined}
            >
              <Icon
                name={included ? 'check' : 'close'}
                className={included ? 'mt-0.5 text-[15px] text-gold-soft' : 'mt-0.5 text-[15px] text-on-brand-dim'}
              />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
