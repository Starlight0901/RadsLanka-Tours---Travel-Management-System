import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

function displayValue(value: string, placeholder: string) {
  return value.trim() || placeholder
}

function FooterHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden size-2 rounded-full bg-accent lg:block" />
      <h2 className="text-[11px] font-bold uppercase tracking-[0.55px] text-on-brand-dim lg:text-on-brand-soft">
        {children}
      </h2>
    </div>
  )
}

function FooterSocials({ size = 'desktop' }: { size?: 'desktop' | 'mobile' }) {
  return (
    <ul className="flex items-center gap-3">
      {siteConfig.socialLinks.map((item) => {
        const classes = cn(
          'inline-flex items-center justify-center rounded-full bg-white/10 text-on-brand-soft',
          size === 'mobile' ? 'size-11' : 'size-10',
        )

        const icon = <Icon name={item.icon} className="text-[15px]" />

        if (!item.href) {
          return (
            <li key={item.id}>
              <span className={classes} aria-label={`${item.label} (not configured)`}>
                {icon}
              </span>
            </li>
          )
        }

        return (
          <li key={item.id}>
            <a href={item.href} className={classes} aria-label={item.label} rel="noreferrer">
              {icon}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function TrustBadge() {
  if (!siteConfig.trustBadge.visible || !siteConfig.trustBadge.label) {
    return null
  }

  return (
    <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.55px] text-on-brand-soft">
      <Icon name="verified" className="text-[16px] text-accent" />
      {siteConfig.trustBadge.label}
    </p>
  )
}

function ContactLine({
  icon,
  value,
  placeholder,
  href,
}: {
  icon: string
  value: string
  placeholder: string
  href?: string
}) {
  const label = displayValue(value, placeholder)
  const content = (
    <>
      <Icon name={icon} className="text-[14px] text-accent" />
      <span>{label}</span>
    </>
  )

  const classes = 'flex min-h-11 items-center gap-2.5 text-[13px] text-on-brand-muted lg:min-h-0 lg:text-[15px]'

  if (!value.trim()) {
    return <p className={classes}>{content}</p>
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    )
  }

  return <p className={classes}>{content}</p>
}

export function Footer() {
  const year = siteConfig.copyrightYear ?? new Date().getFullYear()
  const legalName = displayValue(siteConfig.legalName, siteConfig.placeholders.legalName)
  const phone = siteConfig.phone.trim()
  const email = siteConfig.email.trim()
  const whatsapp = siteConfig.whatsapp.trim()
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : undefined

  return (
    <footer className="bg-brand pb-28 text-on-brand-muted lg:pb-12">
      <div className="mx-auto hidden max-w-content px-12 pt-16 lg:block">
        <div className="flex items-center justify-between gap-8 rounded-2xl border border-white/10 bg-brand-muted/70 p-10">
          <div className="max-w-xl">
            <h2 className="font-display text-display text-on-brand-soft">{siteConfig.footer.ctaTitle}</h2>
            <p className="mt-2 text-body">{siteConfig.footer.ctaBody}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link
              to={paths.inquiry}
              className="inline-flex min-h-12 items-center gap-2 rounded-control bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-control"
            >
              {siteConfig.footer.ctaPrimary}
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className="inline-flex min-h-12 items-center gap-2 rounded-control border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-on-brand"
                rel="noreferrer"
              >
                <Icon name="chat" className="text-[15px]" />
                {siteConfig.footer.ctaSecondary}
              </a>
            ) : (
              <Link
                to={paths.contact}
                className="inline-flex min-h-12 items-center gap-2 rounded-control border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-on-brand"
              >
                <Icon name="chat" className="text-[15px]" />
                {siteConfig.footer.ctaSecondary}
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-12 border-y border-white/10 py-12">
          <div>
            <img
              src={siteConfig.logoOnDark.src}
              alt={siteConfig.logoOnDark.alt}
              className="h-36 w-auto object-contain object-left"
            />
            <p className="mt-4 text-body">{siteConfig.footer.blurbDesktop}</p>
            <TrustBadge />
          </div>

          <div>
            <FooterHeading>Quick links</FooterHeading>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-body">
              <li>
                <Link to={paths.home} className="hover:text-on-brand">
                  Home
                </Link>
              </li>
              <li>
                <Link to={paths.about} className="hover:text-on-brand">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={paths.tours} className="hover:text-on-brand">
                  Tours
                </Link>
              </li>
              <li>
                <Link to={paths.gallery} className="hover:text-on-brand">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to={paths.destinations} className="hover:text-on-brand">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to={paths.reviews} className="hover:text-on-brand">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to={paths.vehicles} className="hover:text-on-brand">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to={paths.contact} className="hover:text-on-brand">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <FooterHeading>Contact concierge</FooterHeading>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.275px] text-on-brand-muted/70">Phone</p>
              <ContactLine
                icon="call"
                value={phone}
                placeholder={siteConfig.placeholders.phone}
                href={phone ? `tel:${phone}` : undefined}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.275px] text-on-brand-muted/70">WhatsApp</p>
                <span className="rounded-full bg-[#c1ecd4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-accent-foreground">
                  Live
                </span>
              </div>
              <ContactLine
                icon="chat"
                value={whatsapp}
                placeholder={siteConfig.placeholders.whatsapp}
                href={whatsappHref}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.275px] text-on-brand-muted/70">Email</p>
              <ContactLine
                icon="mail"
                value={email}
                placeholder={siteConfig.placeholders.email}
                href={email ? `mailto:${email}` : undefined}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.275px] text-on-brand-muted/70">Headquarters</p>
              <ContactLine icon="location_on" value={siteConfig.address} placeholder={siteConfig.placeholders.address} />
            </div>
          </div>

          <div>
            <FooterHeading>Connect with us</FooterHeading>
            <p className="mt-3 text-body">{siteConfig.footer.connectBlurb}</p>
            <div className="mt-4">
              <FooterSocials />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-8 text-nav">
          <p>
            © {year} {legalName}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <Link to={paths.privacy} className="hover:text-on-brand">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to={paths.terms} className="hover:text-on-brand">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-10 lg:hidden">
        <img
          src={siteConfig.logoOnDark.src}
          alt={siteConfig.logoOnDark.alt}
          className="h-32 w-auto object-contain object-left"
        />
        <p className="mt-3 text-[13px] leading-[21px]">{siteConfig.footer.blurbMobile}</p>
        <TrustBadge />

        <div className="mt-6">
          <FooterHeading>Navigation</FooterHeading>
          <ul className="mt-2 grid grid-cols-2 gap-x-4">
            {[
              [paths.home, 'Home'],
              [paths.tours, 'Tours'],
              [paths.destinations, 'Destinations'],
              [paths.vehicles, 'Vehicles'],
              [paths.about, 'About Us'],
              [paths.gallery, 'Gallery'],
              [paths.reviews, 'Reviews'],
              [paths.contact, 'Contact Us'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="flex min-h-11 items-center text-sm">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <FooterHeading>Contact concierge</FooterHeading>
          <div className="mt-1">
            <ContactLine
              icon="call"
              value={phone}
              placeholder={siteConfig.placeholders.phone}
              href={phone ? `tel:${phone}` : undefined}
            />
            <ContactLine
              icon="chat"
              value={whatsapp}
              placeholder={siteConfig.placeholders.whatsapp}
              href={whatsappHref}
            />
            <ContactLine
              icon="mail"
              value={email}
              placeholder={siteConfig.placeholders.email}
              href={email ? `mailto:${email}` : undefined}
            />
            <ContactLine icon="location_on" value={siteConfig.address} placeholder={siteConfig.placeholders.address} />
          </div>
        </div>

        <div className="mt-4">
          <FooterHeading>Connect with us</FooterHeading>
          <div className="mt-2.5">
            <FooterSocials size="mobile" />
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-on-brand-dim">
          <p className="text-xs leading-6">
            © {year} {legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to={paths.privacy} className="flex min-h-11 items-center text-xs underline">
              Privacy Policy
            </Link>
            <span className="text-xs">•</span>
            <Link to={paths.terms} className="flex min-h-11 items-center text-xs underline">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
