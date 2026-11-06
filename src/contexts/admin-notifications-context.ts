import { createContext } from 'react'
import type { AdminNotificationRecord } from '@/services/firebase/notifications.ts'

export type AdminNotificationsContextValue = {
  notifications: AdminNotificationRecord[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markReviewNotificationRead: (reviewId: string) => Promise<void>
}

export const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null)
