import { useState, type FormEvent } from 'react'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { FormTextarea } from '@/components/forms/FormTextarea.tsx'
import { MultiSelect } from '@/components/forms/MultiSelect.tsx'
import { Select } from '@/components/forms/Select.tsx'
import { fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Button } from '@/components/ui/Button.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { listPublishedDestinations } from '@/data/destinationCatalog.ts'
import { homeInquiry } from '@/data/home.ts'
import { listPublishedVehicles } from '@/data/vehicleCatalog.ts'
import { cn } from '@/utils/cn.ts'

export function InquiryForm() {
  const destinations = listPublishedDestinations()
  const vehicleOptions = [
    ...listPublishedVehicles().map((vehicle) => ({ id: vehicle.id, label: vehicle.name })),
    { id: 'suv-van', label: 'SUV / Van' },
  ]
  const [regionIds, setRegionIds] = useState<string[]>([])
  const [vehicleId, setVehicleId] = useState('')
  const [submitted, setSubmitted] = useState<'whatsapp' | 'email' | null>(null)

  function handleSubmit(channel: 'whatsapp' | 'email') {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitted(channel)
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit('email')} noValidate>
      <div className="grid gap-4 md:grid-cols-3">
        <FormInput id="inquiry-name" name="name" label="Your Full Name *" autoComplete="name" required placeholder="e.g. Dr. Eleanor Vance" />
        <FormInput id="inquiry-email" name="email" type="email" label="Email Address *" autoComplete="email" required placeholder="eleanor@example.com" />
        <FormInput id="inquiry-phone" name="phone" type="tel" label="Phone / WhatsApp *" autoComplete="tel" required placeholder="+44 7911 123456" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormInput id="inquiry-dates" name="dates" type="date" label="Approximate Dates *" required />
        <Select
          id="inquiry-guests"
          name="guests"
          label="Number of Guests *"
          required
          placeholder="[Select guests]"
          defaultValue=""
          options={[...homeInquiry.guestOptions]}
        />
        <MultiSelect
          label="Preferred Regions *"
          options={destinations.map((item) => ({ id: item.id, label: item.name }))}
          selectedIds={regionIds}
          onChange={setRegionIds}
          placeholder="[Select regions]"
        />
      </div>

      <FormTextarea
        id="inquiry-notes"
        name="notes"
        label="Travel style, stays & requests"
        rows={5}
        placeholder="Tell us about your travel style, preferred accommodation (colonial tea bungalows, private pool villas, eco-luxury tented camps), preferred pace (slow leisure vs active trek), dietary requests, or anniversary/milestone celebrations..."
      />

      <fieldset>
        <legend className={fieldLabelClass}>Preferred private chauffeur vehicle</legend>
        <ul className="mt-2 flex flex-wrap gap-2">
          {vehicleOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => setVehicleId(option.id)}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-sm font-semibold',
                  vehicleId === option.id
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-border bg-surface-elevated text-ink',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {submitted ? (
        <p className="rounded-xl bg-surface-mist px-4 py-3 text-sm text-brand" role="status">
          Preview only. This inquiry is not sent or stored yet
          {submitted === 'whatsapp' ? ' (WhatsApp action).' : ' (email action).'}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="secondary" className="w-full" onClick={() => setSubmitted('whatsapp')}>
          Submit & Send Via Whatsapp
          <Icon name="chat" className="text-[16px]" />
        </Button>
        <Button type="submit" className="w-full">
          Submit & Send Via Email
          <Icon name="mail" className="text-[16px]" />
        </Button>
      </div>
      <p className="text-center text-[13px] text-muted">100% confidential. No spam.</p>
    </form>
  )
}
