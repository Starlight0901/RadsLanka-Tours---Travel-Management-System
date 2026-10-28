import { Container } from '@/components/ui/Container.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import type { PublicAboutApproach } from '@/services/firebase/about.ts'
import { cn } from '@/utils/cn.ts'

const floatClasses = ['why-float-a', 'why-float-b', 'why-float-c', 'why-float-d']

type AboutApproachSectionProps = {
  approaches: PublicAboutApproach[]
}

function approachNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

export function AboutApproachSection({ approaches }: AboutApproachSectionProps) {
  if (approaches.length === 0) {
    return null
  }

  return (
    <section className="overflow-x-clip bg-surface-elevated py-16 lg:py-24">
      <Container>
        <SectionHeading align="center" eyebrow="How we travel" title="Our approach" />
        <ol className="mt-10 grid gap-6 py-4 lg:grid-cols-3">
          {approaches.map((step, index) => (
            <li key={step.id} className={cn('relative min-w-0', floatClasses[index % floatClasses.length])}>
              <span aria-hidden="true" className="about-sparkle about-sparkle-a" />
              <span aria-hidden="true" className="about-sparkle about-sparkle-b" />
              <span aria-hidden="true" className="about-sparkle about-sparkle-c" />
              <article className="relative h-full rounded-2xl bg-surface p-8 shadow-card">
                <p className="text-[13px] font-bold text-eyebrow">{approachNumber(index)}</p>
                <h3 className="mt-2 text-lg font-bold text-brand">{step.title}</h3>
                <p className="mt-3 whitespace-pre-line text-body text-muted">{step.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
