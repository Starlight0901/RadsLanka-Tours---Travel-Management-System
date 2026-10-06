import { mockGallery } from '@/data/gallery.ts'
import type { CatalogGalleryItem, GalleryCategory } from '@/types/gallery.ts'

export function listPublishedGallery(): CatalogGalleryItem[] {
  return mockGallery.filter((item) => item.published)
}

export const galleryFilters: { value: 'all' | GalleryCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'destinations', label: 'Destinations' },
  { value: 'tours', label: 'Tours' },
  { value: 'travel', label: 'Travel' },
  { value: 'culture', label: 'Culture' },
  { value: 'wildlife', label: 'Wildlife' },
]

export function filterPublishedGallery(category: 'all' | GalleryCategory): CatalogGalleryItem[] {
  const items = listPublishedGallery()
  if (category === 'all') return items
  return items.filter((item) => item.categories.includes(category))
}
