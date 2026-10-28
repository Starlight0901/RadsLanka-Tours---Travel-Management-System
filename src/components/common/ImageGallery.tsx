import { useState } from 'react'
import { ImageCard } from '@/components/common/ImageCard.tsx'
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
  const visible = items.filter((item) => Boolean(item.src))
  const active = activeIndex === null ? null : visible[activeIndex]

  if (visible.length === 0) {
    return null
  }

  return (
    <>
      <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {visible.map((item, index) => (
          <li key={`${item.src ?? item.alt}-${index}`}>
            <ImageCard
              src={item.src}
              alt={item.alt || item.caption || 'Gallery image'}
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
          <img src={active.src} alt={active.alt || active.caption || ''} className="w-full rounded-xl object-contain" />
        ) : null}
      </Modal>
    </>
  )
}
