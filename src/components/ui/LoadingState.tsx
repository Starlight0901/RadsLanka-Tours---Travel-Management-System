export type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      <p className="text-sm">{label}…</p>
    </div>
  )
}
