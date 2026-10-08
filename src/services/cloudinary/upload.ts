import { env, isCloudinaryConfigured } from '@/config/env.ts'

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
}

type CloudinaryUploadResponse = {
  secure_url?: unknown
  public_id?: unknown
  error?: {
    message?: unknown
  }
}

function isCloudinaryReady(): boolean {
  return isCloudinaryConfigured && Boolean(env.cloudinary.uploadPreset)
}

function uploadErrorMessage(payload: CloudinaryUploadResponse | null): string {
  const message = payload?.error?.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  return 'Image upload failed. Please try again.'
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryReady()) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file to upload.')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', env.cloudinary.uploadPreset)

  let response: Response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`, {
      method: 'POST',
      body,
    })
  } catch {
    throw new Error('Image upload failed. Check your connection and try again.')
  }

  let payload: CloudinaryUploadResponse | null = null
  try {
    payload = (await response.json()) as CloudinaryUploadResponse
  } catch {
    payload = null
  }

  if (!response.ok || typeof payload?.secure_url !== 'string' || typeof payload.public_id !== 'string') {
    throw new Error(uploadErrorMessage(payload))
  }

  return {
    secure_url: payload.secure_url,
    public_id: payload.public_id,
  }
}
