import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput } from '@/components/forms/FormInput.tsx'
import { Select } from '@/components/forms/Select.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import type { CatalogTour } from '@/types/tours.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

type TourBookingCardProps = {
  tour: CatalogTour
}

function formatTourPrice(priceLabel?: string): string {
  if (!priceLabel) {
    return '[Price]'
  }
  if (/^LKR\b/i.test(priceLabel)) {
    return priceLabel
  }

  return `LKR ${priceLabel}`
}

const travelerOptions = [
  { value: '2', label: '2 travelers' },
  { value: '3', label: '3 travelers' },
  { value: '4', label: '4 travelers' },
  { value: '5+', label: '5+ travelers' },
]

export function TourBookingCard({ tour }: TourBookingCardProps) {
  const navigate = useNavigate()
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const params = new URLSearchParams()
    params.set('tour', tour.slug)
    params.set('date', String(data.get('departureDate') ?? ''))
    params.set('travelers', String(data.get('travelers') ?? ''))
    params.set('contact', String(data.get('contact') ?? ''))
    navigate(`${paths.inquiry}?${params.toString()}`)
  }

  return (
    <aside className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.55px] text-muted uppercase">From</p>
          <p className="mt-1">
            <span className="text-4xl font-bold text-brand">{formatTourPrice(tour.priceLabel)}</span>
            {tour.priceNote ? <span className="mt-1 block text-sm font-medium text-muted">{tour.priceNote}</span> : null}
          </p>
        </div>
        <span className="rounded-xl bg-surface-mist px-3 py-2 text-center text-[11px] font-bold tracking-[0.4px] text-brand uppercase">
          {tour.durationDays}
          <span className="block font-semibold tracking-normal text-muted">days</span>
        </span>
      </div>

      <ul className="mt-5 space-y-2 text-[13px] text-muted">
        <li className="flex items-start gap-2">
          <Icon name="check" className="mt-0.5 text-[16px] text-brand" />
          [Private chauffeur-guide]
        </li>
        <li className="flex items-start gap-2">
          <Icon name="check" className="mt-0.5 text-[16px] text-brand" />
          [Handpicked stays]
        </li>
        <li className="flex items-start gap-2">
          <Icon name="check" className="mt-0.5 text-[16px] text-brand" />
          [Flexible private itinerary]
        </li>
      </ul>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormInput name="departureDate" label="Preferred Departure Date" type="date" required />
        <Select name="travelers" label="Travelers" options={travelerOptions} defaultValue="2" />
        <FormInput
          name="contact"
          label="Your Email / WhatsApp"
          type="text"
          placeholder="e.g. yourname@domain.com"
          required
        />
        <Button type="submit" className="lift-button w-full">
          Request this journey
          <Icon name="arrow_forward" className="text-[12px]" />
        </Button>
        <ButtonLinkFallback href={whatsappHref} />
      </form>

      <Link to={paths.inquiry} className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-brand">
        <Icon name="edit_note" className="text-[16px]" />
        Customize this itinerary
      </Link>
    </aside>
  )
}

function ButtonLinkFallback({ href }: { href: string | null }) {
  if (!href) {
    return (
      <button type="button" disabled className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-border text-sm font-semibold text-muted">
        <Icon name="chat" className="text-[16px]" />
        {siteConfig.placeholders.whatsapp}
      </button>
    )
  }

  return (
    <a
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-border text-sm font-semibold text-brand"
    >
      <Icon name="chat" className="text-[16px]" />
      Talk to Us on WhatsApp
    </a>
  )
}
