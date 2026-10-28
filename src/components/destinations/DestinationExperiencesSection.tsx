import { Container } from '@/components/ui/Container.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import type { CatalogDestinationExperience } from '@/types/destinations.ts'
import { cn } from '@/utils/cn.ts'

const floatClasses = [
  'experience-float-a',
  'experience-float-b',
  'experience-float-c',
  'experience-float-d',
] as const

type DestinationExperiencesSectionProps = {
  destinationName: string
  experiences?: CatalogDestinationExperience[]
}

export function DestinationExperiencesSection({ destinationName, experiences }: DestinationExperiencesSectionProps) {
  const items = (experiences ?? []).filter((item) => item.title.trim() && item.imageUrl.trim())
  if (items.length === 0) {
    return null
  }

  return (
    <section className="overflow-x-hidden bg-surface-elevated py-16 lg:py-24">
      <Container>
        <SectionHeading title={`Experiences in ${destinationName}`} />
        <ul className="mt-10 grid grid-cols-1 gap-6 py-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id} className={cn('min-w-0', floatClasses[index % floatClasses.length])}>
              <article className="lift-card flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold break-words text-brand">{item.title}</h3>
                  {item.description.trim() ? (
                    <p className="mt-2 text-body break-words text-muted">{item.description}</p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
