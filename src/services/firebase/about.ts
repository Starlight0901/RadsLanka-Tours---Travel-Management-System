import {
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
  ABOUT_APPROACHES_SUBCOLLECTION,
  ABOUT_APPROACH_DESCRIPTION_MAX,
  ABOUT_APPROACH_TITLE_MAX,
  ABOUT_CATCHPHRASE_DEFAULT,
  ABOUT_CATCHPHRASE_MAX,
  ABOUT_DEFAULT_HERO_IMAGE_URL,
  ABOUT_DEFAULT_ORIGINS_IMAGE_URL,
  ABOUT_DISTINCTION_DESCRIPTION_DEFAULT,
  ABOUT_DISTINCTION_DESCRIPTION_MAX,
  ABOUT_FACTS_MAX,
  ABOUT_FACT_DESCRIPTION_MAX,
  ABOUT_FACT_TITLE_MAX,
  ABOUT_HERO_DESCRIPTION_MAX,
  ABOUT_HERO_TITLE_DEFAULT,
  ABOUT_HERO_TITLE_MAX,
  ABOUT_JOURNEY_BASELINE_MAX,
  ABOUT_ORIGINS_DESCRIPTION_DEFAULT,
  ABOUT_ORIGINS_DESCRIPTION_MAX,
  ABOUT_ORIGINS_TITLE_DEFAULT,
  ABOUT_ORIGINS_TITLE_MAX,
  ABOUT_OWNERSHIP_LABEL,
  ABOUT_OWNERSHIP_VALUE,
  ABOUT_SETTINGS_DOCUMENT_ID,
  ABOUT_TEAM_DESCRIPTION_MAX,
  ABOUT_TEAM_DESIGNATION_MAX,
  ABOUT_TEAM_NAME_MAX,
  ABOUT_TEAM_SUBCOLLECTION,
  DEFAULT_ABOUT_APPROACHES,
  DEFAULT_DISTINCTION_FACTS,
  countWithoutNewlines,
  displayedJourneyTotal,
  isAboutDistinctionIconId,
  normalizeMultiline,
} from '@/config/aboutContent.ts'
import { db } from '@/services/firebase/firestore.ts'
import {
  FIRESTORE_COLLECTIONS,
  type AboutApproach,
  type AboutDistinctionFact,
  type AboutPageSettings,
  type AboutTeamMember,
  type MediaAsset,
} from '@/types/models.ts'

export type AboutSettingsRecord = {
  heroTitle: string
  heroDescription: string
  heroImage: MediaAsset | null
  distinctionCatchphrase: string
  distinctionDescription: string
  distinctionFacts: AboutDistinctionFact[]
  distinctionFactsConfigured: boolean
  originsPublished: boolean
  originsImage: MediaAsset | null
  originsTitle: string
  originsDescription: string
  journeyBaseline: number
  approachesInitialized: boolean
  createdAt: AboutPageSettings['createdAt'] | undefined
  updatedAt: AboutPageSettings['updatedAt'] | undefined
}

export type AboutHeroInput = {
  title: string
  description: string
  image: MediaAsset | null
}

export type AboutDistinctionInput = {
  catchphrase: string
  description: string
  facts: AboutDistinctionFact[]
}

export type AboutOriginsInput = {
  published: boolean
  image: MediaAsset | null
  title: string
  description: string
  journeyBaseline: number
}

export type AboutTeamMemberRecord = AboutTeamMember & { id: string }

export type AboutTeamMemberInput = {
  name: string
  image: MediaAsset | null
  designation: string
  description: string
  published: boolean
}

export type AboutApproachRecord = AboutApproach & { id: string }

export type AboutApproachInput = {
  title: string
  description: string
}

export type PublicAboutHero = {
  title: string
  description: string
  imageUrl: string
}

export type PublicAboutDistinction = {
  catchphrase: string
  description: string
  facts: AboutDistinctionFact[]
}

export type PublicAboutOrigins = {
  published: boolean
  title: string
  description: string
  imageUrl: string
  journeyCount: number
  ownershipValue: typeof ABOUT_OWNERSHIP_VALUE
  ownershipLabel: typeof ABOUT_OWNERSHIP_LABEL
}

export type PublicAboutTeamMember = {
  id: string
  name: string
  imageUrl: string
  designation: string
  description: string
}

export type PublicAboutApproach = {
  id: string
  order: number
  title: string
  description: string
}

export type PublicAboutPage = {
  hero: PublicAboutHero
  distinction: PublicAboutDistinction
  origins: PublicAboutOrigins
  team: PublicAboutTeamMember[]
  approaches: PublicAboutApproach[]
  teamLoaded: boolean
  approachesLoaded: boolean
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

function settingsRef() {
  return doc(requireDb(), FIRESTORE_COLLECTIONS.siteSettings, ABOUT_SETTINGS_DOCUMENT_ID)
}

function teamCollection() {
  return collection(settingsRef(), ABOUT_TEAM_SUBCOLLECTION)
}

function approachesCollection() {
  return collection(settingsRef(), ABOUT_APPROACHES_SUBCOLLECTION)
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readBaseline(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }
  return 0
}

function toMediaAsset(value: unknown): MediaAsset | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  if (typeof record.imageUrl !== 'string' || !record.imageUrl.trim()) {
    return null
  }

  return {
    imageUrl: record.imageUrl,
    publicId: typeof record.publicId === 'string' ? record.publicId : '',
    altText: typeof record.altText === 'string' ? record.altText : '',
    ...(typeof record.caption === 'string' ? { caption: record.caption } : {}),
  }
}

function toFact(value: unknown, index: number): AboutDistinctionFact | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const title = readString(record.title).trim()
  const description = readString(record.description).trim()
  if (!title && !description) {
    return null
  }

  const id = readString(record.id).trim() || `fact-${index + 1}`
  const icon = readString(record.icon).trim()

  return {
    id,
    icon: isAboutDistinctionIconId(icon) ? icon : icon || 'schedule',
    title,
    description,
  }
}

function toFacts(value: unknown): AboutDistinctionFact[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => toFact(item, index))
    .filter((item): item is AboutDistinctionFact => item !== null)
    .slice(0, ABOUT_FACTS_MAX)
}

function emptySettings(): AboutSettingsRecord {
  return {
    heroTitle: '',
    heroDescription: '',
    heroImage: null,
    distinctionCatchphrase: '',
    distinctionDescription: '',
    distinctionFacts: [],
    distinctionFactsConfigured: false,
    originsPublished: true,
    originsImage: null,
    originsTitle: '',
    originsDescription: '',
    journeyBaseline: 0,
    approachesInitialized: false,
    createdAt: undefined,
    updatedAt: undefined,
  }
}

function toSettings(data: Record<string, unknown> | undefined): AboutSettingsRecord {
  if (!data) {
    return emptySettings()
  }

  return {
    heroTitle: readString(data.heroTitle),
    heroDescription: readString(data.heroDescription),
    heroImage: toMediaAsset(data.heroImage),
    distinctionCatchphrase: readString(data.distinctionCatchphrase),
    distinctionDescription: readString(data.distinctionDescription),
    distinctionFacts: toFacts(data.distinctionFacts),
    distinctionFactsConfigured: data.distinctionFactsConfigured === true,
    originsPublished: readBoolean(data.originsPublished, true),
    originsImage: toMediaAsset(data.originsImage),
    originsTitle: readString(data.originsTitle),
    originsDescription: readString(data.originsDescription),
    journeyBaseline: readBaseline(data.journeyBaseline),
    approachesInitialized: data.approachesInitialized === true,
    createdAt: data.createdAt as AboutPageSettings['createdAt'] | undefined,
    updatedAt: data.updatedAt as AboutPageSettings['updatedAt'] | undefined,
  }
}

function toTeamMember(id: string, data: Record<string, unknown>): AboutTeamMemberRecord {
  return {
    id,
    name: readString(data.name),
    image: toMediaAsset(data.image),
    designation: readString(data.designation),
    description: readString(data.description),
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0,
    published: data.published === true,
    createdAt: data.createdAt as AboutTeamMember['createdAt'],
    updatedAt: data.updatedAt as AboutTeamMember['updatedAt'],
  }
}

function toApproach(id: string, data: Record<string, unknown>): AboutApproachRecord {
  return {
    id,
    title: readString(data.title),
    description: readString(data.description),
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 0,
    deleted: data.deleted === true,
    createdAt: data.createdAt as AboutApproach['createdAt'],
    updatedAt: data.updatedAt as AboutApproach['updatedAt'],
  }
}

function byOrder<T extends { order: number; title?: string; name?: string }>(a: T, b: T) {
  if (a.order !== b.order) {
    return a.order - b.order
  }
  return (a.name ?? a.title ?? '').localeCompare(b.name ?? b.title ?? '')
}

function createDocumentId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function requireId(id: string, label: string): string {
  const value = id.trim()
  if (!value) {
    throw new Error(`${label} is required.`)
  }
  return value
}

async function mergeSettings(payload: Record<string, unknown>): Promise<void> {
  const ref = settingsRef()
  const snapshot = await getDoc(ref)
  await setDoc(
    ref,
    {
      ...payload,
      ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getAboutSettings(): Promise<AboutSettingsRecord> {
  const snapshot = await getDoc(settingsRef())
  return toSettings(snapshot.exists() ? snapshot.data() : undefined)
}

export function resolvePublicAboutHero(settings: AboutSettingsRecord): PublicAboutHero {
  const description = settings.heroDescription.trim()
  return {
    title: settings.heroTitle.trim() || ABOUT_HERO_TITLE_DEFAULT,
    description,
    imageUrl: settings.heroImage?.imageUrl.trim() || ABOUT_DEFAULT_HERO_IMAGE_URL,
  }
}

export function resolvePublicAboutDistinction(settings: AboutSettingsRecord): PublicAboutDistinction {
  const facts = settings.distinctionFactsConfigured
    ? settings.distinctionFacts.filter((fact) => fact.title.trim() && fact.description.trim())
    : DEFAULT_DISTINCTION_FACTS.map((fact) => ({ ...fact }))

  return {
    catchphrase: settings.distinctionCatchphrase.trim() || ABOUT_CATCHPHRASE_DEFAULT,
    description: settings.distinctionDescription.trim() || ABOUT_DISTINCTION_DESCRIPTION_DEFAULT,
    facts,
  }
}

export function resolvePublicAboutOrigins(
  settings: AboutSettingsRecord,
  trackedCompleted = 0,
): PublicAboutOrigins {
  return {
    published: settings.originsPublished,
    title: settings.originsTitle.trim() || ABOUT_ORIGINS_TITLE_DEFAULT,
    description: settings.originsDescription.trim() || ABOUT_ORIGINS_DESCRIPTION_DEFAULT,
    imageUrl: settings.originsImage?.imageUrl.trim() || ABOUT_DEFAULT_ORIGINS_IMAGE_URL,
    journeyCount: displayedJourneyTotal(settings.journeyBaseline, trackedCompleted),
    ownershipValue: ABOUT_OWNERSHIP_VALUE,
    ownershipLabel: ABOUT_OWNERSHIP_LABEL,
  }
}

export function resolvePublicTeam(records: AboutTeamMemberRecord[]): PublicAboutTeamMember[] {
  return records
    .filter(
      (member) =>
        member.published &&
        member.name.trim() &&
        member.description.trim() &&
        Boolean(member.image?.imageUrl.trim()),
    )
    .map((member) => ({
      id: member.id,
      name: member.name.trim(),
      imageUrl: member.image?.imageUrl ?? '',
      designation: member.designation.trim(),
      description: member.description.trim(),
    }))
}

export function resolvePublicApproaches(records: AboutApproachRecord[]): PublicAboutApproach[] {
  const active = records
    .filter((item) => !item.deleted && item.title.trim() && item.description.trim())
    .sort(byOrder)

  if (active.length === 0) {
    return DEFAULT_ABOUT_APPROACHES.map((item, index) => ({
      id: item.id,
      order: index,
      title: item.title,
      description: item.description,
    }))
  }

  return active.map((item) => ({
    id: item.id,
    order: item.order,
    title: item.title.trim(),
    description: item.description.trim(),
  }))
}

/**
 * There is no completed-booking collection or status. Inquiry Converted/Closed is not a completion.
 * Returns 0 so the displayed total stays historical-baseline + tracked completions without inventing records.
 */
export async function countTrackedCompletedJourneys(): Promise<number> {
  return 0
}

function unconfiguredPublicAboutPage(): PublicAboutPage {
  const empty = emptySettings()
  return {
    hero: resolvePublicAboutHero(empty),
    distinction: resolvePublicAboutDistinction(empty),
    origins: resolvePublicAboutOrigins(empty, 0),
    team: [],
    approaches: resolvePublicApproaches([]),
    teamLoaded: true,
    approachesLoaded: true,
  }
}

export async function getPublicAboutPage(): Promise<PublicAboutPage> {
  if (!db) {
    return unconfiguredPublicAboutPage()
  }

  const settings = await getAboutSettings()
  const [teamResult, approachesResult, trackedResult] = await Promise.allSettled([
    listPublishedTeamMembers(),
    listActiveApproaches(),
    countTrackedCompletedJourneys(),
  ])

  const teamLoaded = teamResult.status === 'fulfilled'
  const approachesLoaded = approachesResult.status === 'fulfilled'
  const tracked = trackedResult.status === 'fulfilled' ? trackedResult.value : 0

  return {
    hero: resolvePublicAboutHero(settings),
    distinction: resolvePublicAboutDistinction(settings),
    origins: resolvePublicAboutOrigins(settings, tracked),
    team: teamLoaded ? resolvePublicTeam(teamResult.value) : [],
    approaches: approachesLoaded ? resolvePublicApproaches(approachesResult.value) : [],
    teamLoaded,
    approachesLoaded,
  }
}

function sanitizeHero(input: AboutHeroInput): { title: string; description: string } {
  const title = input.title.trim()
  const description = normalizeMultiline(input.description)

  if (title.length > ABOUT_HERO_TITLE_MAX) {
    throw new Error(`Keep the hero title under ${ABOUT_HERO_TITLE_MAX} characters.`)
  }
  if (description.length > ABOUT_HERO_DESCRIPTION_MAX) {
    throw new Error(`Keep the hero description under ${ABOUT_HERO_DESCRIPTION_MAX} characters.`)
  }

  return { title, description }
}

function sanitizeFacts(facts: AboutDistinctionFact[]): AboutDistinctionFact[] {
  if (facts.length > ABOUT_FACTS_MAX) {
    throw new Error(`You can have up to ${ABOUT_FACTS_MAX} distinction facts.`)
  }

  return facts.map((fact, index) => {
    const title = fact.title.trim()
    const description = normalizeMultiline(fact.description).trim()
    const icon = fact.icon.trim()

    if (!title) {
      throw new Error(`Enter a title for fact ${index + 1}.`)
    }
    if (title.length > ABOUT_FACT_TITLE_MAX) {
      throw new Error(`Keep each fact title under ${ABOUT_FACT_TITLE_MAX} characters.`)
    }
    if (!description) {
      throw new Error(`Enter a short description for fact ${index + 1}.`)
    }
    if (description.length > ABOUT_FACT_DESCRIPTION_MAX) {
      throw new Error(`Keep each fact description under ${ABOUT_FACT_DESCRIPTION_MAX} characters.`)
    }
    if (!isAboutDistinctionIconId(icon)) {
      throw new Error(`Choose an icon for fact ${index + 1}.`)
    }

    return {
      id: fact.id.trim() || createDocumentId('fact'),
      icon,
      title,
      description,
    }
  })
}

function sanitizeDistinction(input: AboutDistinctionInput): AboutDistinctionInput {
  const catchphrase = normalizeMultiline(input.catchphrase).trim()
  const description = normalizeMultiline(input.description)

  if (countWithoutNewlines(catchphrase) > ABOUT_CATCHPHRASE_MAX) {
    throw new Error(`Keep the catchphrase under ${ABOUT_CATCHPHRASE_MAX} characters, not counting line breaks.`)
  }
  if (description.length > ABOUT_DISTINCTION_DESCRIPTION_MAX) {
    throw new Error(`Keep the distinction description under ${ABOUT_DISTINCTION_DESCRIPTION_MAX} characters.`)
  }

  return {
    catchphrase,
    description,
    facts: sanitizeFacts(input.facts),
  }
}

function sanitizeOrigins(input: AboutOriginsInput): Omit<AboutOriginsInput, 'image'> {
  const title = input.title.trim()
  const description = normalizeMultiline(input.description)
  const journeyBaseline = Number(input.journeyBaseline)

  if (title.length > ABOUT_ORIGINS_TITLE_MAX) {
    throw new Error(`Keep the origins title under ${ABOUT_ORIGINS_TITLE_MAX} characters.`)
  }
  if (description.length > ABOUT_ORIGINS_DESCRIPTION_MAX) {
    throw new Error(`Keep the origins description under ${ABOUT_ORIGINS_DESCRIPTION_MAX} characters.`)
  }
  if (!Number.isFinite(journeyBaseline) || journeyBaseline < 0 || !Number.isInteger(journeyBaseline)) {
    throw new Error('Enter a whole number of 0 or more for the historical journey baseline.')
  }
  if (journeyBaseline > ABOUT_JOURNEY_BASELINE_MAX) {
    throw new Error(`Keep the historical baseline at ${ABOUT_JOURNEY_BASELINE_MAX} or below.`)
  }

  return {
    published: input.published === true,
    title,
    description,
    journeyBaseline,
  }
}

function sanitizeTeamMember(input: AboutTeamMemberInput): AboutTeamMemberInput {
  const name = input.name.trim()
  const designation = input.designation.trim()
  const description = normalizeMultiline(input.description).trim()
  const published = input.published === true

  if (!name) {
    throw new Error('Enter a name.')
  }
  if (name.length > ABOUT_TEAM_NAME_MAX) {
    throw new Error(`Keep the name under ${ABOUT_TEAM_NAME_MAX} characters.`)
  }
  if (designation.length > ABOUT_TEAM_DESIGNATION_MAX) {
    throw new Error(`Keep the designation under ${ABOUT_TEAM_DESIGNATION_MAX} characters.`)
  }
  if (!description) {
    throw new Error('Enter a description.')
  }
  if (description.length > ABOUT_TEAM_DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${ABOUT_TEAM_DESCRIPTION_MAX} characters.`)
  }
  if (published && !input.image?.imageUrl.trim()) {
    throw new Error('Upload a portrait before publishing this team member.')
  }

  return {
    name,
    image: input.image,
    designation,
    description,
    published,
  }
}

function sanitizeApproach(input: AboutApproachInput): AboutApproachInput {
  const title = input.title.trim()
  const description = normalizeMultiline(input.description).trim()

  if (!title) {
    throw new Error('Enter a title.')
  }
  if (title.length > ABOUT_APPROACH_TITLE_MAX) {
    throw new Error(`Keep the title under ${ABOUT_APPROACH_TITLE_MAX} characters.`)
  }
  if (!description) {
    throw new Error('Enter a short description.')
  }
  if (description.length > ABOUT_APPROACH_DESCRIPTION_MAX) {
    throw new Error(`Keep the description under ${ABOUT_APPROACH_DESCRIPTION_MAX} characters.`)
  }

  return { title, description }
}

export async function updateAboutHero(input: AboutHeroInput): Promise<void> {
  const hero = sanitizeHero(input)
  const payload: Record<string, unknown> = {
    heroTitle: hero.title,
    heroDescription: hero.description,
  }
  if (input.image?.imageUrl.trim()) {
    payload.heroImage = input.image
  }
  await mergeSettings(payload)
}

export async function updateAboutDistinction(input: AboutDistinctionInput): Promise<void> {
  const distinction = sanitizeDistinction(input)
  await mergeSettings({
    distinctionCatchphrase: distinction.catchphrase,
    distinctionDescription: distinction.description,
    distinctionFacts: distinction.facts,
    distinctionFactsConfigured: true,
  })
}

export async function updateAboutOrigins(input: AboutOriginsInput): Promise<void> {
  const origins = sanitizeOrigins(input)
  const payload: Record<string, unknown> = {
    originsPublished: origins.published,
    originsTitle: origins.title,
    originsDescription: origins.description,
    journeyBaseline: origins.journeyBaseline,
  }
  if (input.image?.imageUrl.trim()) {
    payload.originsImage = input.image
  }
  await mergeSettings(payload)
}

export async function listAllTeamMembers(): Promise<AboutTeamMemberRecord[]> {
  const snapshot = await getDocs(teamCollection())
  return snapshot.docs.map((item) => toTeamMember(item.id, item.data())).sort(byOrder)
}

export async function listPublishedTeamMembers(): Promise<AboutTeamMemberRecord[]> {
  const snapshot = await getDocs(query(teamCollection(), where('published', '==', true)))
  return snapshot.docs.map((item) => toTeamMember(item.id, item.data())).sort(byOrder)
}

export async function createTeamMember(input: AboutTeamMemberInput): Promise<string> {
  const member = sanitizeTeamMember(input)
  const existing = await listAllTeamMembers()
  const order = existing.reduce((max, item) => Math.max(max, item.order), -1) + 1
  const id = createDocumentId('member')
  await setDoc(doc(teamCollection(), id), {
    ...member,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export async function updateTeamMember(id: string, input: AboutTeamMemberInput): Promise<void> {
  const memberId = requireId(id, 'A team member id')
  await updateDoc(doc(teamCollection(), memberId), {
    ...sanitizeTeamMember(input),
    updatedAt: serverTimestamp(),
  })
}

export async function setTeamMemberPublished(id: string, published: boolean): Promise<void> {
  const memberId = requireId(id, 'A team member id')
  if (published) {
    const snapshot = await getDoc(doc(teamCollection(), memberId))
    if (!snapshot.exists()) {
      throw new Error('This team member could not be found.')
    }
    const member = toTeamMember(memberId, snapshot.data())
    if (!member.image?.imageUrl.trim()) {
      throw new Error('Upload a portrait before publishing this team member.')
    }
  }
  await updateDoc(doc(teamCollection(), memberId), { published, updatedAt: serverTimestamp() })
}

export async function reorderTeamMembers(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(requireDb())
  orderedIds.forEach((id, index) => {
    batch.update(doc(teamCollection(), id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export async function deleteTeamMember(id: string): Promise<void> {
  await deleteDoc(doc(teamCollection(), requireId(id, 'A team member id')))
}

export async function listAllApproaches(): Promise<AboutApproachRecord[]> {
  const snapshot = await getDocs(approachesCollection())
  return snapshot.docs.map((item) => toApproach(item.id, item.data())).sort(byOrder)
}

export async function listActiveApproaches(): Promise<AboutApproachRecord[]> {
  const snapshot = await getDocs(query(approachesCollection(), where('deleted', '==', false)))
  return snapshot.docs.map((item) => toApproach(item.id, item.data())).sort(byOrder)
}

/**
 * Seeds the three default approaches once. The settings `approachesInitialized` flag is set in the
 * same transaction, so later visits never recreate them, even after every approach is soft-deleted.
 */
export async function ensureAboutApproachesInitialized(): Promise<boolean> {
  const firestore = requireDb()
  const existing = await getDocs(approachesCollection())
  const ref = settingsRef()

  return runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const settings = toSettings(snapshot.exists() ? snapshot.data() : undefined)
    if (settings.approachesInitialized) {
      return false
    }

    transaction.set(
      ref,
      {
        approachesInitialized: true,
        ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    if (!existing.empty) {
      return false
    }

    DEFAULT_ABOUT_APPROACHES.forEach((item, index) => {
      transaction.set(doc(approachesCollection(), item.id), {
        title: item.title,
        description: item.description,
        order: index,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
    return true
  })
}

export async function createApproach(input: AboutApproachInput): Promise<string> {
  const approach = sanitizeApproach(input)
  const existing = await listAllApproaches()
  const active = existing.filter((item) => !item.deleted)
  const order = active.reduce((max, item) => Math.max(max, item.order), -1) + 1
  const id = createDocumentId('approach')
  await setDoc(doc(approachesCollection(), id), {
    ...approach,
    order,
    deleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export async function updateApproach(id: string, input: AboutApproachInput): Promise<void> {
  const approachId = requireId(id, 'An approach id')
  await updateDoc(doc(approachesCollection(), approachId), {
    ...sanitizeApproach(input),
    updatedAt: serverTimestamp(),
  })
}

export async function softDeleteApproach(id: string): Promise<void> {
  await updateDoc(doc(approachesCollection(), requireId(id, 'An approach id')), {
    deleted: true,
    updatedAt: serverTimestamp(),
  })
}

export async function restoreApproach(id: string): Promise<void> {
  const approachId = requireId(id, 'An approach id')
  const existing = await listAllApproaches()
  const active = existing.filter((item) => !item.deleted)
  const order = active.reduce((max, item) => Math.max(max, item.order), -1) + 1
  await updateDoc(doc(approachesCollection(), approachId), {
    deleted: false,
    order,
    updatedAt: serverTimestamp(),
  })
}

export async function reorderApproaches(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(requireDb())
  orderedIds.forEach((id, index) => {
    batch.update(doc(approachesCollection(), id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}
