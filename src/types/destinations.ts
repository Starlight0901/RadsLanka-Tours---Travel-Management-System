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

/** Published CMS experience card for the public destination page. */
export type CatalogDestinationExperience = {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
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

/** Compact, verified facts for the overview sidebar. Every field is optional until confirmed. */
export type DestinationGlance = {
  bestTime?: string
  location?: string
  recommendedStay?: string
  characteristics?: string[]
  idealFor?: string[]
}

/** A short destination-specific highlight, e.g. title "Sunset Views" with a one-line detail. */
export type DestinationKeyHighlight = {
  title: string
  detail: string
  icon?: string
}

export type DestinationEssenceTheme = {
  id: string
  title: string
  description?: string
  icon?: string
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
  experiences?: CatalogDestinationExperience[]
  places: DestinationPlace[]
  placesIntro?: string
  placesTitle?: string
  facts: DestinationFact[]
  stats: DestinationStat[]
  whyVisit: DestinationInfoItem[]
  glance?: DestinationGlance
  keyHighlights?: DestinationKeyHighlight[]
  /** Selected Essence themes in the order saved by the administrator. */
  essenceThemes?: DestinationEssenceTheme[]
  seasons: DestinationSeason[]
  travelInfo: DestinationInfoItem[]
  featured?: boolean
  featuredSize?: 'large' | 'standard'
  popular?: boolean
  gridCols?: 5 | 6 | 7
  published: boolean
}
