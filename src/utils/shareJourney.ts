import { env } from '@/config/env.ts'
import { paths } from '@/routes/paths.ts'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return LOCAL_HOSTS.has(host) || host.endsWith('.localhost')
}

function originFromValue(value: string): string | null {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) {
    return null
  }

  try {
    const url = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    if (isLocalHostname(url.hostname)) {
      return null
    }
    return url.origin
  } catch {
    return null
  }
}

export function publicSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    const fromWindow = originFromValue(window.location.origin)
    if (fromWindow) {
      return fromWindow
    }
  }

  const fromEnv = originFromValue(env.publicSiteUrl)
  if (fromEnv) {
    return fromEnv
  }

  const fromAuthDomain = originFromValue(env.firebase.authDomain)
  if (fromAuthDomain) {
    return fromAuthDomain
  }

  return ''
}

export function absolutePublicUrl(path: string): string {
  const origin = publicSiteOrigin()
  const pathname = path.startsWith('/') ? path : `/${path}`
  if (!origin) {
    return pathname
  }

  return new URL(pathname, `${origin}/`).toString()
}

export function buildShareYourExperienceUrl(): string {
  return absolutePublicUrl(paths.shareYourExperience)
}

export function buildTourShareUrl(slug: string): string {
  return absolutePublicUrl(paths.tour(slug))
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

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function facebookShareHref(title: string, description: string, url: string): string {
  const quote = [title.trim(), description.trim()].filter(Boolean).join('\n\n')
  const params = new URLSearchParams({ u: url })
  if (quote) {
    params.set('quote', quote)
  }
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

export function emailShareHref(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function xShareHref(title: string, description: string, url: string): string {
  const text = [title.trim(), description.trim()].filter(Boolean).join('\n\n')
  const params = new URLSearchParams({ url, text })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}
