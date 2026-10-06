import { useAuth } from '@/hooks/useAuth.ts'

type AdminHeaderProps = {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">{user?.email ?? 'Admin'}</p>
    </header>
  )
}
