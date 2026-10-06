import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type RatingStarsProps = {
  rating: number
  max?: number
  className?: string
}

export function RatingStars({ rating, max = 5, className }: RatingStarsProps) {
  const value = Math.min(max, Math.max(0, Math.round(rating)))

  return (
    <div className={cn('flex items-center', className)} role="img" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          filled={index < value}
          className={cn('text-[14px]', index < value ? 'text-accent' : 'text-border')}
        />
      ))}
    </div>
  )
}
