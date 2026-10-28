import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

function displayValue(value: string, placeholder: string) {
  return value.trim() || placeholder
}

export function HeaderUtilityBar() {
  const phone = siteConfig.phone.trim()
  const email = siteConfig.email.trim()
  const phoneLabel = displayValue(phone, siteConfig.placeholders.phone)
  const emailLabel = displayValue(email, siteConfig.placeholders.email)
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)

  return (
    <div className="bg-utility text-[rgba(233,254,241,0.9)]">
      <div className="mx-auto flex h-auto max-w-content items-center justify-between px-5 py-1 lg:h-10 lg:px-12 lg:py-0">
        <p className="hidden items-center gap-2 text-label font-bold tracking-[0.66px] lg:flex">
          <Icon name="explore" className="text-[12.5px] text-accent" />
          <span>{siteConfig.tagline}</span>
        </p>

        <div className="flex w-full items-center justify-start gap-4 lg:w-auto lg:justify-end lg:gap-6">
          <ContactChip
            href={whatsappHref ?? paths.contact}
            icon="call"
            label={phoneLabel}
            ariaLabel={`WhatsApp ${phoneLabel}`}
            external={Boolean(whatsappHref)}
          />
          <ContactChip
            href={email ? `mailto:${email}` : paths.contact}
            icon="mail"
            label={emailLabel}
            ariaLabel={`Email ${emailLabel}`}
          />
        </div>
      </div>
    </div>
  )
}

type ContactChipProps = {
  href: string
  icon: string
  label: string
  ariaLabel: string
  external?: boolean
}

function ContactChip({ href, icon, label, ariaLabel, external }: ContactChipProps) {
  const classes = cn(
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-sm text-label font-bold tracking-[0.66px] transition-colors lg:min-h-8 lg:min-w-0 lg:justify-start',
    'hover:text-accent',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  )
  const content = (
    <>
      <Icon name={icon} className="text-[11px] text-accent" />
      <span className="hidden lg:inline">{label}</span>
    </>
  )

  if (href.startsWith('/')) {
    return (
      <Link to={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={classes}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  )
}
