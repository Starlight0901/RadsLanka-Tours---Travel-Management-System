import { Link } from 'react-router-dom'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { paths } from '@/routes/paths.ts'
import type { CatalogTour } from '@/types/tours.ts'

export type TourCardProps = {
  tour: CatalogTour
}

export function TourCard({ tour }: TourCardProps) {
  const href = paths.tour(tour.slug)
  const image = tour.images[0]
  const imageAlt = image?.alt ?? tour.title

  return (
    <article className="lift-card flex h-full flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_4px_24px_-2px_rgba(27,67,50,0.06)]">
      <Link to={href} className="relative block h-60 overflow-hidden lg:h-64">
        {image?.src ? (
          <img
            src={image.src}
            alt={imageAlt}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <PlaceholderMedia label={imageAlt} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-transparent lg:from-transparent" />

        <Badge variant="glass" className="absolute top-3.5 left-3 lg:hidden">
          {tour.duration}
        </Badge>
        {tour.featuredLabel ? (
          <Badge variant="gold" className="absolute top-3.5 left-4 hidden lg:inline-flex">
            {tour.featuredLabel}
          </Badge>
        ) : null}

        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand shadow-sm lg:hidden">
          <Icon name="schedule" className="text-[14px]" />
          {tour.durationDays}d
        </span>

        <span className="absolute right-4 bottom-3 hidden items-center gap-1 rounded-full bg-brand/70 px-3 py-1 text-[11px] font-bold tracking-[0.4px] text-on-brand backdrop-blur-sm lg:inline-flex">
          <Icon name="schedule" className="text-[13px]" />
          {tour.duration}
        </span>

        <div className="absolute inset-x-3 bottom-3 text-on-brand lg:hidden">
          {tour.kicker ? (
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase">{tour.kicker}</p>
          ) : null}
          <h3 className="mt-1 text-lg leading-snug font-bold">{tour.title}</h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 lg:p-7">
        {tour.routeLabel ? (
          <p className="flex items-center gap-1.5 text-[13px] text-muted">
            <Icon name="route" className="text-[14px] text-brand" />
            <span className="truncate">{tour.routeLabel}</span>
          </p>
        ) : null}
        <h3 className="mt-2 hidden text-lg leading-[1.45] font-bold text-brand lg:block">
          <Link to={href}>{tour.title}</Link>
        </h3>
        <p className="mt-2 hidden text-body text-muted lg:line-clamp-3 lg:block">{tour.shortDescription}</p>
        {tour.tags.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2 lg:mt-4">
            {tour.tags.map((tag) => (
              <li key={tag}>
                <Badge className="uppercase">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          {tour.priceLabel ? (
            <div className="min-w-0 rounded-xl border border-[rgba(201,151,0,0.4)] bg-[rgba(201,151,0,0.12)] px-3 py-2">
              <p className="text-[15px] leading-tight font-bold text-[#1B4332]">
                {tour.priceLabel.startsWith('[')
                  ? tour.priceLabel
                  : /^LKR\b/i.test(tour.priceLabel)
                    ? `From ${tour.priceLabel}`
                    : `From LKR ${tour.priceLabel}`}
              </p>
              {tour.priceNote ? (
                <p className="mt-0.5 text-[11px] font-medium text-[#1B4332]/75">{tour.priceNote}</p>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          <Link
            to={href}
            className="lift-button inline-flex shrink-0 items-center rounded-full bg-[#C99700] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm"
          >
            Explore Tour
          </Link>
        </div>
      </div>
    </article>
  )
}
