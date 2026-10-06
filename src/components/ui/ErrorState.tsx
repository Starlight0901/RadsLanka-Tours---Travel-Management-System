export type ErrorStateProps = {
  title?: string
  message: string
}

export function ErrorState({ title = 'Something went wrong', message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-900" role="alert">
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-2 text-body">{message}</p>
    </div>
  )
}
