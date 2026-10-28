import { DestinationHighlightIcon } from '@/components/destinations/DestinationHighlightIcon.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import type { DestinationGlance, DestinationKeyHighlight } from '@/types/destinations.ts'

type GlanceRow = {
  label: string
  icon: string
  value?: string
  tags?: string[]
}

function glanceRows(glance: DestinationGlance | undefined): GlanceRow[] {
  return [
    { label: 'Best time to visit', icon: 'calendar_month', value: glance?.bestTime?.trim() },
    { label: 'Location in Sri Lanka', icon: 'location_on', value: glance?.location?.trim() },
    { label: 'Recommended stay', icon: 'schedule', value: glance?.recommendedStay?.trim() },
    { label: 'Destination type', icon: 'landscape', tags: glance?.characteristics?.filter((item) => item.trim()) },
    { label: 'Ideal for', icon: 'group', tags: glance?.idealFor?.filter((item) => item.trim()) },
  ].filter((row) => Boolean(row.value) || Boolean(row.tags && row.tags.length > 0))
}

function SidebarHeading({ id, children }: { id: string; children: string }) {
  return (
    <h3 id={id} className="font-display text-xl leading-tight font-semibold text-brand-muted">
      {children}
    </h3>
  )
}

export function DestinationAtAGlance({ glance }: { glance?: DestinationGlance }) {
  const rows = glanceRows(glance)
  if (rows.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="destination-glance-heading">
      <SidebarHeading id="destination-glance-heading">Destination at a Glance</SidebarHeading>
      <dl className="mt-4 divide-y divide-brand-muted/10">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <Icon name={row.icon} className="mt-0.5 shrink-0 text-[18px] text-[#C99700]" />
            <div className="min-w-0">
              <dt className="text-[11px] font-bold tracking-[0.08em] text-[#2C3E35]/75 uppercase">{row.label}</dt>
              <dd className="mt-1">
                {row.tags && row.tags.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {row.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-chip px-2.5 py-0.5 text-[12px] font-semibold text-chip-text">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[15px] font-semibold break-words text-[#2C3E35]">{row.value}</span>
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function DestinationHighlights({ highlights }: { highlights?: DestinationKeyHighlight[] }) {
  const items = (highlights ?? []).filter((item) => item.title.trim())
  if (items.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="destination-highlights-heading">
      <SidebarHeading id="destination-highlights-heading">Highlights of This Destination</SidebarHeading>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex gap-3">
            {item.icon ? (
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-mist text-brand-muted">
                <DestinationHighlightIcon icon={item.icon} className="size-[18px]" />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-[15px] font-bold break-words text-brand-muted">{item.title}</p>
              {item.detail.trim() ? (
                <p className="mt-0.5 text-[13px] leading-5 break-words text-[#2C3E35]">{item.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

type DestinationOverviewSidebarProps = {
  glance?: DestinationGlance
  highlights?: DestinationKeyHighlight[]
}

export function DestinationOverviewSidebar({ glance, highlights }: DestinationOverviewSidebarProps) {
  const glanceBlock = <DestinationAtAGlance glance={glance} />
  const highlightBlock = <DestinationHighlights highlights={highlights} />
  const hasGlance = glanceRows(glance).length > 0
  const hasHighlights = (highlights ?? []).some((item) => item.title.trim())

  if (!hasGlance && !hasHighlights) {
    return null
  }

  return (
    <aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-brand-muted/10 bg-cream-50/70 p-5 sm:p-6">
      <div className="space-y-6">
        {glanceBlock}
        {hasGlance && hasHighlights ? <div className="border-t border-brand-muted/10 pt-6">{highlightBlock}</div> : highlightBlock}
      </div>
    </aside>
  )
}
