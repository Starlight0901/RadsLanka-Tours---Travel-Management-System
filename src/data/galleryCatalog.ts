import { mockGallery } from '@/data/gallery.ts'
import type { CatalogGalleryItem, GalleryCategory } from '@/types/gallery.ts'

export function listPublishedGallery(): CatalogGalleryItem[] {
  return mockGallery.filter((item) => item.published)
}

export const galleryFilters: { value: 'all' | GalleryCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'destinations', label: 'Destinations' },
  { value: 'tours', label: 'Tours' },
]

export function filterGalleryItems(
  items: CatalogGalleryItem[],
  category: 'all' | GalleryCategory,
): CatalogGalleryItem[] {
  if (category === 'all') return items
  return items.filter((item) => item.categories.includes(category))
}

export function filterPublishedGallery(category: 'all' | GalleryCategory): CatalogGalleryItem[] {
  return filterGalleryItems(listPublishedGallery(), category)
}
