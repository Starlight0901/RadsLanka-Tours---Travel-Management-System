import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ContactFaqsSection } from '@/components/contact/ContactFaqsSection.tsx'
import { ContactForm } from '@/components/forms/ContactForm.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

const heroDescription =
  'Whether you are sketching initial ideas for a coastal retreat or ready to reserve a private chauffeur-guided high-country expedition, our dedicated concierge team in Colombo is at your service.'

const channelClassName =
  'block rounded-2xl bg-surface-elevated p-5 shadow-card transition hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

function toTelHref(rawNumber: string): string | null {
  const trimmed = rawNumber.trim()
  if (!trimmed || trimmed.startsWith('[')) {
    return null
  }
  const value = trimmed.replace(/[^\d+]/g, '')
  return value ? `tel:${value}` : null
}

function toMailtoHref(rawEmail: string): string | null {
  const email = rawEmail.trim()
  if (!email || !email.includes('@') || email.startsWith('[')) {
    return null
  }
  return `mailto:${email}`
}

function ContactChannel({
  href,
  eyebrow,
  value,
  hint,
  external = false,
}: {
  href: string | null
  eyebrow: string
  value: string
  hint?: string
  external?: boolean
}) {
  const content = (
    <>
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">{eyebrow}</p>
      <p className="mt-1 break-words font-bold text-brand">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={channelClassName}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }

  return <div className={channelClassName}>{content}</div>
}

export function ContactPage() {
  const phone = siteConfig.phone.trim() || siteConfig.placeholders.phone
  const email = siteConfig.email.trim() || siteConfig.placeholders.email
  const whatsapp = siteConfig.whatsapp.trim() || siteConfig.placeholders.whatsapp
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)
  const telHref = toTelHref(siteConfig.phone)
  const mailtoHref = toMailtoHref(siteConfig.email)

  return (
    <>
      <PageMeta title="Contact us" description={heroDescription} />

      <Container className="py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Contact' }]} />
      </Container>

      <section>
        <Container className="pb-10">
          <h1 className="font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">
            We’d Love to Hear From You
          </h1>
          <p className="mt-4 max-w-2xl text-body text-muted">{heroDescription}</p>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
            <h2 className="font-display text-[2rem] font-semibold text-brand">Contact us directly via</h2>
            <ul className="mt-8 space-y-4">
              <li>
                <ContactChannel
                  href={whatsappHref}
                  eyebrow="WhatsApp"
                  value={whatsapp}
                  hint="Instant chat with our local trip planner & bespoke specialist"
                  external
                />
              </li>
              <li>
                <ContactChannel href={telHref} eyebrow="Telephone & Direct Line" value={phone} />
              </li>
              <li>
                <ContactChannel
                  href={mailtoHref}
                  eyebrow="EMAIL INQUIRIES"
                  value={email}
                  hint="Guaranteed personalized response within 24 hours"
                />
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-surface-elevated p-6 shadow-card lg:p-10">
            <h3 className="text-xl font-bold text-brand">Send Us a Message</h3>
            <p className="mt-2 text-body text-muted">
              Tell us about your envisioned journey, timeframe, or specific inquiries. We will review and respond promptly.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <ContactFaqsSection />
    </>
  )
}