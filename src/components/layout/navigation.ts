import { paths } from '@/routes/paths.ts'

export const publicNavItems = [
  { to: paths.home, label: 'Home', end: true },
  { to: paths.tours, label: 'Tours', end: false },
  { to: paths.destinations, label: 'Destinations', end: false },
  { to: paths.vehicles, label: 'Vehicles', end: false },
  { to: paths.about, label: 'About Us', end: false },
  { to: paths.gallery, label: 'Gallery', end: false },
  { to: paths.reviews, label: 'Reviews', end: false },
  { to: paths.contact, label: 'Contact Us', end: false },
] as const

export const mobileBottomNavItems = [
  { to: paths.home, label: 'Discover', icon: 'explore', end: true },
  { to: paths.tours, label: 'Tours', icon: 'map', end: false },
  { to: paths.destinations, label: 'Destinations', icon: 'location_city', end: false },
  { to: paths.inquiry, label: 'Inquire', icon: 'tune', end: false },
] as const
