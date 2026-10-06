import { cn } from '@/utils/cn.ts'

export type BadgeVariant = 'glass' | 'sage' | 'gold'

export type BadgeProps = {
  children: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  glass:
    'border border-white/60 bg-white/90 text-brand shadow-sm backdrop-blur-[6px]',
  sage: 'bg-chip text-chip-text',
  gold: 'bg-white/85 text-brand backdrop-blur-[6px]',
}

export function Badge({ children, variant = 'sage', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.66px]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
