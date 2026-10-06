import { useState } from 'react'
import { ImageCard } from '@/components/common/ImageCard.tsx'
import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { Modal } from '@/components/ui/Modal.tsx'
import { cn } from '@/utils/cn.ts'

export type GalleryImage = {
  src?: string
  alt: string
  caption?: string
}

export type ImageGalleryProps = {
  items: GalleryImage[]
  className?: string
}

export function ImageGallery({ items, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active = activeIndex === null ? null : items[activeIndex]

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {items.map((item, index) => (
          <li key={`${item.src ?? item.alt}-${index}`}>
            <ImageCard
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              className="aspect-[4/3] w-full"
              onClick={() => setActiveIndex(index)}
            />
          </li>
        ))}
      </ul>
      <Modal
        open={activeIndex !== null}
        title={active?.caption || active?.alt || 'Gallery image'}
        onClose={() => setActiveIndex(null)}
      >
        {active?.src ? (
          <img src={active.src} alt={active.alt} className="w-full rounded-xl object-contain" />
        ) : active ? (
          <div className="h-64 overflow-hidden rounded-xl">
            <PlaceholderMedia label={active.alt} />
          </div>
        ) : null}
      </Modal>
    </>
  )
}
