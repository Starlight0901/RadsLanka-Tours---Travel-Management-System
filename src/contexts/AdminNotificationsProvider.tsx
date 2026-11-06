import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  AdminNotificationsContext,
  type AdminNotificationsContextValue,
} from '@/contexts/admin-notifications-context.ts'
import {
  adminNotificationIdForReview,
  markAdminNotificationRead,
  subscribeAdminNotifications,
  unreadAdminNotificationCount,
  type AdminNotificationRecord,
} from '@/services/firebase/notifications.ts'

type AdminNotificationsProviderProps = {
  children: ReactNode
}

export function AdminNotificationsProvider({ children }: AdminNotificationsProviderProps) {
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    const unsubscribe = subscribeAdminNotifications(
      (items) => {
        setNotifications(items)
        setLoading(false)
      },
      () => {
        setNotifications([])
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const markRead = useCallback(async (id: string) => {
    const notificationId = id.trim()
    if (!notificationId) {
      return
    }

    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    )

    try {
      await markAdminNotificationRead(notificationId)
    } catch {
      // Older reviews may not have a notification document.
    }
  }, [])

  const markReviewNotificationRead = useCallback(
    async (reviewId: string) => {
      await markRead(adminNotificationIdForReview(reviewId))
    },
    [markRead],
  )

  const value = useMemo<AdminNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: unreadAdminNotificationCount(notifications),
      loading,
      markRead,
      markReviewNotificationRead,
    }),
    [loading, markRead, markReviewNotificationRead, notifications],
  )

  return <AdminNotificationsContext.Provider value={value}>{children}</AdminNotificationsContext.Provider>
}
