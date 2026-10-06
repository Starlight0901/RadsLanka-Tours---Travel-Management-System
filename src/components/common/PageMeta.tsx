import { usePageMeta } from '@/hooks/usePageMeta.ts'

type PageMetaProps = {
  title: string
  description: string
}

export function PageMeta({ title, description }: PageMetaProps) {
  usePageMeta(title, description)
  return null
}
