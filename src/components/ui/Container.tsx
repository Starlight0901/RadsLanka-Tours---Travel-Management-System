import type { ReactNode } from 'react'
import { cn } from '@/utils/cn.ts'

type ContainerProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer'
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-content px-gutter lg:px-gutter-lg', className)}>{children}</Tag>
  )
}
