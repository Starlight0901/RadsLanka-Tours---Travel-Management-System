import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import {
  DEFAULT_HERO_BENEFITS,
  HERO_BENEFITS_MAX_ITEMS,
  HERO_BENEFITS_SPEED_DEFAULT,
  HERO_BENEFITS_SPEED_MAX,
  HERO_BENEFITS_SPEED_MIN,
  HERO_BENEFIT_DESCRIPTION_MAX,
  HERO_BENEFIT_TITLE_MAX,
  clampHeroBenefitsSpeed,
  isHeroBenefitIconId,
} from '@/config/heroBenefits.ts'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type HeroBenefit, type HeroBenefitsSettings } from '@/types/models.ts'

/** Stored in the siteSettings collection, which is already public-read and admin-write. */
export const HERO_BENEFITS_SETTINGS_DOCUMENT_ID = 'heroBenefits'

export type HeroBenefitRecord = HeroBenefit & { id: string }

export type HeroBenefitInput = {
  title: string
  description: string
  icon: string
  published: boolean
}

export type PublicHeroBenefit = {
  id: string
  title: string
  description: string
  icon: string
}

export type PublicHeroBenefits = {
  items: PublicHeroBenefit[]
  mobileAutoScrollSpeed: number
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function benefitsCollection() {
  return collection(requireDb(), FIRESTORE_COLLECTIONS.heroBenefits)
}

function settingsRef() {
  return doc(requireDb(), FIRESTORE_COLLECTIONS.siteSettings, HERO_BENEFITS_SETTINGS_DOCUMENT_ID)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toRecord(id: string, data: Record<string, unknown>): HeroBenefitRecord {
  return {
    id,
    title: readString(data.title),
    description: readString(data.description),
    icon: readString(data.icon),
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0,
    published: data.published === true,
    createdAt: data.createdAt as HeroBenefit['createdAt'],
    updatedAt: data.updatedAt as HeroBenefit['updatedAt'],
  }
}

function toSettings(data: Record<string, unknown> | undefined): HeroBenefitsSettings {
  return {
    mobileAutoScrollSpeed: clampHeroBenefitsSpeed(data?.mobileAutoScrollSpeed ?? HERO_BENEFITS_SPEED_DEFAULT),
    initialized: data?.initialized === true,
  }
}

function byOrder(a: HeroBenefitRecord, b: HeroBenefitRecord) {
  if (a.order !== b.order) {
    return a.order - b.order
  }
  return a.title.localeCompare(b.title)
}

function sanitize(input: HeroBenefitInput): HeroBenefitInput {
  const title = input.title.trim()
  const description = input.description.trim()
  const icon = input.icon.trim()

  if (!title) {
    throw new Error('Enter a heading.')
  }
  if (title.length > HERO_BENEFIT_TITLE_MAX) {
    throw new Error(`Keep the heading under ${HERO_BENEFIT_TITLE_MAX} characters.`)
  }
  if (!description) {
    throw new Error('Enter a short description.')
  }
  if (description.length > HERO_BENEFIT_DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${HERO_BENEFIT_DESCRIPTION_MAX} characters.`)
  }
  if (!isHeroBenefitIconId(icon)) {
    throw new Error('Choose an icon from the list.')
  }

  return { title, description, icon, published: input.published === true }
}

function publicItem(record: HeroBenefitRecord): PublicHeroBenefit {
  return { id: record.id, title: record.title, description: record.description, icon: record.icon }
}

function defaultPublicItems(): PublicHeroBenefit[] {
  return DEFAULT_HERO_BENEFITS.map((item, index) => ({ id: `default-${index}`, ...item }))
}

export function createDefaultPublicHeroBenefits(): PublicHeroBenefits {
  return { items: defaultPublicItems(), mobileAutoScrollSpeed: HERO_BENEFITS_SPEED_DEFAULT }
}

export async function getHeroBenefitsSettings(): Promise<HeroBenefitsSettings> {
  const snapshot = await getDoc(settingsRef())
  return toSettings(snapshot.exists() ? snapshot.data() : undefined)
}

export async function listAllHeroBenefits(): Promise<HeroBenefitRecord[]> {
  const snapshot = await getDocs(benefitsCollection())
  return snapshot.docs.map((item) => toRecord(item.id, item.data())).sort(byOrder)
}

async function listPublishedHeroBenefits(): Promise<HeroBenefitRecord[]> {
  const snapshot = await getDocs(query(benefitsCollection(), where('published', '==', true)))
  return snapshot.docs.map((item) => toRecord(item.id, item.data())).sort(byOrder)
}

/**
 * Public homepage read. Until an admin opens the CMS for the first time, the original six
 * benefits are shown. After that, only published Firestore items are shown.
 */
export async function getPublicHeroBenefits(): Promise<PublicHeroBenefits> {
  if (!db) {
    return createDefaultPublicHeroBenefits()
  }

  try {
    const settings = await getHeroBenefitsSettings()
    if (!settings.initialized) {
      return { items: defaultPublicItems(), mobileAutoScrollSpeed: settings.mobileAutoScrollSpeed }
    }

    const records = await listPublishedHeroBenefits()
    return {
      items: records
        .filter((record) => record.title.trim() && record.description.trim())
        .slice(0, HERO_BENEFITS_MAX_ITEMS)
        .map(publicItem),
      mobileAutoScrollSpeed: settings.mobileAutoScrollSpeed,
    }
  } catch {
    return createDefaultPublicHeroBenefits()
  }
}

/**
 * Seeds the six default benefits once. The settings document's `initialized` flag is set in the
 * same transaction, so concurrent admin sessions cannot seed twice, and later visits never
 * overwrite or re-add items, even if the admin deletes all of them.
 */
export async function ensureHeroBenefitsInitialized(): Promise<boolean> {
  const firestore = requireDb()
  const existing = await getDocs(benefitsCollection())
  const ref = settingsRef()

  return runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const settings = toSettings(snapshot.exists() ? snapshot.data() : undefined)
    if (settings.initialized) {
      return false
    }

    transaction.set(
      ref,
      { initialized: true, mobileAutoScrollSpeed: settings.mobileAutoScrollSpeed, updatedAt: serverTimestamp() },
      { merge: true },
    )
    if (!existing.empty) {
      return false
    }

    DEFAULT_HERO_BENEFITS.forEach((item, index) => {
      transaction.set(doc(benefitsCollection()), {
        ...item,
        order: index,
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
    return true
  })
}

export async function createHeroBenefit(input: HeroBenefitInput): Promise<string> {
  const item = sanitize(input)
  const existing = await listAllHeroBenefits()
  if (existing.length >= HERO_BENEFITS_MAX_ITEMS) {
    throw new Error(`You can have up to ${HERO_BENEFITS_MAX_ITEMS} benefits. Delete one to add another.`)
  }

  const order = existing.reduce((max, record) => Math.max(max, record.order), -1) + 1
  const ref = await addDoc(benefitsCollection(), {
    ...item,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateHeroBenefit(id: string, input: HeroBenefitInput): Promise<void> {
  const itemId = id.trim()
  if (!itemId) {
    throw new Error('A benefit id is required.')
  }

  await updateDoc(doc(benefitsCollection(), itemId), {
    ...sanitize(input),
    updatedAt: serverTimestamp(),
  })
}

export async function setHeroBenefitPublished(id: string, published: boolean): Promise<void> {
  await updateDoc(doc(benefitsCollection(), id), { published, updatedAt: serverTimestamp() })
}

/** Writes order = position for every id in one batch. */
export async function reorderHeroBenefits(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(requireDb())
  orderedIds.forEach((id, index) => {
    batch.update(doc(benefitsCollection(), id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export async function deleteHeroBenefit(id: string): Promise<void> {
  const itemId = id.trim()
  if (!itemId) {
    throw new Error('A benefit id is required.')
  }

  await deleteDoc(doc(benefitsCollection(), itemId))
}

export async function updateHeroBenefitsSpeed(speed: number): Promise<void> {
  if (!Number.isInteger(speed) || speed < HERO_BENEFITS_SPEED_MIN || speed > HERO_BENEFITS_SPEED_MAX) {
    throw new Error(`Choose a speed from ${HERO_BENEFITS_SPEED_MIN} to ${HERO_BENEFITS_SPEED_MAX}.`)
  }

  await setDoc(settingsRef(), { mobileAutoScrollSpeed: speed, updatedAt: serverTimestamp() }, { merge: true })
}
