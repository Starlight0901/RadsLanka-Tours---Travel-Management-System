import {
  Binoculars,
  Bird,
  Camera,
  Castle,
  Church,
  Coffee,
  Compass,
  Droplets,
  Fish,
  Flower2,
  Footprints,
  Landmark,
  Leaf,
  MapPin,
  Mountain,
  Music,
  Palette,
  PawPrint,
  Sailboat,
  Sparkles,
  Star,
  Store,
  Sun,
  Sunrise,
  Sunset,
  Tent,
  Train,
  TreePalm,
  Trees,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import {
  DESTINATION_HIGHLIGHT_FALLBACK_ICON,
  isDestinationHighlightIconId,
  type DestinationHighlightIconId,
} from '@/config/destinationContent.ts'

const destinationHighlightIcons = {
  sunrise: Sunrise,
  sunset: Sunset,
  sun: Sun,
  'palm-tree': TreePalm,
  waves: Waves,
  droplets: Droplets,
  sailboat: Sailboat,
  'paw-print': PawPrint,
  bird: Bird,
  fish: Fish,
  binoculars: Binoculars,
  trees: Trees,
  leaf: Leaf,
  flower: Flower2,
  mountain: Mountain,
  footprints: Footprints,
  tent: Tent,
  landmark: Landmark,
  castle: Castle,
  church: Church,
  store: Store,
  utensils: Utensils,
  coffee: Coffee,
  music: Music,
  palette: Palette,
  train: Train,
  camera: Camera,
  'map-pin': MapPin,
  compass: Compass,
  star: Star,
  sparkles: Sparkles,
} satisfies Record<DestinationHighlightIconId, LucideIcon>

type DestinationHighlightIconProps = {
  icon?: string
  className?: string
}

/** Renders only approved icons. Missing or unknown identifiers use the fallback icon. */
export function DestinationHighlightIcon({ icon, className }: DestinationHighlightIconProps) {
  const Component =
    destinationHighlightIcons[isDestinationHighlightIconId(icon) ? icon : DESTINATION_HIGHLIGHT_FALLBACK_ICON]
  return <Component className={className} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}
