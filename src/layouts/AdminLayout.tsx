import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/layout/AdminSidebar.tsx'

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            Menu
          </button>
          <p className="text-sm font-semibold text-slate-900">Admin</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
