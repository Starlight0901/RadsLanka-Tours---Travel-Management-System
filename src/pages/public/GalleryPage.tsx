import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ImageCard } from '@/components/common/ImageCard.tsx'
import { Reveal } from '@/components/common/Reveal.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { Modal } from '@/components/ui/Modal.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { filterGalleryItems, galleryFilters } from '@/data/galleryCatalog.ts'
import { paths } from '@/routes/paths.ts'
import { listPublicGalleryCatalog } from '@/services/firebase/gallery.ts'
import type { CatalogGalleryItem, GalleryCategory } from '@/types/gallery.ts'
import { cn } from '@/utils/cn.ts'

const galleryIntro =
  'The Soul of the Island. Sri Lanka reveals its magic in the moments between destinations. From mist-veiled mountain peaks and endless emerald tea gardens to sun-kissed southern shores and ancient kingdoms steeped in legend, every winding road invites an unhurried pause — for a steaming cup of Ceylon tea, the distant call of a temple bell, or the golden light settling over a village at dusk. With the freedom of private chauffeured travel, discover an island where every detour tells a story and every journey unfolds at its own beautiful rhythm.'

function AssociationLinks({
  item,
  className,
  onNavigate,
}: {
  item: CatalogGalleryItem
  className?: string
  onNavigate?: () => void
}) {
  if (!item.tour && !item.destination) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {item.tour ? (
        <Link
          to={paths.tour(item.tour.slug)}
          className="inline-flex min-h-11 items-center rounded-full bg-white/15 px-3 text-[12px] font-semibold text-on-brand hover:bg-white/25"
          onClick={onNavigate}
        >
          {item.tour.label}
        </Link>
      ) : null}
      {item.destination ? (
        <Link
          to={paths.destination(item.destination.slug)}
          className="inline-flex min-h-11 items-center rounded-full bg-white/15 px-3 text-[12px] font-semibold text-on-brand hover:bg-white/25"
          onClick={onNavigate}
        >
          {item.destination.label}
        </Link>
      ) : null}
    </div>
  )
}

export function GalleryPage() {
  const [category, setCategory] = useState<'all' | GalleryCategory>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [all, setAll] = useState<CatalogGalleryItem[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : 'Add your Firebase web config to load the gallery.',
  )
  const items = useMemo(() => filterGalleryItems(all, category), [all, category])
  const active = all.find((item) => item.id === activeId)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let activeLoad = true
    setLoading(true)
    listPublicGalleryCatalog()
      .then((next) => {
        if (activeLoad) {
          setAll(next)
          setError(null)
        }
      })
      .catch((loadError: unknown) => {
        if (activeLoad) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load the gallery.')
        }
      })
      .finally(() => {
        if (activeLoad) {
          setLoading(false)
        }
      })

    return () => {
      activeLoad = false
    }
  }, [])

  return (
    <>
      <PageMeta title="Gallery" description="Every photograph is a chapter waiting for you." />

      <Container className="py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Gallery' }]} />
      </Container>

      <section className="pb-6">
        <Container>
          <h1 className="font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">
            Our Photos
          </h1>
          <p className="mt-3 max-w-3xl text-body text-muted">{galleryIntro}</p>
          <ul className="mt-8 -mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {galleryFilters.map((filter) => {
              const filterValue = filter.value
              const count =
                filterValue === 'all'
                  ? all.length
                  : all.filter((item) => item.categories.includes(filterValue)).length
              return (
                <li key={filter.value} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategory(filter.value)}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold',
                      category === filter.value ? 'bg-brand text-on-brand' : 'bg-chip text-chip-text',
                    )}
                  >
                    {filter.label}
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">{count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container>
          {loading ? <LoadingState label="Loading gallery" /> : null}
          {error ? <ErrorState title="Unable to load gallery" message={error} /> : null}
          {!loading && !error && items.length === 0 ? (
            <EmptyState
              title={all.length === 0 ? 'No photographs yet' : 'No images in this category'}
              message={
                all.length === 0
                  ? 'Published gallery images will appear here.'
                  : 'Choose another gallery filter to see published photographs.'
              }
            />
          ) : null}
          {!loading && !error && items.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {items.map((item, index) => (
                <li key={item.id} className={item.gridClass}>
                  <Reveal className="h-full" delay={Math.min(index * 40, 200)}>
                    <div className="relative h-full overflow-hidden rounded-2xl bg-surface-container">
                      <ImageCard
                        src={item.src}
                        alt={item.alt || item.title}
                        className="h-full min-h-[16rem]"
                        onClick={() => setActiveId(item.id)}
                      />
                      {item.title || item.tour || item.destination ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand/85 to-transparent p-4">
                          {item.title ? (
                            <p className="font-display text-lg text-on-brand">{item.title}</p>
                          ) : null}
                          <AssociationLinks item={item} className="pointer-events-auto mt-2" />
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      <section className="bg-surface-elevated py-16 lg:py-20">
        <Container className="text-center">
          <h2 className="font-display text-[2rem] font-semibold text-brand">Every photograph is a chapter waiting for you.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to={paths.inquiry}>Plan Your Sri Lankan Journey</ButtonLink>
            <ButtonLink to={paths.tours} variant="ghost">
              Explore tours
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Modal open={Boolean(active)} title={active?.title || 'Photograph'} onClose={() => setActiveId(null)}>
        {active ? (
          <div className="space-y-3">
            {active.src ? (
              <img src={active.src} alt={active.alt || active.title} className="max-h-96 w-full rounded-xl object-contain" />
            ) : null}
            {active.caption && active.caption !== active.title ? (
              <p className="text-body text-muted">{active.caption}</p>
            ) : null}
            {active.tour || active.destination ? (
              <div className="flex flex-wrap gap-2">
                {active.tour ? (
                  <Link
                    to={paths.tour(active.tour.slug)}
                    className="inline-flex min-h-11 items-center rounded-full bg-chip px-3 text-[13px] font-semibold text-chip-text"
                    onClick={() => setActiveId(null)}
                  >
                    {active.tour.label}
                  </Link>
                ) : null}
                {active.destination ? (
                  <Link
                    to={paths.destination(active.destination.slug)}
                    className="inline-flex min-h-11 items-center rounded-full bg-chip px-3 text-[13px] font-semibold text-chip-text"
                    onClick={() => setActiveId(null)}
                  >
                    {active.destination.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
