import { cn } from '@/utils/cn.ts'

type IconProps = {
  name: string
  className?: string
  filled?: boolean
  label?: string
}

export function Icon({ name, className, filled = false, label }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', className)}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  )
}
