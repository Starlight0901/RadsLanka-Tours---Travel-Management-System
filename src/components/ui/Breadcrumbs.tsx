import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <Icon name="chevron_right" className="text-[12px] text-muted" />
              ) : null}
              {isLast || !item.to ? (
                <span
                  className="truncate text-[13px] font-semibold tracking-[0.26px] text-brand"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="truncate text-[13px] font-semibold tracking-[0.26px] text-muted hover:text-brand"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
