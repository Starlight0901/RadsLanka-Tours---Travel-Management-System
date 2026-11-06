import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { listPublishedDestinations } from '@/services/firebase/destinations.ts'
import {
  adminNotificationIdForReview,
  buildReviewNotificationWrite,
} from '@/services/firebase/notifications.ts'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type Review, type ReviewStatus } from '@/types/models.ts'
import type { CatalogReview } from '@/types/tours.ts'

export const REVIEW_NAME_MAX = 200
export const REVIEW_TEXT_MAX = 5000
export const REVIEW_TOUR_ID_MAX = 128
export const REVIEW_DESTINATION_ID_MAX = 128
export const REVIEW_DESTINATION_IDS_MAX = 12
export const REVIEW_RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const

export type ReviewRating = (typeof REVIEW_RATINGS)[number]

export type ReviewRecord = Review & { id: string }

export type PublicReviewInput = {
  reviewerName: string
  tourId: string
  destinationIds?: string[]
  rating: number
  reviewText: string
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function reviewsCollection() {
  return collection(requireDb(), FIRESTORE_COLLECTIONS.reviews)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const ids: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') {
      continue
    }
    const id = item.trim()
    if (!id || seen.has(id)) {
      continue
    }
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function readRating(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

export function isValidReviewRating(value: number): value is ReviewRating {
  return (REVIEW_RATINGS as readonly number[]).includes(value)
}

export function isPublicReview(review: Pick<ReviewRecord, 'status'>): boolean {
  return !review.status || review.status === 'approved'
}

function createdAtMillis(review: ReviewRecord): number {
  if (review.createdAt && typeof review.createdAt.toMillis === 'function') {
    return review.createdAt.toMillis()
  }

  return 0
}

function formatReviewDate(review: ReviewRecord): string {
  if (!review.createdAt || typeof review.createdAt.toDate !== 'function') {
    return ''
  }

  try {
    return review.createdAt.toDate().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function toReview(id: string, data: Record<string, unknown>): ReviewRecord {
  const reviewerName = readString(data.reviewerName).trim() || readString(data.travelerName).trim()
  const reviewText = readString(data.reviewText).trim() || readString(data.review).trim()
  const status = isReviewStatus(data.status) ? data.status : undefined

  return {
    id,
    reviewerName,
    tourId: readString(data.tourId).trim(),
    destinationIds: readStringList(data.destinationIds),
    rating: readRating(data.rating),
    reviewText,
    retained: data.retained === true,
    createdAt: data.createdAt as Review['createdAt'],
    updatedAt: data.updatedAt as Review['updatedAt'],
    ...(status ? { status } : {}),
    publishedAt: (data.publishedAt as Review['publishedAt']) ?? null,
    featured: data.featured === true,
    travelerName: readString(data.travelerName).trim() || undefined,
    email: readString(data.email).trim() || undefined,
    country: readString(data.country).trim() || undefined,
    review: readString(data.review).trim() || undefined,
    photo: data.photo && typeof data.photo === 'object' ? (data.photo as Review['photo']) : null,
    travelDate: readString(data.travelDate).trim() || undefined,
  }
}

function requireText(value: string, label: string, max: number): string {
  const text = value.trim()
  if (!text) {
    throw new Error(`Enter ${label}.`)
  }
  if (text.length > max) {
    throw new Error(`Keep ${label} under ${max} characters.`)
  }

  return text
}

function sanitizeDestinationIds(ids: string[] | undefined): string[] {
  const cleaned = readStringList(ids)
  if (cleaned.length > REVIEW_DESTINATION_IDS_MAX) {
    throw new Error(`Select up to ${REVIEW_DESTINATION_IDS_MAX} destinations.`)
  }

  for (const id of cleaned) {
    if (id.length > REVIEW_DESTINATION_ID_MAX) {
      throw new Error('A destination reference is invalid.')
    }
  }

  return cleaned
}

export function sanitizePublicReviewInput(input: PublicReviewInput): PublicReviewInput {
  const reviewerName = requireText(input.reviewerName, 'your name', REVIEW_NAME_MAX)
  const tourId = requireText(input.tourId, 'a tour', REVIEW_TOUR_ID_MAX)
  const reviewText = requireText(input.reviewText, 'your review', REVIEW_TEXT_MAX)

  if (!isValidReviewRating(input.rating)) {
    throw new Error('Choose a rating from 1 to 5 stars.')
  }

  return {
    reviewerName,
    tourId,
    destinationIds: sanitizeDestinationIds(input.destinationIds),
    rating: input.rating,
    reviewText,
  }
}

function byNewest(a: ReviewRecord, b: ReviewRecord): number {
  return createdAtMillis(b) - createdAtMillis(a)
}

export async function createPublicReview(input: PublicReviewInput): Promise<string> {
  const review = sanitizePublicReviewInput(input)
  const firestore = requireDb()
  const [tourSnapshot, publishedDestinations] = await Promise.all([
    getDoc(doc(firestore, FIRESTORE_COLLECTIONS.tours, review.tourId)),
    listPublishedDestinations().catch(() => []),
  ])
  if (!tourSnapshot.exists() || tourSnapshot.data().published !== true) {
    throw new Error('Select a published tour.')
  }

  const publishedDestinationIds = new Set(publishedDestinations.map((destination) => destination.id))
  const destinationIds = (review.destinationIds ?? []).filter((id) => publishedDestinationIds.has(id))

  const reviewRef = doc(reviewsCollection())
  const notificationRef = doc(
    firestore,
    FIRESTORE_COLLECTIONS.adminNotifications,
    adminNotificationIdForReview(reviewRef.id),
  )
  const batch = writeBatch(firestore)

  batch.set(reviewRef, {
    reviewerName: review.reviewerName,
    tourId: review.tourId,
    destinationIds,
    rating: review.rating,
    reviewText: review.reviewText,
    retained: false,
    status: 'approved',
    publishedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(notificationRef, buildReviewNotificationWrite(reviewRef.id, review.reviewerName))
  await batch.commit()

  return reviewRef.id
}

function mapPublicReviews(docs: QueryDocumentSnapshot[]): ReviewRecord[] {
  return docs
    .map((item) => toReview(item.id, item.data()))
    .filter(isPublicReview)
    .sort(byNewest)
}

export async function listPublicReviews(): Promise<ReviewRecord[]> {
  const snapshot = await getDocs(query(reviewsCollection(), where('status', '==', 'approved')))
  return mapPublicReviews(snapshot.docs)
}

export function subscribePublicReviews(
  onNext: (reviews: ReviewRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(reviewsCollection(), where('status', '==', 'approved')),
    (snapshot) => {
      onNext(mapPublicReviews(snapshot.docs))
    },
    (error) => {
      onError?.(error instanceof Error ? error : new Error('Unable to load reviews.'))
    },
  )
}

export function filterPublicReviewsForTour(reviews: ReviewRecord[], tourId: string): ReviewRecord[] {
  const id = tourId.trim()
  if (!id) {
    return []
  }

  return reviews.filter((review) => review.tourId === id)
}

export function filterPublicReviewsForDestination(reviews: ReviewRecord[], destinationId: string): ReviewRecord[] {
  const id = destinationId.trim()
  if (!id) {
    return []
  }

  const seen = new Set<string>()
  return reviews.filter((review) => {
    if (!review.destinationIds.includes(id) || seen.has(review.id)) {
      return false
    }
    seen.add(review.id)
    return true
  })
}

export async function listPublicReviewsForTour(tourId: string): Promise<ReviewRecord[]> {
  return filterPublicReviewsForTour(await listPublicReviews(), tourId)
}

export async function listPublicReviewsForDestination(destinationId: string): Promise<ReviewRecord[]> {
  return filterPublicReviewsForDestination(await listPublicReviews(), destinationId)
}

export async function listAllReviews(): Promise<ReviewRecord[]> {
  const snapshot = await getDocs(reviewsCollection())
  return snapshot.docs.map((item) => toReview(item.id, item.data())).sort(byNewest)
}

export async function keepReview(id: string): Promise<void> {
  const reviewId = id.trim()
  if (!reviewId) {
    throw new Error('A review id is required.')
  }

  const ref = doc(requireDb(), FIRESTORE_COLLECTIONS.reviews, reviewId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    throw new Error('This review could not be found.')
  }

  const current = toReview(snapshot.id, snapshot.data())
  const payload: Record<string, unknown> = {
    retained: true,
    updatedAt: serverTimestamp(),
  }

  if (current.status !== 'approved') {
    payload.status = 'approved'
    payload.publishedAt = serverTimestamp()
  }

  await updateDoc(ref, payload)
}

export async function deleteReview(id: string): Promise<void> {
  const reviewId = id.trim()
  if (!reviewId) {
    throw new Error('A review id is required.')
  }

  const firestore = requireDb()
  const batch = writeBatch(firestore)
  batch.delete(doc(firestore, FIRESTORE_COLLECTIONS.reviews, reviewId))
  batch.delete(doc(firestore, FIRESTORE_COLLECTIONS.adminNotifications, adminNotificationIdForReview(reviewId)))
  await batch.commit()
}

export type PublicReviewsSummary = {
  average: number
  count: number
}

export function publicReviewsSummary(reviews: ReviewRecord[]): PublicReviewsSummary | null {
  const publicReviews = reviews.filter(
    (review) => isPublicReview(review) && Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5,
  )
  if (publicReviews.length === 0) {
    return null
  }

  const total = publicReviews.reduce((sum, review) => sum + review.rating, 0)
  return {
    average: Math.round((total / publicReviews.length) * 100) / 100,
    count: publicReviews.length,
  }
}

export function averagePublicRating(reviews: ReviewRecord[]): number | null {
  return publicReviewsSummary(reviews)?.average ?? null
}

export function formatAverageRating(average: number): string {
  return average.toFixed(2)
}

export function reviewCountLabel(count: number): string {
  return count === 1 ? '1 review' : `${count} reviews`
}

export function toCatalogReview(
  review: ReviewRecord,
  names?: { tourTitle?: string; destinationNames?: string[] },
): CatalogReview {
  const destinationNames = names?.destinationNames?.filter(Boolean) ?? []
  return {
    id: review.id,
    tourId: review.tourId || undefined,
    destinationIds: review.destinationIds,
    travelerName: review.reviewerName,
    country: review.country,
    dateLabel: formatReviewDate(review),
    rating: review.rating,
    review: review.reviewText,
    tags: destinationNames,
    status: review.status ?? 'approved',
    published: isPublicReview(review),
    tourTitle: names?.tourTitle,
    destinationNames,
  }
}

export function resolveReviewNames(
  review: Pick<ReviewRecord, 'tourId' | 'destinationIds'>,
  tours: Array<{ id: string; title: string }>,
  destinations: Array<{ id: string; name: string }>,
): { tourTitle: string; destinationNames: string[] } {
  const tourTitle = tours.find((tour) => tour.id === review.tourId)?.title.trim() ?? ''
  const destinationNames = review.destinationIds.flatMap((id) => {
    const name = destinations.find((destination) => destination.id === id)?.name.trim()
    return name ? [name] : []
  })
  return { tourTitle, destinationNames }
}
