import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type RatingStarsProps = {
  rating: number
  max?: number
  className?: string
}

export function RatingStars({ rating, max = 5, className }: RatingStarsProps) {
  const value = Math.min(max, Math.max(0, rating))

  return (
    <div
      className={cn('flex items-center text-[14px]', className)}
      role="img"
      aria-label={`${value.toFixed(2)} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        return (
          <span key={index} className="relative inline-flex leading-none">
            <Icon name="star" className="text-[1em] text-border" />
            {fill > 0 ? (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Icon name="star" filled className="text-[1em] text-accent" />
              </span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}
