import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { CatalogReviewCard } from '@/components/reviews/CatalogReviewCard.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.ts'
import type { CatalogReview } from '@/types/tours.ts'
import { cn } from '@/utils/cn.ts'

const AUTOPLAY_MS = 4500
const SWIPE_THRESHOLD = 48
const GAP_PX = 32

type ReviewCarouselProps = {
  reviews: CatalogReview[]
  showTour?: boolean
  showDestinations?: boolean
}

function breakpointVisibleCount(isLg: boolean, isMd: boolean): number {
  if (isLg) {
    return 3
  }
  if (isMd) {
    return 2
  }
  return 1
}

export function ReviewCarousel({ reviews, showTour = true, showDestinations = true }: ReviewCarouselProps) {
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const visibleCount = Math.max(1, Math.min(breakpointVisibleCount(isLg, isMd), reviews.length || 1))
  const looping = reviews.length > 1
  const offset = looping ? visibleCount : 0
  const slides = useMemo(() => {
    if (!looping) {
      return reviews
    }
    return [...reviews.slice(-visibleCount), ...reviews, ...reviews.slice(0, visibleCount)]
  }, [looping, reviews, visibleCount])

  const [index, setIndex] = useState(offset)
  const [animating, setAnimating] = useState(false)
  const [instant, setInstant] = useState(false)
  const [hovering, setHovering] = useState(false)
  const pointer = useRef<{ x: number; y: number; horizontal?: boolean } | null>(null)

  useEffect(() => {
    setInstant(true)
    setAnimating(false)
    setIndex(offset)
  }, [offset, reviews])

  useLayoutEffect(() => {
    if (!instant) {
      return
    }
    const frame = window.requestAnimationFrame(() => setInstant(false))
    return () => window.cancelAnimationFrame(frame)
  }, [instant, index])

  const go = useCallback(
    (delta: number) => {
      if (!looping) {
        return
      }
      setAnimating(true)
      setIndex((current) => current + delta)
    },
    [looping],
  )

  useEffect(() => {
    if (!looping || hovering || reducedMotion) {
      return
    }

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return
      }
      go(1)
    }, AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [go, hovering, looping, reducedMotion, index])

  function settleLoop() {
    if (!looping) {
      return
    }
    if (index >= reviews.length + offset) {
      setInstant(true)
      setAnimating(false)
      setIndex(offset)
      return
    }
    if (index < offset) {
      setInstant(true)
      setAnimating(false)
      setIndex(reviews.length + index)
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!looping || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }
    pointer.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    if (!start) {
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (start.horizontal === undefined && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      start.horizontal = Math.abs(dx) > Math.abs(dy)
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    pointer.current = null
    if (!start?.horizontal) {
      return
    }
    const dx = event.clientX - start.x
    if (dx <= -SWIPE_THRESHOLD) {
      go(1)
    } else if (dx >= SWIPE_THRESHOLD) {
      go(-1)
    }
  }

  if (reviews.length === 0) {
    return null
  }

  const trackStyle: CSSProperties = {
    gap: GAP_PX,
    transform: `translate3d(calc(${index} * ((-100% - ${GAP_PX}px) / ${visibleCount})), 0, 0)`,
    transition: instant || !animating || reducedMotion ? 'none' : 'transform 0.55s ease',
  }

  return (
    <div
      className="max-w-full"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          setHovering(true)
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          setHovering(false)
          pointer.current = null
        }
      }}
    >
      <div
        className="overflow-hidden touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointer.current = null
        }}
      >
        <ul className="flex items-stretch" style={trackStyle} onTransitionEnd={settleLoop}>
          {slides.map((review, slideIndex) => (
            <li
              key={`${review.id}-${slideIndex}`}
              className="flex min-w-0"
              style={{ flex: `0 0 calc((100% - ${(visibleCount - 1) * GAP_PX}px) / ${visibleCount})` }}
              aria-hidden={looping && (slideIndex < offset || slideIndex >= reviews.length + offset) ? true : undefined}
            >
              <CatalogReviewCard
                review={review}
                showTour={showTour}
                showDestinations={showDestinations}
                clampText
              />
            </li>
          ))}
        </ul>
      </div>
      {looping ? (
        <div className="mt-8 flex justify-center gap-3">
          <CarouselButton label="Previous reviews" icon="chevron_left" onClick={() => go(-1)} />
          <CarouselButton label="Next reviews" icon="chevron_right" onClick={() => go(1)} />
        </div>
      ) : null}
    </div>
  )
}

function CarouselButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex size-12 items-center justify-center rounded-full bg-brand text-on-brand shadow-control transition',
        'hover:bg-brand-muted active:bg-brand-deep',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      )}
      onClick={onClick}
    >
      <Icon name={icon} className="text-[22px] text-accent" />
    </button>
  )
}
