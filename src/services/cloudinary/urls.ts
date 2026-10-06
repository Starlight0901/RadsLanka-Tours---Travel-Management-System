import { cloudinaryConfig } from '@/services/cloudinary/config.ts'

export type CloudinaryTransform = {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'limit'
  quality?: 'auto' | number
}

export function getCloudinaryUrl(publicId: string, transform: CloudinaryTransform = {}): string {
  if (!cloudinaryConfig.cloudName || !publicId) {
    return ''
  }

  const parts = [
    transform.width ? `w_${transform.width}` : null,
    transform.height ? `h_${transform.height}` : null,
    transform.crop ? `c_${transform.crop}` : 'c_limit',
    `q_${transform.quality ?? 'auto'}`,
    'f_auto',
  ].filter(Boolean)

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${parts.join(',')}/${publicId}`
}
