import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ContactForm } from '@/components/forms/ContactForm.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

const trustStrip = [
  { title: '24/7 Chauffeur Support', body: 'Always connected on island', icon: 'support_agent' },
  { title: 'Direct Local Pricing', body: 'Zero hidden intermediaries', icon: 'payments' },
  { title: 'SLTDA Certified Team', body: 'Accredited guide license', icon: 'badge' },
  { title: 'Response Within 2 Hrs', body: 'Standard office hours', icon: 'schedule' },
]

const faqs = [
  { question: '[FAQ question from Figma]', answer: '[FAQ answer from Figma]' },
  { question: '[FAQ question from Figma]', answer: '[FAQ answer from Figma]' },
  { question: '[FAQ question from Figma]', answer: '[FAQ answer from Figma]' },
  { question: '[FAQ question from Figma]', answer: '[FAQ answer from Figma]' },
]

export function ContactPage() {
  const phone = siteConfig.phone.trim() || siteConfig.placeholders.phone
  const email = siteConfig.email.trim() || siteConfig.placeholders.email
  const whatsapp = siteConfig.whatsapp.trim() || siteConfig.placeholders.whatsapp
  const address = siteConfig.address.trim() || siteConfig.placeholders.address
  const whatsappHref = toWhatsAppUrl(siteConfig.whatsapp)

  return (
    <>
      <PageMeta
        title="Contact us"
        description="Have a question or need help planning your trip? Connect directly with our Colombo travel directors and field specialists for authentic, unhurried guidance."
      />

      <Container className="py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Contact' }]} />
      </Container>

      <section>
        <Container className="pb-10">
          <h1 className="font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">Let’s Start Your Journey</h1>
          <p className="mt-4 max-w-2xl text-body text-muted">
            Have a question or need help planning your trip? Connect directly with our Colombo travel directors and field
            specialists for authentic, unhurried guidance.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trustStrip.map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface-elevated p-4 shadow-card">
                <Icon name={item.icon} className="text-brand" />
                <p className="mt-2 text-sm font-bold text-brand">{item.title}</p>
                <p className="mt-1 text-[13px] text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-[2rem] font-semibold text-brand">We’d Love to Hear From You</h2>
            <p className="mt-3 text-body text-muted">
              Whether you are sketching initial ideas for a coastal retreat or ready to reserve a private chauffeur-guided
              high-country expedition, our dedicated concierge team in Colombo is at your service.
            </p>
            <ul className="mt-8 space-y-4">
              <li>
                {whatsappHref ? (
                  <a href={whatsappHref} className="block rounded-2xl bg-surface-elevated p-5 shadow-card">
                    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">WhatsApp</p>
                    <p className="mt-1 font-bold text-brand">{whatsapp}</p>
                    <p className="mt-1 text-sm text-muted">Instant chat with our local trip planner & bespoke specialist</p>
                  </a>
                ) : (
                  <div className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">WhatsApp</p>
                    <p className="mt-1 font-bold text-brand">{whatsapp}</p>
                    <p className="mt-1 text-sm text-muted">Instant chat with our local trip planner & bespoke specialist</p>
                  </div>
                )}
              </li>
              <li className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">Telephone & Direct Line</p>
                <p className="mt-1 font-bold text-brand">{phone}</p>
              </li>
              <li className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">EMAIL INQUIRIES</p>
                <p className="mt-1 font-bold text-brand">{email}</p>
                <p className="mt-1 text-sm text-muted">Guaranteed personalized response within 24 hours</p>
              </li>
              <li className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-eyebrow">COLOMBO CONCIERGE PAVILION</p>
                <p className="mt-1 font-bold text-brand">{address}</p>
                <p className="mt-1 text-sm text-muted">[Office hours from Figma]</p>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-surface-elevated p-6 shadow-card lg:p-10">
            <h3 className="text-xl font-bold text-brand">Send Us a Message</h3>
            <p className="mt-2 text-body text-muted">
              Tell us about your envisioned journey, timeframe, or specific inquiries. A senior travel architect will
              review and respond promptly.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-24">
        <Container>
          <h2 className="font-display text-[2rem] font-semibold text-brand">Frequently asked inquiries</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, index) => (
              <details key={`${faq.question}-${index}`} className="rounded-2xl bg-surface p-5 shadow-card">
                <summary className="cursor-pointer list-none font-bold text-brand">{faq.question}</summary>
                <p className="mt-3 text-body text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
