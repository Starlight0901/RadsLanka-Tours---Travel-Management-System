import {
  Award,
  BadgeCheck,
  BadgeDollarSign,
  Bus,
  CalendarCheck,
  Camera,
  Car,
  CarFront,
  Clock,
  Compass,
  Globe,
  HandCoins,
  Headset,
  HeartHandshake,
  Hotel,
  IdCard,
  Leaf,
  Luggage,
  Map,
  MapPinned,
  MessageCircle,
  Mountain,
  Phone,
  PiggyBank,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { HERO_BENEFIT_FALLBACK_ICON, isHeroBenefitIconId, type HeroBenefitIconId } from '@/config/heroBenefits.ts'

const heroBenefitIcons = {
  'id-card': IdCard,
  'user-check': UserCheck,
  car: Car,
  'car-front': CarFront,
  bus: Bus,
  map: Map,
  'map-pinned': MapPinned,
  route: Route,
  compass: Compass,
  wallet: Wallet,
  'hand-coins': HandCoins,
  'badge-dollar-sign': BadgeDollarSign,
  'piggy-bank': PiggyBank,
  headset: Headset,
  'message-circle': MessageCircle,
  phone: Phone,
  clock: Clock,
  'shield-check': ShieldCheck,
  'badge-check': BadgeCheck,
  'heart-handshake': HeartHandshake,
  award: Award,
  star: Star,
  sparkles: Sparkles,
  users: Users,
  hotel: Hotel,
  plane: Plane,
  luggage: Luggage,
  'calendar-check': CalendarCheck,
  leaf: Leaf,
  mountain: Mountain,
  camera: Camera,
  globe: Globe,
} satisfies Record<HeroBenefitIconId, LucideIcon>

type HeroBenefitIconProps = {
  icon: string
  className?: string
}

/** Renders only approved icons. Unknown identifiers use the fallback icon. */
export function HeroBenefitIcon({ icon, className }: HeroBenefitIconProps) {
  const Component = heroBenefitIcons[isHeroBenefitIconId(icon) ? icon : HERO_BENEFIT_FALLBACK_ICON]
  return <Component className={className} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}
