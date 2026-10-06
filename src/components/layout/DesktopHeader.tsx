import { NavLink } from 'react-router-dom'
import { publicNavItems } from '@/components/layout/navigation.ts'
import { SiteLogo } from '@/components/layout/SiteLogo.tsx'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

export function DesktopHeader() {
  return (
    <div className="hidden h-20 items-center justify-between px-12 lg:flex">
      <SiteLogo />
      <nav className="flex items-center gap-6" aria-label="Main">
        {publicNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative py-2 text-[15px] font-semibold tracking-[0.15px] text-muted transition hover:text-brand',
                isActive && 'font-bold text-brand',
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {isActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-muted" /> : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <NavLink
        to={paths.inquiry}
        className="inline-flex min-h-10 items-center rounded-control bg-brand px-6 py-2.5 text-sm font-bold text-on-brand shadow-control"
      >
        Book Now
      </NavLink>
    </div>
  )
}
