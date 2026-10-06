import { PlaceholderMedia } from '@/components/common/PlaceholderMedia.tsx'
import { cn } from '@/utils/cn.ts'

export type ImageCardProps = {
  src?: string
  alt: string
  caption?: string
  className?: string
  onClick?: () => void
}

export function ImageCard({ src, alt, caption, className, onClick }: ImageCardProps) {
  const media = src ? (
    <img src={src} alt={alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
  ) : (
    <PlaceholderMedia label={alt} />
  )

  return (
    <figure className={cn('overflow-hidden rounded-2xl bg-surface-container', className)}>
      {onClick ? (
        <button type="button" onClick={onClick} className="group block h-full min-h-11 w-full">
          {media}
        </button>
      ) : (
        media
      )}
      {caption ? <figcaption className="px-3 py-2 text-[13px] text-muted">{caption}</figcaption> : null}
    </figure>
  )
}
