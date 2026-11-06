import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ReviewForm } from '@/components/forms/ReviewForm.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { paths } from '@/routes/paths.ts'

const pageDescription =
  'Every journey leaves a story. Share yours and help fellow travellers discover the beauty of Sri Lanka with RadsLanka.'

export function ShareYourExperiencePage() {
  return (
    <>
      <PageMeta title="Share Your Experience" description={pageDescription} />

      <Container className="py-4">
        <Breadcrumbs
          items={[
            { label: 'Home', to: paths.home },
            { label: 'Reviews', to: paths.reviews },
            { label: 'Share Your Experience' },
          ]}
        />
      </Container>

      <section className="bg-brand text-on-brand">
        <Container className="py-12 lg:py-16">
          <p className="text-[13px] font-bold tracking-[0.12em] text-gold-soft uppercase">Guest stories</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.5rem] font-semibold lg:text-[3.5rem]">
            Share Your Experience
          </h1>
          <p className="mt-4 max-w-2xl text-body text-on-brand-soft/90">{pageDescription}</p>
        </Container>
      </section>

      <section className="bg-cream-50 py-12 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div>
            <p className="text-[13px] font-bold tracking-[0.08em] text-eyebrow uppercase">Your review</p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold text-brand-muted">Help fellow travellers</h2>
            <p className="mt-3 max-w-md text-body text-muted">
              Choose the tour you traveled, add any destinations that stood out, and tell us what made the journey
              memorable. Your review appears on our Reviews page as soon as it is submitted.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-card lg:p-10">
            <ReviewForm />
          </div>
        </Container>
      </section>
    </>
  )
}
