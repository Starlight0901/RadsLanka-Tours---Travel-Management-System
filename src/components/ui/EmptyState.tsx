import type { ReactNode } from 'react'

export type EmptyStateProps = {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-10 text-center shadow-card">
      <h2 className="font-display text-2xl text-brand">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-body text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
