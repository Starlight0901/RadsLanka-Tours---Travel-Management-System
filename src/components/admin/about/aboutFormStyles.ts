export const controlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

export const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export const hintClassName = 'mt-1.5 text-xs text-slate-500'

export const rowButtonClassName =
  'inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40'

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
