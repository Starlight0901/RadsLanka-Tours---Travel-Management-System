import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  align?: 'start' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  align = 'start',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between',
        align === 'center' && 'items-center text-center lg:flex-col lg:items-center',
        className,
      )}
    >
      <div className={cn('max-w-xl', align === 'center' && 'mx-auto max-w-3xl')}>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-eyebrow">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 font-display text-[2rem] leading-tight font-semibold tracking-[-0.025em] text-brand sm:text-[2.5rem] sm:leading-[3rem]">
          {title}
        </h2>
        {description ? <p className="mt-2 text-body text-muted">{description}</p> : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[15px] font-semibold tracking-[0.15px] text-brand"
        >
          {actionLabel}
          <Icon name="arrow_forward" className="text-[12px]" />
        </Link>
      ) : null}
    </div>
  )
}
