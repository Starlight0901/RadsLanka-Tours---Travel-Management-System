import { env, isCloudinaryConfigured } from '@/config/env.ts'

export const cloudinaryConfig = {
  cloudName: env.cloudinary.cloudName,
  uploadPreset: env.cloudinary.uploadPreset,
  isConfigured: isCloudinaryConfigured,
}

export const cloudinaryFolders = {
  root: 'travel-agency',
  tours: 'travel-agency/tours',
  destinations: 'travel-agency/destinations',
  vehicles: 'travel-agency/vehicles',
  gallery: 'travel-agency/gallery',
  reviews: 'travel-agency/reviews',
  site: 'travel-agency/site',
} as const

export type CloudinaryFolder = (typeof cloudinaryFolders)[keyof typeof cloudinaryFolders]
