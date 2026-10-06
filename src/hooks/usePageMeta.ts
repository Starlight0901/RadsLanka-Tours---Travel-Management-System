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

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = `${title} | ${siteFallback.name}`
    document.title = fullTitle
    setMeta('description', description)
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description, 'property')
  }, [title, description])
}
