import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { paths } from '@/routes/paths.ts'
import { ButtonLink } from '@/components/ui/Button.tsx'
import type { CatalogVehicle } from '@/types/vehicles.ts'
import { siteConfig } from '@/config/site.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

export type VehicleCardProps = {
  vehicle: CatalogVehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
      <div className="relative h-72 overflow-hidden">
        {vehicle.image.src ? (
          <img
            src={vehicle.image.src}
            alt={vehicle.image.alt}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <PlaceholderMedia label={vehicle.image.alt} />
        )}
        {vehicle.badge ? (
          <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-[0.4px] text-brand shadow-sm">
            {vehicle.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-8">
        <h3 className="text-[1.25rem] font-bold text-brand">{vehicle.name}</h3>
        <p className="text-sm text-muted">{vehicle.model}</p>
        <p className="mt-1 text-[13px] font-semibold text-brand">{vehicle.idealFor}</p>
        <p className="mt-4 text-body text-muted">{vehicle.description}</p>
        <dl className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-surface-mist p-4 text-center">
          {vehicle.specs.map((spec) => (
            <div key={spec.label}>
              <Icon name={spec.icon} className="text-brand" />
              <dt className="mt-1 text-[11px] font-bold uppercase tracking-[0.55px] text-muted">{spec.label}</dt>
              <dd className="text-sm font-semibold text-brand">{spec.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-6 space-y-2">
          {vehicle.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-muted">
              <Icon name="check" className="mt-0.5 text-[12px] text-brand" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 px-8 pb-8">
        <ButtonLink to={paths.inquiry} variant="secondary" className="min-h-12 flex-1">
          Request Quote
        </ButtonLink>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-control border border-border text-brand"
            aria-label="WhatsApp Us"
          >
            <Icon name="chat" />
          </a>
        ) : (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-control border border-border text-muted" aria-label="WhatsApp placeholder">
            <Icon name="chat" />
          </span>
        )}
      </div>
    </article>
  )
}
