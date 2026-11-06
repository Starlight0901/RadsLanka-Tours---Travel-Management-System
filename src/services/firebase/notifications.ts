import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import {
  FIRESTORE_COLLECTIONS,
  type AdminNotification,
  type AdminNotificationType,
} from '@/types/models.ts'

export const REVIEW_NOTIFICATION_TITLE = 'New Review Submitted'
export const REVIEW_NOTIFICATION_TYPE: AdminNotificationType = 'review'

export type AdminNotificationRecord = AdminNotification & { id: string }

export type ReviewNotificationWrite = {
  title: typeof REVIEW_NOTIFICATION_TITLE
  description: string
  reviewId: string
  type: typeof REVIEW_NOTIFICATION_TYPE
  read: false
  createdAt: ReturnType<typeof serverTimestamp>
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function adminNotificationIdForReview(reviewId: string): string {
  return `review_${reviewId.trim()}`
}

export function reviewNotificationDescription(reviewerName: string): string {
  return `${reviewerName.trim()} submitted a new review.`
}

export function buildReviewNotificationWrite(reviewId: string, reviewerName: string): ReviewNotificationWrite {
  return {
    title: REVIEW_NOTIFICATION_TITLE,
    description: reviewNotificationDescription(reviewerName),
    reviewId: reviewId.trim(),
    type: REVIEW_NOTIFICATION_TYPE,
    read: false,
    createdAt: serverTimestamp(),
  }
}

function toNotification(id: string, data: Record<string, unknown>): AdminNotificationRecord {
  return {
    id,
    title: readString(data.title) || REVIEW_NOTIFICATION_TITLE,
    description: readString(data.description),
    reviewId: readString(data.reviewId),
    type: REVIEW_NOTIFICATION_TYPE,
    read: data.read === true,
    createdAt: data.createdAt as AdminNotification['createdAt'],
  }
}

function byCreatedAtDesc(a: AdminNotificationRecord, b: AdminNotificationRecord): number {
  const aTime = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0
  const bTime = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0
  return bTime - aTime
}

export function subscribeAdminNotifications(
  onNext: (items: AdminNotificationRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const firestore = requireDb()
  return onSnapshot(
    query(collection(firestore, FIRESTORE_COLLECTIONS.adminNotifications), orderBy('createdAt', 'desc')),
    (snapshot) => {
      onNext(snapshot.docs.map((item) => toNotification(item.id, item.data())).sort(byCreatedAtDesc))
    },
    (error) => {
      onError?.(error instanceof Error ? error : new Error('Unable to load admin notifications.'))
    },
  )
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  const notificationId = id.trim()
  if (!notificationId) {
    throw new Error('A notification id is required.')
  }

  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.adminNotifications, notificationId), {
    read: true,
  })
}

export function unreadAdminNotificationCount(items: AdminNotificationRecord[]): number {
  return items.reduce((count, item) => count + (item.read ? 0 : 1), 0)
}
