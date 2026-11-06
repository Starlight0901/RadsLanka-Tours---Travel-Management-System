import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminNotifications } from '@/hooks/useAdminNotifications.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

function formatNotificationTime(value: { toDate?: () => Date } | undefined): string {
  if (!value || typeof value.toDate !== 'function') {
    return ''
  }

  try {
    return value.toDate().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

export function AdminNotificationBell() {
  const { notifications, unreadCount, markRead } = useAdminNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  async function openNotification(id: string, reviewId: string) {
    setOpen(false)
    await markRead(id)
    if (reviewId) {
      void navigate(paths.admin.review(reviewId))
    } else {
      void navigate(paths.admin.reviews)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are caught up'}
            </p>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-slate-50',
                      !item.read && 'bg-slate-50',
                    )}
                    onClick={() => void openNotification(item.id, item.reviewId)}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                      {!item.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" /> : null}
                    </span>
                    <span className="text-sm text-slate-600">{item.description}</span>
                    <span className="text-xs text-slate-400">{formatNotificationTime(item.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
