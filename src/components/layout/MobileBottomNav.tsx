import { NavLink } from 'react-router-dom'
import { mobileBottomNavItems } from '@/components/layout/navigation.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-mist/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden"
      aria-label="Primary mobile"
    >
      <ul className="mx-auto flex h-16 max-w-content items-stretch justify-around px-1">
        {mobileBottomNavItems.map((item) => (
          <li key={item.to} className="min-w-0 flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex h-14 w-full flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[10px] leading-tight text-muted sm:text-[11px]',
                  isActive && 'font-bold text-brand',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={cn('text-[18px]', isActive ? 'text-brand' : 'text-muted')} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
