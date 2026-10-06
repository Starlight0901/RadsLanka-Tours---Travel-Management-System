import { Link } from 'react-router-dom'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { paths } from '@/routes/paths.ts'
import type { CatalogDestination } from '@/types/destinations.ts'
import { cn } from '@/utils/cn.ts'

export type DestinationCardProps = {
  destination: CatalogDestination
  variant?: 'editorial' | 'overlay'
  className?: string
}

export function DestinationCard({ destination, variant = 'editorial', className }: DestinationCardProps) {
  const href = paths.destination(destination.slug)
  const image = destination.images[0]
  const imageAlt = image?.alt ?? destination.name
  const large = destination.featuredSize === 'large'

  if (variant === 'overlay') {
    return (
      <article className={cn('relative isolate h-96 overflow-hidden rounded-2xl shadow-md', className)}>
        <Link to={href} className="absolute inset-0">
          {image?.src ? (
            <img src={image.src} alt={imageAlt} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
          ) : (
            <PlaceholderMedia label={imageAlt} />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-brand/95 via-brand/40 to-transparent" />
        </Link>
        {destination.kicker ? (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="gold">{destination.kicker}</Badge>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6">
          {destination.region ? (
            <p className="text-[11px] font-bold tracking-[0.55px] text-gold-soft uppercase">{destination.region}</p>
          ) : null}
          <h3 className="mt-1 font-display text-[2rem] leading-10 tracking-[-0.32px] text-on-brand-soft">
            <Link to={href}>{destination.name}</Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#d3e7db]">{destination.shortDescription}</p>
          <Link
            to={href}
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold tracking-[0.26px] text-gold-soft"
          >
            Discover Region
            <Icon name="arrow_forward" className="text-[11px]" />
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]',
        className,
      )}
    >
      <Link to={href} className={cn('relative block overflow-hidden', large ? 'h-72 lg:h-[26.25rem]' : 'h-64 lg:h-[18.75rem]')}>
        {image?.src ? (
          <img src={image.src} alt={imageAlt} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        ) : (
          <PlaceholderMedia label={imageAlt} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/20 to-transparent" />
        {destination.kicker ? (
          <Badge variant="gold" className="absolute top-4 left-4">
            {destination.kicker}
          </Badge>
        ) : null}
        <div className="absolute inset-x-5 bottom-5 hidden text-on-brand lg:block">
          {destination.region ? (
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase">{destination.region}</p>
          ) : null}
          <h3 className="mt-1 font-display text-[1.75rem] leading-tight font-semibold">{destination.name}</h3>
        </div>
        {destination.stayNote ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand lg:hidden">
            {destination.stayNote}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4 lg:p-8">
        <h3 className="font-display text-[1.75rem] leading-tight font-semibold text-brand lg:hidden">{destination.name}</h3>
        <p className="mt-3 text-body text-muted">{destination.shortDescription}</p>
        {destination.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {destination.tags.map((tag, index) => (
              <li key={`${tag}-${index}`}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-5">
          {destination.stayNote ? (
            <p className="hidden items-center gap-2 text-[13px] text-muted lg:flex">
              <Icon name="villa" className="text-[16px] text-brand" />
              {destination.stayNote}
            </p>
          ) : (
            <span />
          )}
          <Link to={href} className="inline-flex min-h-11 items-center gap-1 text-[15px] font-bold text-brand">
            Discover this region
            <Icon name="arrow_forward" className="text-[12px]" />
          </Link>
        </div>
      </div>
    </article>
  )
}
