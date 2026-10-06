import { useState, type FormEvent } from 'react'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { Select } from '@/components/forms/Select.tsx'
import { fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Button } from '@/components/ui/Button.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { homeInquiry } from '@/data/home.ts'

export function HomeInquiryForm() {
  const [interests, setInterests] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  function toggleInterest(name: string) {
    setInterests((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput id="home-arrival" name="arrival" label="Estimated arrival date" type="date" required />
        <Select
          id="home-duration"
          name="duration"
          label="Duration"
          placeholder="[Select duration]"
          defaultValue=""
          options={[...homeInquiry.durations]}
        />
        <Select
          id="home-guests"
          name="guests"
          label="Number of guests"
          placeholder="[Select guests]"
          defaultValue=""
          options={[...homeInquiry.guestOptions]}
        />
        <Select
          id="home-stay"
          name="stay"
          label="Accommodation style"
          placeholder="[Select style]"
          defaultValue=""
          options={[...homeInquiry.stays]}
        />
      </div>

      <fieldset>
        <legend className={fieldLabelClass}>Places of interest (select all that apply)</legend>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
          {homeInquiry.interests.map((place) => (
            <li key={place}>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand"
                  checked={interests.includes(place)}
                  onChange={() => toggleInterest(place)}
                />
                {place}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormInput id="home-name" name="name" label="Your name" autoComplete="name" placeholder="e.g. Sarah Jenkins" />
        <FormInput
          id="home-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="sarah@example.com"
        />
        <FormInput
          id="home-whatsapp"
          name="whatsapp"
          type="tel"
          label="WhatsApp number"
          autoComplete="tel"
          placeholder="+44 7911 123456"
        />
      </div>

      {submitted ? (
        <p className="rounded-xl bg-surface-mist px-4 py-3 text-sm text-brand" role="status">
          Preview only. This homepage form does not send or store inquiries yet.
        </p>
      ) : null}

      <div>
        <Button type="submit" className="w-full gap-3">
          {homeInquiry.submitLabel}
          <Icon name="arrow_forward" className="text-[15px]" />
        </Button>
        <p className="mt-3 text-center text-[13px] text-muted">{homeInquiry.submitNote}</p>
      </div>
    </form>
  )
}
