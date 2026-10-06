import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { paths } from '@/routes/paths.ts'

export function NotFoundPage() {
  return (
    <section className="py-24">
      <PageMeta title="Page not found" description="The page you requested does not exist." />
      <Container className="text-center">
        <p className="text-label font-semibold uppercase tracking-label text-accent">404</p>
        <h1 className="mt-3 font-display text-5xl text-ink">This path is not on the map</h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          The page may have moved, or the URL may be incomplete. Head back to the homepage to continue exploring.
        </p>
        <div className="mt-8">
          <ButtonLink to={paths.home}>Back to home</ButtonLink>
        </div>
      </Container>
    </section>
  )
}
