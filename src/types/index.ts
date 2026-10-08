export type {
  CatalogDestination,
  DestinationExperience,
  DestinationFact,
  DestinationImage,
  DestinationInfoItem,
  DestinationPlace,
  DestinationSeason,
  DestinationStat,
} from '@/types/destinations.ts'

export type {
  CatalogReview,
  CatalogTour,
  ReviewStatus,
  TourHighlight,
  TourImage,
  TourItineraryDay,
  TourPracticalNote,
} from '@/types/tours.ts'

export type { CatalogVehicle, VehicleImage, VehicleSpec } from '@/types/vehicles.ts'
export type { CatalogGalleryItem, GalleryCategory } from '@/types/gallery.ts'

export {
  FIRESTORE_COLLECTIONS,
  type Accommodation,
  type AdminProfile,
  type AdminRole,
  type CollectionName,
  type Destination,
  type FirestoreTimestamp,
  type GalleryItem,
  type HeroTextBlock,
  type HeroTextStyle,
  type HomepageHeroContent,
  type Inquiry,
  type InquiryStatus,
  type InquiryType,
  type MediaAsset,
  type Review,
  type SiteSettings,
  type Tour,
  type TourPricingBasis,
  type TourTag,
  type TravelStyle,
  type WhyTravelerItem,
  type Vehicle,
} from '@/types/models.ts'
