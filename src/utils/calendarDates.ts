const DAY_MS = 86_400_000

export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function formatCalendarDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addCalendarDays(value: string, days: number): string | null {
  const date = parseCalendarDate(value)
  if (!date || !Number.isInteger(days)) {
    return null
  }

  date.setDate(date.getDate() + days)
  return formatCalendarDate(date)
}

/** Inclusive calendar-day count. 10 Dec–14 Dec is 5. */
export function inclusiveDurationDays(start: string, end: string): number | null {
  const startDate = parseCalendarDate(start)
  const endDate = parseCalendarDate(end)
  if (!startDate || !endDate) {
    return null
  }

  const diff = Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS)
  if (diff < 0) {
    return null
  }

  return diff + 1
}

export function formatDurationLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`
}

export function formatDisplayDate(value: string): string {
  const date = parseCalendarDate(value)
  if (!date) {
    return value
  }

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
