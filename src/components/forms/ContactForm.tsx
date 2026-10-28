import { useRef, useState, type FormEvent } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { FormTextarea } from '@/components/forms/FormTextarea.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Button } from '@/components/ui/Button.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { createGeneralInquiry } from '@/services/firebase/inquiries.ts'
import {
  addCalendarDays,
  formatDisplayDate,
  formatDurationLabel,
  inclusiveDurationDays,
} from '@/utils/calendarDates.ts'
import { cn } from '@/utils/cn.ts'

const interestOptions = ['[Custom itinerary]', '[Heritage]', '[Wildlife]', '[Coast]', '[Tea Country]']

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_DURATION_DAYS = 400

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  dates?: string
  duration?: string
}

function parseDuration(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null
  }

  const days = Number(trimmed)
  if (!Number.isInteger(days) || days < 1 || days > MAX_DURATION_DAYS) {
    return null
  }

  return days
}

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const durationDays = parseDuration(duration)

  function toggle(value: string) {
    setInterests((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }

  function clearDateErrors() {
    setErrors((current) => ({ ...current, dates: undefined, duration: undefined }))
  }

  function onStartDateChange(value: string) {
    setStartDate(value)
    clearDateErrors()
    if (!value) {
      return
    }

    if (endDate) {
      const days = inclusiveDurationDays(value, endDate)
      if (days) {
        setDuration(String(days))
        return
      }
    }

    if (durationDays) {
      const nextEnd = addCalendarDays(value, durationDays - 1)
      if (nextEnd) {
        setEndDate(nextEnd)
      }
    }
  }

  function onEndDateChange(value: string) {
    setEndDate(value)
    clearDateErrors()
    if (!value) {
      return
    }

    if (startDate) {
      const days = inclusiveDurationDays(startDate, value)
      if (days) {
        setDuration(String(days))
        return
      }
    }

    if (durationDays) {
      const nextStart = addCalendarDays(value, -(durationDays - 1))
      if (nextStart) {
        setStartDate(nextStart)
      }
    }
  }

  function onDurationChange(value: string) {
    const digits = value.replace(/\D/g, '')
    setDuration(digits)
    setErrors((current) => ({ ...current, duration: undefined, dates: undefined }))

    if (!digits) {
      return
    }

    const days = parseDuration(digits)
    if (!days) {
      setErrors((current) => ({
        ...current,
        duration: `Enter a whole number between 1 and ${MAX_DURATION_DAYS} days.`,
      }))
      return
    }

    if (startDate) {
      const nextEnd = addCalendarDays(startDate, days - 1)
      if (nextEnd) {
        setEndDate(nextEnd)
      }
      return
    }

    if (endDate) {
      const nextStart = addCalendarDays(endDate, -(days - 1))
      if (nextStart) {
        setStartDate(nextStart)
      }
    }
  }

  function clearDates() {
    setStartDate('')
    setEndDate('')
    setErrors((current) => ({ ...current, dates: undefined }))
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!name.trim()) {
      next.name = 'Enter your name.'
    }
    if (!email.trim()) {
      next.email = 'Enter your email address.'
    } else if (!emailPattern.test(email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (!phone.trim()) {
      next.phone = 'Enter your phone or WhatsApp number.'
    } else if (phone.trim().length < 7) {
      next.phone = 'Enter a valid phone number.'
    }
    if (startDate && endDate && !inclusiveDurationDays(startDate, endDate)) {
      next.dates = 'End date must be on or after the start date.'
    }
    if (duration.trim() && !durationDays) {
      next.duration = `Enter a whole number between 1 and ${MAX_DURATION_DAYS} days.`
    }
    return next
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    setSuccess(false)
    setSubmitError(null)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      await createGeneralInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(startDate ? { travelDate: startDate } : {}),
        ...(endDate ? { returnDate: endDate } : {}),
        ...(durationDays ? { estimatedTravelDays: durationDays } : {}),
        ...(interests.length > 0 ? { interests } : {}),
        message: message.trim(),
      })
      setName('')
      setEmail('')
      setPhone('')
      setStartDate('')
      setEndDate('')
      setDuration('')
      setInterests([])
      setMessage('')
      setSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send your message.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const rangeDays = startDate && endDate ? inclusiveDurationDays(startDate, endDate) : null
  const rangeLabel = rangeDays
    ? `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)} · ${formatDurationLabel(rangeDays)}`
    : null

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          id="contact-name"
          name="name"
          label="Full Name *"
          autoComplete="name"
          required
          maxLength={200}
          placeholder="e.g. Lady Clara or David Sterling"
          value={name}
          error={errors.name}
          disabled={submitting}
          onChange={(event) => setName(event.target.value)}
        />
        <FormInput
          id="contact-email"
          name="email"
          type="email"
          label="Email Address *"
          autoComplete="email"
          required
          maxLength={320}
          placeholder="name@domain.com"
          value={email}
          error={errors.email}
          disabled={submitting}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormInput
          id="contact-phone"
          name="phone"
          type="tel"
          label="Phone Number / WhatsApp *"
          autoComplete="tel"
          required
          maxLength={40}
          placeholder="+44 7911 123456"
          value={phone}
          error={errors.phone}
          disabled={submitting}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      <div>
        <p className={fieldLabelClass}>Estimated Travel Dates</p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="contact-start-date" className="mb-1.5 block text-sm text-muted">
              Start date
            </label>
            <input
              id="contact-start-date"
              name="travelDate"
              type="date"
              value={startDate}
              disabled={submitting}
              className={fieldControlClass}
              onChange={(event) => onStartDateChange(event.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="contact-end-date" className="mb-1.5 block text-sm text-muted">
              End date
            </label>
            <input
              id="contact-end-date"
              name="returnDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              disabled={submitting}
              className={fieldControlClass}
              onChange={(event) => onEndDateChange(event.target.value)}
            />
          </div>
        </div>
        {rangeLabel ? (
          <p className="mt-2 rounded-lg bg-surface-mist px-3 py-2 text-sm text-brand">{rangeLabel}</p>
        ) : null}
        {startDate || endDate ? (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            disabled={submitting}
            onClick={clearDates}
          >
            Clear dates
          </button>
        ) : null}
        <FormError message={errors.dates} />
      </div>

      <div>
        <label htmlFor="contact-duration" className={fieldLabelClass}>
          Estimated Travel Timing
        </label>
        <div className="flex min-w-0 items-center gap-2">
          <input
            id="contact-duration"
            name="duration"
            type="number"
            min={1}
            max={MAX_DURATION_DAYS}
            step={1}
            inputMode="numeric"
            placeholder="Days"
            value={duration}
            disabled={submitting}
            className={cn(fieldControlClass, 'max-w-40')}
            onKeyDown={(event) => {
              if (['e', 'E', '+', '-', '.'].includes(event.key)) {
                event.preventDefault()
              }
            }}
            onChange={(event) => onDurationChange(event.target.value)}
          />
          <span className="shrink-0 text-sm text-muted">
            {durationDays ? formatDurationLabel(durationDays) : 'days'}
          </span>
        </div>
        <FormError message={errors.duration} />
      </div>

      <fieldset>
        <legend className={fieldLabelClass}>What are you most interested in?</legend>
        <ul className="mt-2 flex flex-wrap gap-2">
          {interestOptions.map((option) => (
            <li key={option}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => toggle(option)}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-sm font-semibold',
                  interests.includes(option)
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-border bg-surface-elevated text-ink',
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <FormTextarea
        id="contact-message"
        name="message"
        label="Your Vision or Questions"
        rows={6}
        maxLength={4000}
        placeholder="Share your travel dates, group size, preferred destinations (e.g. Ella hills, Yala safari, Bentota beach), dietary requests, or any questions..."
        value={message}
        disabled={submitting}
        onChange={(event) => setMessage(event.target.value)}
      />

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl bg-surface-mist px-4 py-3 text-sm text-brand" role="status">
          Thank you. Your inquiry has been received and we will contact you soon.
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={submitting || !isFirebaseConfigured}>
        {submitting ? 'Sending…' : 'SEND EMAIL'}
      </Button>
      {!isFirebaseConfigured ? (
        <p className="text-[13px] text-muted">Firebase is not configured, so this form cannot store messages yet.</p>
      ) : null}
      <p className="text-[13px] text-muted">
        You will receive a comprehensively tailored route blueprint and estimated costs within 12 to 24 hours of
        submitting your preferences. For urgent last-minute arrivals, contact our WhatsApp concierge for immediate
        attention.
      </p>
    </form>
  )
}
