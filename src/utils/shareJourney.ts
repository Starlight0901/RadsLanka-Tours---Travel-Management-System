import { paths } from '@/routes/paths.ts'

export function buildTourShareUrl(slug: string): string {
  const path = paths.tour(slug)
  if (typeof window === 'undefined') {
    return path
  }

  return new URL(path, window.location.origin).toString()
}

export function absoluteAssetUrl(src?: string): string | undefined {
  const value = src?.trim()
  if (!value || typeof window === 'undefined') {
    return value || undefined
  }

  try {
    return new URL(value, window.location.origin).toString()
  } catch {
    return undefined
  }
}

export function buildWhatsAppShareText(title: string, description: string, url: string): string {
  const parts = [`*${title.trim()}*`]
  const body = description.trim()
  if (body) {
    parts.push(body)
  }
  parts.push(url)
  return parts.join('\n\n')
}

export function whatsAppShareHref(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function facebookShareHref(title: string, description: string, url: string): string {
  const quote = [title.trim(), description.trim()].filter(Boolean).join('\n\n')
  const params = new URLSearchParams({ u: url })
  if (quote) {
    params.set('quote', quote)
  }
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

export function xShareHref(title: string, description: string, url: string): string {
  const text = [title.trim(), description.trim()].filter(Boolean).join('\n\n')
  const params = new URLSearchParams({ url, text })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}
