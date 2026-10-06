import inquiryBackground from '@/assets/home_inquiry_form_background.png'
import { HomeInquiryForm } from '@/components/home/HomeInquiryForm.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import { homeInquiry } from '@/data/home.ts'

export function HomeInquirySection() {
  const phone = siteConfig.phone.trim() || siteConfig.placeholders.phone

  return (
    <section id="bespoke-planner" className="relative overflow-hidden">
      <img src={inquiryBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand via-brand/70 to-transparent lg:via-brand/55"
        aria-hidden="true"
      />
      <Container className="relative py-16 lg:py-32">
        <div className="rounded-2xl bg-surface-elevated p-8 shadow-[0_24px_60px_-12px_rgba(1,45,29,0.35)] lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-12 lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-eyebrow">{homeInquiry.eyebrow}</p>
              <h2 className="mt-2 font-display text-[2rem] leading-tight font-semibold tracking-[-0.025em] text-brand sm:text-[2.5rem] sm:leading-[3rem]">
                {homeInquiry.title}
              </h2>
              <p className="mt-4 max-w-md text-body text-muted">{homeInquiry.body}</p>
              <ul className="mt-8 space-y-3">
                {homeInquiry.guarantees.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-brand">
                    <Icon name="check_circle" className="text-[17px] text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-4 rounded-xl bg-surface-mist p-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                  <Icon name="call" className="text-[15px]" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-brand">{homeInquiry.contactTitle}</p>
                  <p className="mt-1 text-[13px] leading-5 text-muted">
                    {homeInquiry.contactBody} {phone}
                  </p>
                </div>
              </div>
            </div>
            <HomeInquiryForm />
          </div>
        </div>
      </Container>
    </section>
  )
}
