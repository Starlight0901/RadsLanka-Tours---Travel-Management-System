export type DestinationImage = {
  alt: string
  caption?: string
  src?: string
}

export type DestinationExperience = {
  title: string
  description: string
  imageAlt: string
  category?: string
  duration?: string
}

export type DestinationPlace = {
  name: string
  label: string
  description: string
  imageAlt: string
}

export type DestinationFact = {
  label: string
  value: string
  icon: string
}

export type DestinationStat = {
  value: string
  label: string
  note: string
}

export type DestinationSeason = {
  month: string
  status: 'best' | 'good' | 'note'
}

export type DestinationInfoItem = {
  title: string
  body: string
}

export type CatalogDestination = {
  id: string
  slug: string
  name: string
  region?: string
  kicker?: string
  tagline?: string
  shortDescription: string
  fullDescription: string
  overviewTitle?: string
  images: DestinationImage[]
  tags: string[]
  stayNote?: string
  highlights: DestinationExperience[]
  places: DestinationPlace[]
  placesIntro?: string
  placesTitle?: string
  facts: DestinationFact[]
  stats: DestinationStat[]
  whyVisit: DestinationInfoItem[]
  seasons: DestinationSeason[]
  travelInfo: DestinationInfoItem[]
  featured?: boolean
  featuredSize?: 'large' | 'standard'
  gridCols?: 5 | 6 | 7
  published: boolean
}
