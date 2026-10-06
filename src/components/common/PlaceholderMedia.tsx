import { cn } from '@/utils/cn.ts'

type PlaceholderMediaProps = {
  label: string
  className?: string
}

export function PlaceholderMedia({ label, className }: PlaceholderMediaProps) {
  return (
    <div
      role="img"
      aria-label={`${label} [Image placeholder]`}
      className={cn(
        'flex h-full w-full items-end bg-gradient-to-br from-brand via-brand-muted to-[#0a241c] p-4',
        className,
      )}
    >
      <span className="max-w-full text-[11px] font-semibold tracking-[0.04em] text-on-brand-soft">
        [Image] {label}
      </span>
    </div>
  )
}
