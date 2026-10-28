import { useAuth } from '@/hooks/useAuth.ts'

type AdminHeaderProps = {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex flex-col gap-1 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="max-w-full truncate text-sm text-slate-500">{user?.email ?? 'Admin'}</p>
    </header>
  )
}
