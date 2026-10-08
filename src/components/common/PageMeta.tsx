import { usePageMeta, type PageMetaOptions } from '@/hooks/usePageMeta.ts'

type PageMetaProps = PageMetaOptions & {
  title: string
  description: string
}

export function PageMeta({ title, description, image, url, type, socialTitle }: PageMetaProps) {
  usePageMeta(title, description, { image, url, type, socialTitle })
  return null
}
