import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const node = dialogRef.current
    if (!node) {
      return
    }

    if (open && !node.open) {
      node.showModal()
    } else if (!open && node.open) {
      node.close()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(42rem,calc(100%-2rem))] overflow-auto rounded-2xl bg-surface-elevated p-0 shadow-lg backdrop:bg-brand/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={cn('p-6', className)}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl text-brand">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-control text-brand hover:bg-surface-container"
            onClick={onClose}
          >
            <Icon name="close" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
