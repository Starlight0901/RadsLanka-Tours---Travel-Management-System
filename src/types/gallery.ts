export type GalleryCategory = 'destinations' | 'tours' | 'travel' | 'culture' | 'wildlife'

export type CatalogGalleryItem = {
  id: string
  title: string
  caption: string
  alt: string
  category: GalleryCategory
  categories: GalleryCategory[]
  gridClass: string
  published: boolean
}
