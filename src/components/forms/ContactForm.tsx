import { useState, type FormEvent } from 'react'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { FormTextarea } from '@/components/forms/FormTextarea.tsx'
import { fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Button } from '@/components/ui/Button.tsx'
import { cn } from '@/utils/cn.ts'

const interestOptions = ['[Custom itinerary]', '[Heritage]', '[Wildlife]', '[Coast]', '[Tea Country]']

export function ContactForm() {
  const [interests, setInterests] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  function toggle(value: string) {
    setInterests((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput id="contact-name" name="name" label="Full Name *" autoComplete="name" required placeholder="e.g. Lady Clara or David Sterling" />
        <FormInput id="contact-email" name="email" type="email" label="Email Address *" autoComplete="email" required placeholder="name@domain.com" />
        <FormInput id="contact-phone" name="phone" type="tel" label="Phone Number / WhatsApp" autoComplete="tel" placeholder="+44 7911 123456" />
        <FormInput id="contact-timing" name="timing" label="Estimated Travel Timing" placeholder="[Travel window]" />
      </div>

      <fieldset>
        <legend className={fieldLabelClass}>What are you most interested in?</legend>
        <ul className="mt-2 flex flex-wrap gap-2">
          {interestOptions.map((option) => (
            <li key={option}>
              <button
                type="button"
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
        label="Your Vision or Questions *"
        required
        rows={6}
        placeholder="Share your travel dates, group size, preferred destinations (e.g. Ella hills, Yala safari, Bentota beach), dietary requests, or any questions..."
      />

      <label className="flex min-h-11 items-start gap-2 text-sm text-muted">
        <input type="checkbox" name="updates" className="mt-1 h-4 w-4 accent-brand" />
        [Optional updates checkbox from Figma]
      </label>

      {submitted ? (
        <p className="rounded-xl bg-surface-mist px-4 py-3 text-sm text-brand" role="status">
          Preview only. This contact form does not send or store messages yet.
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto">
        SEND EMAIL
      </Button>
      <p className="text-[13px] text-muted">
        You will receive a comprehensively tailored route blueprint and estimated costs within 12 to 24 hours of
        submitting your preferences. For urgent last-minute arrivals, contact our WhatsApp concierge for immediate
        attention.
      </p>
    </form>
  )
}
