import {
  Car,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Settings,
  Star,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const items = [
  { to: paths.admin.root, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.admin.tours, label: 'Tours', icon: Map },
  { to: paths.admin.destinations, label: 'Destinations', icon: MapPin },
  { to: paths.admin.vehicles, label: 'Vehicles', icon: Car },
  { to: paths.admin.reviews, label: 'Reviews', icon: Star },
  { to: paths.admin.gallery, label: 'Gallery', icon: Image },
  { to: paths.admin.inquiries, label: 'Inquiries', icon: Inbox },
  { to: paths.admin.settings, label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">RadsLanka Tours</p>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50',
                  isActive && 'bg-slate-900 text-white hover:bg-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
