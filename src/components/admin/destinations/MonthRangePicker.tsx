import { useState } from 'react'
import { MONTHS, formatMonthRange, monthLabel, monthsInRange, type MonthRange } from '@/config/destinationContent.ts'
import { cn } from '@/utils/cn.ts'

type MonthRangePickerProps = {
  labelId: string
  value: MonthRange | null
  onChange: (value: MonthRange | null) => void
}

/** First click picks the start month, second click picks the end month. Ranges may wrap past December. */
export function MonthRangePicker({ labelId, value, onChange }: MonthRangePickerProps) {
  const [anchor, setAnchor] = useState<number | null>(null)
  const selected = value ? monthsInRange(value) : []

  function selectMonth(month: number) {
    if (anchor === null) {
      onChange({ startMonth: month, endMonth: month })
      setAnchor(month)
      return
    }
    onChange({ startMonth: anchor, endMonth: month })
    setAnchor(null)
  }

  function clear() {
    onChange(null)
    setAnchor(null)
  }

  return (
    <div>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {MONTHS.map((month) => {
          const inRange = selected.includes(month.value)
          const isEdge = value?.startMonth === month.value || value?.endMonth === month.value
          return (
            <button
              key={month.value}
              type="button"
              aria-pressed={inRange}
              aria-label={month.label}
              className={cn(
                'rounded-lg border px-2 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
                inRange
                  ? isEdge
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-slate-200 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400',
                anchor === month.value && 'ring-2 ring-amber-400 ring-offset-1',
              )}
              onClick={() => selectMonth(month.value)}
            >
              {month.short}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm" aria-live="polite">
        <p className="text-slate-600">
          {anchor !== null ? (
            <>
              Choose the last month, or select {monthLabel(anchor)} again for a single month.
            </>
          ) : value ? (
            <>
              Selected: <span className="font-semibold text-slate-900">{formatMonthRange(value)}</span>{' '}
              <span className="text-slate-500">
                ({selected.length} {selected.length === 1 ? 'month' : 'months'})
              </span>
            </>
          ) : (
            'No season selected. Choose the first month, then the last month.'
          )}
        </p>
        {value ? (
          <button type="button" className="text-sm font-medium text-slate-900 underline" onClick={clear}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}
