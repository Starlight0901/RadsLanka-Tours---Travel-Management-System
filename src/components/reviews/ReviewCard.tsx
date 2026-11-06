import { RatingStars } from '@/components/ui/RatingStars.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { cn } from '@/utils/cn.ts'

export type ReviewCardProps = {
  travelerName: string
  country?: string
  dateLabel?: string
  rating: number
  title?: string
  review: string
  chauffeurName?: string
  tags?: string[]
  tourTitle?: string
  destinationNames?: string[]
  photoUrl?: string
  photoAlt?: string
  clampText?: boolean
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ReviewCard({
  travelerName,
  country,
  dateLabel,
  rating,
  title,
  review,
  chauffeurName,
  tags = [],
  tourTitle,
  destinationNames,
  photoUrl,
  photoAlt,
  clampText = false,
}: ReviewCardProps) {
  const destinations = (destinationNames ?? tags).filter(Boolean)
  const meta = [dateLabel, country].filter(Boolean).join(' • ')

  return (
    <article className="lift-card flex h-full flex-col justify-between rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_20px_-2px_rgba(27,67,50,0.06)] lg:p-8">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt={photoAlt ?? ''} className="size-12 rounded-full object-cover" />
          ) : photoAlt ? (
            <span className="size-12 overflow-hidden rounded-full">
              <PlaceholderMedia label={photoAlt} />
            </span>
          ) : (
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-chip text-[13px] font-bold tracking-[0.26px] text-brand">
              {initialsFromName(travelerName)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-[0.15px] text-brand">{travelerName}</p>
            {meta ? <p className="text-[13px] leading-5 text-muted">{meta}</p> : null}
            <RatingStars rating={rating} className="mt-1" />
          </div>
        </div>
        {tourTitle ? (
          <p className="mt-4 text-sm font-semibold text-brand-muted">{tourTitle}</p>
        ) : null}
        {destinations.length > 0 || chauffeurName ? (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            {destinations.map((destination) => (
              <Badge key={destination}>{destination}</Badge>
            ))}
            {chauffeurName ? <span>Chauffeur {chauffeurName}</span> : null}
          </p>
        ) : null}
        {title ? <h3 className="mt-4 font-display text-xl leading-snug text-brand">{title}</h3> : null}
        <blockquote
          className={cn(
            'mt-3 break-words text-body text-ink italic',
            clampText ? 'line-clamp-6 whitespace-pre-wrap' : 'whitespace-pre-wrap',
          )}
        >
          “{review}”
        </blockquote>
      </div>
    </article>
  )
}
