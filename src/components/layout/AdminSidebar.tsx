import {
  CircleHelp,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Settings,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { siteConfig } from '@/config/site.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const items = [
  { to: paths.admin.root, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.admin.tours, label: 'Tours', icon: Map },
  { to: paths.admin.destinations, label: 'Destinations', icon: MapPin },
  { to: paths.admin.about, label: 'About Us', icon: Users },
  { to: paths.admin.whyTravelers, label: 'Why Travelers', icon: Sparkles },
  { to: paths.admin.contactFaqs, label: 'Contact FAQs', icon: CircleHelp },
  { to: paths.admin.reviews, label: 'Reviews', icon: Star },
  { to: paths.admin.gallery, label: 'Gallery', icon: Image },
  { to: paths.admin.inquiries, label: 'Inquiries', icon: Inbox },
  { to: paths.admin.settings, label: 'Settings', icon: Settings },
]

type AdminSidebarProps = {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { signOut } = useAuth()

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close admin menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        id="admin-nav"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:max-w-none lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
      <div className="border-b border-slate-200 px-5 py-5">
        <img src={siteConfig.logo.src} alt={siteConfig.logo.alt} className="h-16 w-auto object-contain object-left" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
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
    </>
  )
}
