import { useEffect } from 'react'
import { siteFallback } from '@/config/site.ts'

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  const selector = `meta[${attribute}="${name}"]`
  let element = document.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function removeMeta(name: string, attribute: 'name' | 'property' = 'name') {
  document.querySelector(`meta[${attribute}="${name}"]`)?.remove()
}

export type PageMetaOptions = {
  image?: string
  url?: string
  type?: string
  socialTitle?: string
}

export function usePageMeta(title: string, description: string, options?: PageMetaOptions) {
  const image = options?.image
  const url = options?.url
  const type = options?.type
  const socialTitle = options?.socialTitle

  useEffect(() => {
    const fullTitle = `${title} | ${siteFallback.name}`
    document.title = fullTitle
    setMeta('description', description)
    setMeta('og:title', socialTitle?.trim() || fullTitle, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', type?.trim() || 'website', 'property')

    const pageUrl = url?.trim() || window.location.href
    if (pageUrl) {
      setMeta('og:url', pageUrl, 'property')
    }

    const imageUrl = image?.trim()
    if (imageUrl) {
      setMeta('og:image', imageUrl, 'property')
    } else {
      removeMeta('og:image', 'property')
    }

    return () => {
      removeMeta('og:image', 'property')
    }
  }, [title, description, image, url, type, socialTitle])
}
