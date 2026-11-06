import { useContext } from 'react'
import {
  AdminNotificationsContext,
  type AdminNotificationsContextValue,
} from '@/contexts/admin-notifications-context.ts'

export function useAdminNotifications(): AdminNotificationsContextValue {
  const context = useContext(AdminNotificationsContext)
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationsProvider')
  }

  return context
}
