import { useEffect, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type DrawerProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  side?: 'left' | 'right'
}

export function Drawer({ open, title, onClose, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-brand/40" aria-label="Close panel" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute top-0 flex h-full w-[min(24rem,100%)] flex-col bg-surface-elevated shadow-lg',
          side === 'right' ? 'right-0' : 'left-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-2xl text-brand">{title}</h2>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-control hover:bg-surface-container"
            onClick={onClose}
          >
            <Icon name="close" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5">{children}</div>
      </aside>
    </div>
  )
}
