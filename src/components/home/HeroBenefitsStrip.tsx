import { useLayoutEffect, useRef, useState, type Ref } from 'react'
import { Reveal } from '@/components/common/Reveal.tsx'
import { HeroBenefitIcon } from '@/components/home/HeroBenefitIcon.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { heroBenefitsSpeedToPxPerSecond } from '@/config/heroBenefits.ts'
import { useAutoScroll } from '@/hooks/useAutoScroll.ts'
import { useMediaQuery } from '@/hooks/useMediaQuery.ts'
import type { PublicHeroBenefit } from '@/services/firebase/heroBenefits.ts'
import { cn } from '@/utils/cn.ts'

type HeroBenefitsStripProps = {
  items: PublicHeroBenefit[]
  mobileAutoScrollSpeed: number
  /** Reserves the strip's space while Firestore content loads. */
  pending?: boolean
}

function DesktopBenefits({ items }: { items: PublicHeroBenefit[] }) {
  return (
    <ul
      className="hidden list-none px-6 py-5 lg:grid"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn('flex min-w-0 flex-col items-center px-3 text-center', index > 0 && 'border-l border-border')}
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-mist text-brand shadow-control">
            <HeroBenefitIcon icon={item.icon} className="size-[18px]" />
          </span>
          <h2 className="mt-2.5 w-full text-[14px] font-bold leading-snug break-words text-balance text-brand">
            {item.title}
          </h2>
          <p className="mt-0.5 w-full text-[12.5px] leading-[1.15rem] break-words text-balance text-muted">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  )
}

function MobileBenefitList({
  items,
  listRef,
  duplicate = false,
}: {
  items: PublicHeroBenefit[]
  listRef?: Ref<HTMLUListElement>
  duplicate?: boolean
}) {
  return (
    <ul ref={listRef} className="flex shrink-0 list-none" aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <li
          key={`${duplicate ? 'loop' : 'item'}-${item.id}`}
          className="flex w-[12.75rem] shrink-0 items-center gap-2.5 border-r border-border px-3 min-[375px]:w-[14rem] md:w-[15rem]"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-mist text-brand shadow-control">
            <HeroBenefitIcon icon={item.icon} className="size-[17px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-bold leading-tight text-brand">{item.title}</h2>
            <p className="mt-0.5 text-[12px] leading-4 text-muted">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function MobileBenefits({ items, pxPerSecond }: { items: PublicHeroBenefit[]; pxPerSecond: number }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const compact = useMediaQuery('(max-width: 1023.98px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const list = listRef.current
    if (!scroller || !list) {
      return
    }

    const measure = () => setOverflowing(list.offsetWidth > scroller.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    observer.observe(list)
    return () => observer.disconnect()
  }, [items])

  const autoScroll = compact && !reducedMotion && overflowing

  useAutoScroll(scrollerRef, listRef, { enabled: autoScroll, pxPerSecond })

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label="Why travel with RadsLanka. Scroll sideways for more."
      tabIndex={overflowing ? 0 : undefined}
      data-overflowing={overflowing || undefined}
      className="hero-benefits-scroller overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-2xl py-3 touch-pan-x touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
    >
      <div className="flex w-max">
        <MobileBenefitList items={items} listRef={listRef} />
        {autoScroll ? <MobileBenefitList items={items} duplicate /> : null}
      </div>
    </div>
  )
}

export function HeroBenefitsStrip({ items, mobileAutoScrollSpeed, pending = false }: HeroBenefitsStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [overlap, setOverlap] = useState<number | null>(null)
  const hasItems = items.length > 0

  useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) {
      return
    }

    const measure = () => setOverlap(Math.round(strip.offsetHeight / 2))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    return () => observer.disconnect()
  }, [hasItems])

  if (!hasItems) {
    return null
  }

  return (
    <Container
      className={cn('relative z-20', overlap == null && '-mt-12 lg:-mt-16', pending && 'invisible')}
    >
      <div style={overlap == null ? undefined : { marginTop: -overlap }} aria-hidden={pending || undefined}>
        <Reveal>
          <div
            ref={stripRef}
            className="rounded-2xl bg-surface-elevated shadow-[0_20px_50px_-12px_rgba(27,67,50,0.18)]"
          >
            <DesktopBenefits items={items} />
            <MobileBenefits items={items} pxPerSecond={heroBenefitsSpeedToPxPerSecond(mobileAutoScrollSpeed)} />
          </div>
        </Reveal>
      </div>
    </Container>
  )
}
