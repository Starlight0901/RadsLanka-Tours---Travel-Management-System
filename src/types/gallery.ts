export type GalleryCategory = 'destinations' | 'tours' | 'travel' | 'culture' | 'wildlife'

export type CatalogGalleryLink = {
  slug: string
  label: string
}

export type CatalogGalleryItem = {
  id: string
  title: string
  caption: string
  alt: string
  src?: string
  category: GalleryCategory
  categories: GalleryCategory[]
  gridClass: string
  published: boolean
  tour?: CatalogGalleryLink
  destination?: CatalogGalleryLink
}
