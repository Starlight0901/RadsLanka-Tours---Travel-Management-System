import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Container } from '@/components/ui/Container.tsx'

type PlaceholderPageProps = {
  title: string
  description: string
  eyebrow?: string
}

export function PlaceholderPage({
  title,
  description,
  eyebrow = 'Phase 1 placeholder',
}: PlaceholderPageProps) {
  return (
    <section className="bg-surface py-section-sm sm:py-section">
      <PageMeta title={title} description={description} />
      <Container>
        <p className="text-label font-semibold uppercase tracking-label text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-body text-muted">{description}</p>
      </Container>
    </section>
  )
}
