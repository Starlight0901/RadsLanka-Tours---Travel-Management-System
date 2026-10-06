import { useMemo, useState } from 'react'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { ImageCard } from '@/components/common/ImageCard.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs.tsx'
import { ButtonLink } from '@/components/ui/Button.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { Modal } from '@/components/ui/Modal.tsx'
import { filterPublishedGallery, galleryFilters, listPublishedGallery } from '@/data/galleryCatalog.ts'
import { paths } from '@/routes/paths.ts'
import type { GalleryCategory } from '@/types/gallery.ts'
import { cn } from '@/utils/cn.ts'

export function GalleryPage() {
  const [category, setCategory] = useState<'all' | GalleryCategory>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const items = useMemo(() => filterPublishedGallery(category), [category])
  const all = listPublishedGallery()
  const active = all.find((item) => item.id === activeId)

  return (
    <>
      <PageMeta title="Gallery" description="Every photograph is a chapter waiting for you." />

      <Container className="flex items-center justify-between py-4">
        <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Gallery' }]} />
        <p className="hidden text-[13px] text-muted lg:block">[Gallery status from Figma]</p>
      </Container>

      <section className="pb-6">
        <Container>
          <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">[Gallery eyebrow from Figma]</p>
          <h1 className="mt-2 font-display text-[2.5rem] font-semibold text-brand lg:text-[3.5rem]">
            [Gallery headline from Figma]
          </h1>
          <p className="mt-3 max-w-2xl text-body text-muted">
            The Rhythm of the Highlands. Private chauffeured travel honors unscripted discovery. Between Kandy and Nuwara
            Eliya, winding mountain roads invite spontaneous halts for piping hot roadside ginger tea, watching emerald
            mist tumble over century-old tea factories.
          </p>
          <ul className="mt-8 -mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {galleryFilters.map((filter) => {
              const count = (() => {
                if (filter.value === 'all') return all.length
                const category = filter.value
                return all.filter((item) => item.categories.includes(category)).length
              })()
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
          {items.length === 0 ? (
            <EmptyState title="No images in this category" message="Choose another gallery filter to see published photographs." />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-12">
              {items.map((item) => (
                <li key={item.id} className={item.gridClass}>
                  <div className="relative h-full">
                    <ImageCard alt={item.alt} className="h-full min-h-[16rem]" onClick={() => setActiveId(item.id)} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand/80 to-transparent p-4">
                      <p className="font-display text-lg text-on-brand">{item.title}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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

      <Modal open={Boolean(active)} title={active?.title ?? 'Gallery image'} onClose={() => setActiveId(null)}>
        {active ? (
          <div className="space-y-3">
            <div className="h-72 overflow-hidden rounded-xl">
              <PlaceholderMedia label={active.alt} />
            </div>
            <p className="text-body text-muted">{active.caption}</p>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
