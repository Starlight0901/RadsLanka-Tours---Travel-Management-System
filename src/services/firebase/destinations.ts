import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  DESTINATION_EXPERIENCES_MAX_ITEMS,
  DESTINATION_EXPERIENCE_DESCRIPTION_MAX,
  DESTINATION_EXPERIENCE_TITLE_MAX,
  DESTINATION_HIGHLIGHT_DETAIL_MAX,
  DESTINATION_HIGHLIGHT_TITLE_MAX,
  DESTINATION_HIGHLIGHTS_MAX_ITEMS,
  DESTINATION_IDEAL_FOR_LABEL_MAX,
  DESTINATION_IDEAL_FOR_MAX_ITEMS,
  DESTINATION_OTHER_CHARACTERISTIC_MAX,
  DESTINATION_OVERVIEW_DESCRIPTION_MAX,
  DESTINATION_OVERVIEW_TITLE_MAX,
  DESTINATION_SHORT_DESCRIPTION_MAX,
  DESTINATION_SUBTITLE_MAX,
  DESTINATION_CHARACTERISTICS,
  OTHER_CHARACTERISTIC_ID,
  STAY_VALUE_MAX,
  districtBelongsToProvince,
  essenceThemesInSavedOrder,
  findDistrict,
  findProvince,
  isCountedStayUnit,
  isDestinationHighlightIconId,
  isMonth,
  isStayUnit,
  uniqueOptionLabels,
} from '@/config/destinationContent.ts'
import {
  FIRESTORE_COLLECTIONS,
  type Destination,
  type DestinationExperienceItem,
  type DestinationGlanceDetails,
  type DestinationHighlightItem,
  type DestinationMonthRange,
  type DestinationStay,
  type MediaAsset,
} from '@/types/models.ts'
import { db } from '@/services/firebase/firestore.ts'
import {
  associatedGalleryKeys,
  exceedsGalleryLimit,
  galleryLimitMessage,
} from '@/utils/galleryLimits.ts'
import { slugify } from '@/utils/slugify.ts'

export type DestinationRecord = Destination & { id: string }

/** Fields managed by the admin destination form. Other stored fields are never overwritten. */
export type DestinationInput = {
  name: string
  subtitle: string
  description: string
  coverImage: MediaAsset | null
  glance: DestinationGlanceDetails
  essenceThemes: string[]
  overviewTitle: string
  overviewDescription: string
  keyHighlights: DestinationHighlightItem[]
  experiences: DestinationExperienceItem[]
  gallery: MediaAsset[]
  featured: boolean
  popular: boolean
  published: boolean
  availableForInquiry: boolean
}

const NAME_MAX = 80
const ALT_TEXT_MAX = 300

export const EMPTY_DESTINATION_GLANCE: DestinationGlanceDetails = {
  bestTimeMonths: null,
  province: '',
  district: '',
  recommendedStay: null,
  characteristics: [],
  characteristicOther: '',
  idealFor: [],
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function readMediaAsset(value: unknown): MediaAsset | null {
  const data = toRecord(value)
  const imageUrl = readString(data.imageUrl)
  if (!imageUrl) {
    return null
  }
  const caption = readString(data.caption)
  return {
    imageUrl,
    publicId: readString(data.publicId),
    altText: readString(data.altText),
    ...(caption ? { caption } : {}),
  }
}

function readMonthRange(value: unknown): DestinationMonthRange | null {
  const data = toRecord(value)
  return isMonth(data.startMonth) && isMonth(data.endMonth)
    ? { startMonth: data.startMonth, endMonth: data.endMonth }
    : null
}

function readStay(value: unknown): DestinationStay | null {
  const data = toRecord(value)
  if (!isStayUnit(data.unit)) {
    return null
  }
  if (!isCountedStayUnit(data.unit)) {
    return { unit: data.unit, value: null }
  }
  const count = typeof data.value === 'number' && Number.isInteger(data.value) ? data.value : 1
  return { unit: data.unit, value: Math.min(Math.max(count, 1), STAY_VALUE_MAX) }
}

function readGlance(value: unknown): DestinationGlanceDetails {
  const data = toRecord(value)
  return {
    bestTimeMonths: readMonthRange(data.bestTimeMonths),
    province: readString(data.province),
    district: readString(data.district),
    recommendedStay: readStay(data.recommendedStay),
    characteristics: readStringList(data.characteristics),
    characteristicOther: readString(data.characteristicOther),
    idealFor: readStringList(data.idealFor),
  }
}

function readExperiences(value: unknown): DestinationExperienceItem[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item, index) => {
    const data = toRecord(item)
    return {
      id: readString(data.id) || `experience-${index + 1}`,
      title: readString(data.title),
      description: readString(data.description),
      image: readMediaAsset(data.image),
      published: data.published !== false,
    }
  })
}

function readMediaAssetList(value: unknown): MediaAsset[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item) => {
    const asset = readMediaAsset(item)
    return asset ? [asset] : []
  })
}

function readHighlights(value: unknown): DestinationHighlightItem[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item, index) => {
    const data = toRecord(item)
    return {
      id: readString(data.id) || `highlight-${index + 1}`,
      title: readString(data.title),
      detail: readString(data.detail),
      icon: readString(data.icon),
      published: data.published !== false,
    }
  })
}

function toDestination(id: string, data: Record<string, unknown>): DestinationRecord {
  return {
    id,
    name: readString(data.name),
    slug: readString(data.slug),
    subtitle: readString(data.subtitle),
    description: readString(data.description),
    coverImage: readMediaAsset(data.coverImage),
    glance: readGlance(data.glance),
    essenceThemes: readStringList(data.essenceThemes),
    overviewTitle: readString(data.overviewTitle),
    overviewDescription: readString(data.overviewDescription),
    keyHighlights: readHighlights(data.keyHighlights),
    experiences: readExperiences(data.experiences),
    thingsToDo: readStringList(data.thingsToDo),
    placesToVisit: readStringList(data.placesToVisit),
    bestTime: readString(data.bestTime),
    travelInfo: readString(data.travelInfo),
    gallery: readMediaAssetList(data.gallery),
    relatedTours: readStringList(data.relatedTours),
    featured: data.featured === true,
    popular: data.popular === true,
    published: data.published === true,
    availableForInquiry: data.availableForInquiry === true,
    createdAt: data.createdAt as Destination['createdAt'],
    updatedAt: data.updatedAt as Destination['updatedAt'],
  }
}

function normalizeMultiline(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim()
}

function singleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function requireMaxLength(value: string, max: number, label: string): string {
  if (value.length > max) {
    throw new Error(`Keep the ${label} under ${max} characters.`)
  }
  return value
}

function sanitizeCoverImage(value: MediaAsset | null, name: string, label = 'hero image'): MediaAsset | null {
  if (!value) {
    return null
  }
  const imageUrl = value.imageUrl.trim()
  const publicId = value.publicId.trim()
  let url: URL
  try {
    url = new URL(imageUrl)
  } catch {
    throw new Error(`The ${label} URL is not valid. Upload the image again.`)
  }
  if (url.protocol !== 'https:') {
    throw new Error(`The ${label} is not valid. Upload the image again.`)
  }
  const altText = requireMaxLength(singleLine(value.altText) || name, ALT_TEXT_MAX, `${label} description`)
  const caption = value.caption?.trim()
  return { imageUrl, publicId, altText, ...(caption ? { caption } : {}) }
}

function sanitizeGlance(value: DestinationGlanceDetails): DestinationGlanceDetails {
  const range = value.bestTimeMonths
  const bestTimeMonths =
    range && isMonth(range.startMonth) && isMonth(range.endMonth)
      ? { startMonth: range.startMonth, endMonth: range.endMonth }
      : null

  let province = findProvince(value.province) ? value.province : ''
  let district = findDistrict(value.district) ? value.district : ''
  if (district && !province) {
    province = findDistrict(district)?.province.id ?? ''
  }
  if (district && !districtBelongsToProvince(district, province)) {
    district = ''
  }

  let recommendedStay: DestinationStay | null = null
  if (value.recommendedStay && isStayUnit(value.recommendedStay.unit)) {
    const { unit } = value.recommendedStay
    if (isCountedStayUnit(unit)) {
      const count = value.recommendedStay.value
      if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > STAY_VALUE_MAX) {
        throw new Error(`Choose a recommended stay between 1 and ${STAY_VALUE_MAX}.`)
      }
      recommendedStay = { unit, value: count }
    } else {
      recommendedStay = { unit, value: null }
    }
  }

  const characteristics = DESTINATION_CHARACTERISTICS.map((item) => item.id).filter((id) =>
    value.characteristics.includes(id),
  )
  const characteristicOther = characteristics.includes(OTHER_CHARACTERISTIC_ID)
    ? requireMaxLength(singleLine(value.characteristicOther), DESTINATION_OTHER_CHARACTERISTIC_MAX, 'custom characteristic')
    : ''

  const idealFor = uniqueOptionLabels(value.idealFor)
  if (idealFor.length > DESTINATION_IDEAL_FOR_MAX_ITEMS) {
    throw new Error(`Choose up to ${DESTINATION_IDEAL_FOR_MAX_ITEMS} “Ideal for” options.`)
  }
  idealFor.forEach((label) => requireMaxLength(label, DESTINATION_IDEAL_FOR_LABEL_MAX, '“Ideal for” option'))

  return { bestTimeMonths, province, district, recommendedStay, characteristics, characteristicOther, idealFor }
}

function sanitizeHighlights(items: DestinationHighlightItem[]): DestinationHighlightItem[] {
  const cleaned = items
    .map((item) => ({
      id: item.id.trim(),
      title: singleLine(item.title),
      detail: singleLine(item.detail),
      icon: isDestinationHighlightIconId(item.icon) ? item.icon : '',
      published: item.published === true,
    }))
    .filter((item) => item.title || item.detail)

  if (cleaned.length > DESTINATION_HIGHLIGHTS_MAX_ITEMS) {
    throw new Error(`Add up to ${DESTINATION_HIGHLIGHTS_MAX_ITEMS} highlights.`)
  }

  const ids = new Set<string>()
  return cleaned.map((item, index) => {
    if (item.published && !item.title) {
      throw new Error(`Highlight ${index + 1} needs a title before it can be published.`)
    }
    requireMaxLength(item.title, DESTINATION_HIGHLIGHT_TITLE_MAX, 'highlight title')
    requireMaxLength(item.detail, DESTINATION_HIGHLIGHT_DETAIL_MAX, 'highlight detail')
    let id = item.id || `highlight-${index + 1}`
    while (ids.has(id)) {
      id = `${id}-${index + 1}`
    }
    ids.add(id)
    return { ...item, id }
  })
}

function sanitizeExperiences(items: DestinationExperienceItem[]): DestinationExperienceItem[] {
  const cleaned = items.map((item) => ({
    id: item.id.trim(),
    title: singleLine(item.title),
    description: normalizeMultiline(item.description),
    image: item.image ? sanitizeCoverImage(item.image, item.title || 'Destination experience') : null,
    published: item.published === true,
  }))

  if (cleaned.length > DESTINATION_EXPERIENCES_MAX_ITEMS) {
    throw new Error(`Add up to ${DESTINATION_EXPERIENCES_MAX_ITEMS} experiences.`)
  }

  const ids = new Set<string>()
  return cleaned
    .filter((item) => item.title || item.description || item.image)
    .map((item, index) => {
      if (item.published && !item.title) {
        throw new Error(`Experience ${index + 1} needs a title before it can be published.`)
      }
      if (item.published && !item.image) {
        throw new Error(`Experience ${index + 1} needs an image before it can be published.`)
      }
      requireMaxLength(item.title, DESTINATION_EXPERIENCE_TITLE_MAX, 'experience title')
      requireMaxLength(item.description, DESTINATION_EXPERIENCE_DESCRIPTION_MAX, 'experience description')
      let id = item.id || `experience-${index + 1}`
      while (ids.has(id)) {
        id = `${id}-${index + 1}`
      }
      ids.add(id)
      return { ...item, id }
    })
}

function sanitizeGallery(items: MediaAsset[], name: string): MediaAsset[] {
  return items.map((item, index) => {
    const stored = sanitizeCoverImage(item, name, `gallery image ${index + 1}`)
    if (!stored) {
      throw new Error(`Gallery image ${index + 1} needs an uploaded file.`)
    }
    const title = singleLine(stored.caption || stored.altText || '')
    if (!title) {
      throw new Error(`Enter a title for gallery image ${index + 1}.`)
    }
    return { ...stored, altText: stored.altText || title, caption: stored.caption || title }
  })
}

async function galleryAssociationRecords() {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.gallery))
  return snapshot.docs.map((item) => {
    const data = item.data()
    return {
      id: item.id,
      publicId: typeof data.publicId === 'string' ? data.publicId : '',
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
      destinationId: typeof data.destinationId === 'string' ? data.destinationId : '',
    }
  })
}

async function assertDestinationGalleryLimit(
  destinationId: string | undefined,
  nextGallery: MediaAsset[],
  previousGallery: MediaAsset[],
) {
  const records = destinationId ? await galleryAssociationRecords() : []
  const previousCount = associatedGalleryKeys({
    embedded: previousGallery,
    records,
    destinationId,
  }).size
  const nextCount = associatedGalleryKeys({
    embedded: nextGallery,
    records,
    destinationId,
  }).size
  if (exceedsGalleryLimit(nextCount, previousCount)) {
    throw new Error(galleryLimitMessage('destination'))
  }
}

function sanitizeDestination(input: DestinationInput) {
  const name = singleLine(input.name)
  if (!name) {
    throw new Error('Enter a destination title.')
  }
  requireMaxLength(name, NAME_MAX, 'destination title')
  const slug = slugify(name)
  if (!slug) {
    throw new Error('Enter a title that can become a valid slug.')
  }

  const essenceThemes = essenceThemesInSavedOrder(input.essenceThemes).map((theme) => theme.id)

  return {
    name,
    slug,
    subtitle: requireMaxLength(singleLine(input.subtitle), DESTINATION_SUBTITLE_MAX, 'subtitle'),
    description: requireMaxLength(
      normalizeMultiline(input.description),
      DESTINATION_SHORT_DESCRIPTION_MAX,
      'short description',
    ),
    coverImage: sanitizeCoverImage(input.coverImage, name),
    glance: sanitizeGlance(input.glance),
    essenceThemes,
    overviewTitle: requireMaxLength(singleLine(input.overviewTitle), DESTINATION_OVERVIEW_TITLE_MAX, 'overview title'),
    overviewDescription: requireMaxLength(
      normalizeMultiline(input.overviewDescription),
      DESTINATION_OVERVIEW_DESCRIPTION_MAX,
      'overview description',
    ),
    keyHighlights: sanitizeHighlights(input.keyHighlights),
    experiences: sanitizeExperiences(input.experiences),
    gallery: sanitizeGallery(input.gallery, name),
    featured: input.featured === true,
    popular: input.popular === true,
    published: input.published === true,
    availableForInquiry: input.availableForInquiry === true,
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

async function assertUniqueSlug(slug: string, ignoreId?: string) {
  const snapshot = await getDocs(
    query(collection(requireDb(), FIRESTORE_COLLECTIONS.destinations), where('slug', '==', slug)),
  )
  if (snapshot.docs.some((item) => item.id !== ignoreId)) {
    throw new Error('Another destination already uses this title. Choose a different title.')
  }
}

export async function listInquiryDestinations(): Promise<DestinationRecord[]> {
  if (!db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, FIRESTORE_COLLECTIONS.destinations),
      where('availableForInquiry', '==', true),
    ),
  )

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listAllDestinations(): Promise<DestinationRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.destinations))

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listPublishedDestinations(): Promise<DestinationRecord[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), FIRESTORE_COLLECTIONS.destinations), where('published', '==', true)),
  )

  return snapshot.docs
    .map((item) => toDestination(item.id, item.data()))
    .filter((destination) => destination.published)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listPublishedFeaturedDestinations(): Promise<DestinationRecord[]> {
  return (await listPublishedDestinations()).filter((destination) => destination.featured)
}

export async function getPublishedDestinationBySlug(slug: string): Promise<DestinationRecord | null> {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), FIRESTORE_COLLECTIONS.destinations),
      where('published', '==', true),
      where('slug', '==', slug),
      limit(1),
    ),
  )
  const match = snapshot.docs[0]
  return match ? toDestination(match.id, match.data()) : null
}

export async function createDestination(input: DestinationInput): Promise<string> {
  const destination = sanitizeDestination(input)
  if (!destination.coverImage) {
    throw new Error('Upload a hero image before saving a new destination.')
  }
  await assertUniqueSlug(destination.slug)
  await assertDestinationGalleryLimit(undefined, destination.gallery, [])

  const ref = await addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.destinations), {
    ...destination,
    thingsToDo: [],
    placesToVisit: [],
    bestTime: '',
    travelInfo: '',
    relatedTours: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

/** Updates form-managed fields. Places, travel notes, and related tours are left untouched. */
export async function updateDestination(id: string, input: DestinationInput): Promise<void> {
  const destinationId = id.trim()
  if (!destinationId) {
    throw new Error('A destination id is required.')
  }

  const destination = sanitizeDestination(input)
  await assertUniqueSlug(destination.slug, destinationId)

  const existing = await getDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.destinations, destinationId))
  if (!existing.exists()) {
    throw new Error('This destination could not be found.')
  }
  await assertDestinationGalleryLimit(
    destinationId,
    destination.gallery,
    readMediaAssetList(existing.data().gallery),
  )

  await updateDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.destinations, destinationId), {
    ...destination,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteDestination(id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.destinations, id))
}
