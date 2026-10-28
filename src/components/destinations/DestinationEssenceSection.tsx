import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { SectionHeading } from '@/components/ui/SectionHeading.tsx'
import type { DestinationEssenceTheme } from '@/types/destinations.ts'

type DestinationEssenceSectionProps = {
  themes?: DestinationEssenceTheme[]
}

export function DestinationEssenceSection({ themes }: DestinationEssenceSectionProps) {
  const items = (themes ?? []).filter((theme) => theme.title.trim())
  if (items.length === 0) {
    return null
  }

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeading title="The Essence of This Destination" />
        <ul
          className={
            items.length === 1
              ? 'mt-10 grid max-w-md gap-4'
              : items.length === 2
                ? 'mt-10 grid gap-4 sm:grid-cols-2'
                : 'mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
          }
        >
          {items.map((theme) => (
            <li
              key={theme.id || theme.title}
              className="rounded-2xl border border-brand-muted/10 bg-surface p-5 shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]"
            >
              {theme.icon ? (
                <Icon name={theme.icon} className="text-[22px] text-[#C99700]" />
              ) : null}
              <h3 className="mt-3 font-display text-xl leading-tight font-semibold text-brand-muted">{theme.title}</h3>
              {theme.description?.trim() ? (
                <p className="mt-2 text-body break-words text-muted">{theme.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
