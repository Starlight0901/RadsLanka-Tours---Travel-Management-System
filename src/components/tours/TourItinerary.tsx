import { useState } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'
import type { TourItineraryDay } from '@/types/tours.ts'

type TourItineraryProps = {
  days: TourItineraryDay[]
}

export function TourItinerary({ days }: TourItineraryProps) {
  const [openDays, setOpenDays] = useState<boolean[]>(() => days.map((_, index) => index === 0))
  const allOpen = days.length > 0 && openDays.length === days.length && openDays.every(Boolean)

  function setAll(open: boolean) {
    setOpenDays(days.map(() => open))
  }

  function toggleDay(index: number) {
    setOpenDays((current) => {
      const next = days.map((_, dayIndex) => current[dayIndex] ?? false)
      next[index] = !next[index]
      return next
    })
  }

  return (
    <section>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">Itinerary</p>
          <h2 className="mt-1 font-display text-[2rem] leading-tight font-semibold text-brand">
            Your Day-by-Day Itinerary
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[15px] font-semibold text-brand"
          onClick={() => setAll(!allOpen)}
        >
          <Icon name={allOpen ? 'unfold_less' : 'unfold_more'} className="text-[16px]" />
          {allOpen ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <ol className="relative mt-8 space-y-6 border-l-2 border-surface-container pl-8 lg:pl-12">
        {days.map((day, index) => {
          const open = openDays[index] ?? false

          return (
            <li key={`${day.day}-${index}`} className="relative">
              <span className="absolute top-1 -left-[2.45rem] size-5 rounded-full border-4 border-surface bg-accent lg:-left-[3.45rem]" />
              <div className="rounded-2xl bg-surface-elevated p-5 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)] lg:p-6">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-2 text-left"
                  aria-expanded={open}
                  onClick={() => toggleDay(index)}
                >
                  <span className="rounded-full bg-chip px-2.5 py-1 text-[11px] font-bold tracking-[0.4px] text-chip-text uppercase">
                    Day {day.day}
                  </span>
                  <h3 className="min-w-0 flex-1 text-lg font-bold break-words text-brand">{day.title}</h3>
                  {day.stay ? (
                    <span className="ml-auto rounded-full bg-surface-mist px-3 py-1 text-[11px] font-bold tracking-[0.4px] text-brand">
                      {day.stay}
                    </span>
                  ) : null}
                  <Icon name={open ? 'expand_less' : 'expand_more'} className="ml-auto text-[18px] text-brand lg:ml-0" />
                </button>
                {open ? <p className="mt-3 text-body text-muted">{day.summary}</p> : null}
                {open && day.locations && day.locations.length > 0 ? (
                  <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-[13px] text-muted">
                    <Icon name="place" className="mt-0.5 shrink-0 text-[14px]" />
                    <span className="min-w-0 break-words">{day.locations.join(' · ')}</span>
                  </p>
                ) : null}
                {open && day.meals ? (
                  <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-[13px] text-muted">
                    <Icon name="restaurant" className="mt-0.5 shrink-0 text-[14px]" />
                    <span className="min-w-0 break-words">{day.meals}</span>
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
