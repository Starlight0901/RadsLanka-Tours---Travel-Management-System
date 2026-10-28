import { collection, doc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore'
import {
  DESTINATION_IDEAL_FOR_LABEL_MAX,
  IDEAL_FOR_SUGGESTIONS,
  cleanOptionLabel,
  optionKey,
  uniqueOptionLabels,
} from '@/config/destinationContent.ts'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS } from '@/types/models.ts'

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  return db
}

/** Firestore IDs cannot contain "/", so the normalised label is URI-encoded. */
function categoryDocumentId(label: string): string {
  return encodeURIComponent(optionKey(label))
}

/** Built-in suggestions followed by saved custom options, without case or spacing duplicates. */
export async function listIdealForOptions(): Promise<string[]> {
  const snapshot = await getDocs(collection(requireDb(), FIRESTORE_COLLECTIONS.audienceCategories))
  const custom = snapshot.docs
    .map((item) => {
      const name = item.data().name
      return typeof name === 'string' ? name : ''
    })
    .sort((a, b) => a.localeCompare(b))

  return uniqueOptionLabels([...IDEAL_FOR_SUGGESTIONS, ...custom])
}

/** Saves a custom option once and returns the stored label (which may differ only in case). */
export async function saveIdealForOption(value: string): Promise<string> {
  const label = cleanOptionLabel(value)
  if (!label) {
    throw new Error('Enter an audience category.')
  }
  if (label.length > DESTINATION_IDEAL_FOR_LABEL_MAX) {
    throw new Error(`Keep the audience category under ${DESTINATION_IDEAL_FOR_LABEL_MAX} characters.`)
  }

  const suggestion = IDEAL_FOR_SUGGESTIONS.find((item) => optionKey(item) === optionKey(label))
  if (suggestion) {
    return suggestion
  }

  const documentId = categoryDocumentId(label)
  if (!/[\p{L}\p{N}]/u.test(label) || /^__.*__$/.test(documentId)) {
    throw new Error('Use letters or numbers in the audience category.')
  }

  const database = requireDb()
  const ref = doc(database, FIRESTORE_COLLECTIONS.audienceCategories, documentId)

  return runTransaction(database, async (transaction) => {
    const existing = await transaction.get(ref)
    const existingName = existing.exists() ? existing.data().name : undefined
    if (typeof existingName === 'string' && existingName) {
      return existingName
    }
    transaction.set(ref, { name: label, createdAt: serverTimestamp() })
    return label
  })
}
