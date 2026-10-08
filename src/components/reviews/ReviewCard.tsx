import { RatingStars } from '@/components/ui/RatingStars.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'

export type ReviewCardProps = {
  travelerName: string
  country?: string
  dateLabel?: string
  rating: number
  title?: string
  review: string
  chauffeurName?: string
  tags?: string[]
  photoUrl?: string
  photoAlt?: string
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
  photoUrl,
  photoAlt,
}: ReviewCardProps) {
  const meta = [country, dateLabel].filter(Boolean).join(' • ')

  return (
    <article className="lift-card flex h-full flex-col justify-between rounded-2xl bg-surface-elevated p-6 shadow-[0_4px_20px_-2px_rgba(27,67,50,0.06)] lg:p-8">
      <div>
        <div className="flex items-start gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt={photoAlt ?? ''} className="size-12 rounded-full object-cover" />
          ) : photoAlt ? (
            <span className="size-12 overflow-hidden rounded-full">
              <PlaceholderMedia label={photoAlt} />
            </span>
          ) : (
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-chip text-[13px] font-bold tracking-[0.26px] text-brand">
              {initialsFromName(travelerName)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-[0.15px] text-brand">{travelerName}</p>
            {meta ? <p className="text-[13px] leading-5 text-muted">{meta}</p> : null}
            <RatingStars rating={rating} className="mt-1" />
          </div>
        </div>
        {tags.length > 0 || chauffeurName ? (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {chauffeurName ? <span>Chauffeur {chauffeurName}</span> : null}
          </p>
        ) : null}
        {title ? <h3 className="mt-4 font-display text-xl leading-snug text-brand">{title}</h3> : null}
        <blockquote className="mt-3 text-body text-ink italic">“{review}”</blockquote>
      </div>
    </article>
  )
}
