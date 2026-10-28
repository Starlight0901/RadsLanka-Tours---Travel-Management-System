export const GALLERY_ASSOCIATION_LIMIT = 2

export const GALLERY_TITLE_MAX = 160

/** Gallery images must be strictly smaller than this size. */
export const GALLERY_IMAGE_MAX_BYTES = 2_500_000

export const GALLERY_IMAGE_SIZE_MESSAGE =
  'Image must be smaller than 2.5 MB. Please choose a smaller file.'

export function galleryImageExceedsSizeLimit(file: File): boolean {
  return file.size >= GALLERY_IMAGE_MAX_BYTES
}

export function assertGalleryImageFile(file: File): void {
  if (galleryImageExceedsSizeLimit(file)) {
    throw new Error(GALLERY_IMAGE_SIZE_MESSAGE)
  }
}

export type GalleryImageRef = {
  publicId?: string
  imageUrl?: string
}

export type GalleryAssociationRecord = GalleryImageRef & {
  id?: string
  tourId?: string
  destinationId?: string
}

export function galleryImageKey(image: GalleryImageRef): string {
  return image.publicId?.trim() || image.imageUrl?.trim() || ''
}

export function uniqueGalleryKeys(images: GalleryImageRef[]): Set<string> {
  const keys = new Set<string>()
  for (const image of images) {
    const key = galleryImageKey(image)
    if (key) {
      keys.add(key)
    }
  }
  return keys
}

/** Extra tour images after the hero. The first stored image remains the hero. */
export function embeddedTourGalleryImages<T>(images: T[]): T[] {
  return images.slice(1)
}

export function associatedGalleryKeys(params: {
  embedded: GalleryImageRef[]
  records: GalleryAssociationRecord[]
  tourId?: string
  destinationId?: string
  excludeRecordId?: string
}): Set<string> {
  const keys = uniqueGalleryKeys(params.embedded)
  const tourId = params.tourId?.trim() ?? ''
  const destinationId = params.destinationId?.trim() ?? ''

  for (const record of params.records) {
    if (params.excludeRecordId && record.id === params.excludeRecordId) {
      continue
    }
    const matchesTour = Boolean(tourId) && record.tourId === tourId
    const matchesDestination = Boolean(destinationId) && record.destinationId === destinationId
    if (!matchesTour && !matchesDestination) {
      continue
    }
    const key = galleryImageKey(record)
    if (key) {
      keys.add(key)
    }
  }

  return keys
}

export function galleryLimitMessage(kind: 'tour' | 'destination'): string {
  return kind === 'tour'
    ? `Each tour can have at most ${GALLERY_ASSOCIATION_LIMIT} gallery images, including images linked on the Gallery page.`
    : `Each destination can have at most ${GALLERY_ASSOCIATION_LIMIT} gallery images, including images linked on the Gallery page.`
}

export function exceedsGalleryLimit(nextCount: number, previousCount: number): boolean {
  return nextCount > GALLERY_ASSOCIATION_LIMIT && nextCount > previousCount
}

export function remainingGallerySlots(used: number): number {
  return Math.max(0, GALLERY_ASSOCIATION_LIMIT - used)
}
