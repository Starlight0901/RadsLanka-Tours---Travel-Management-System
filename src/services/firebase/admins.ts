import { doc, getDocFromServer } from 'firebase/firestore'
import { db } from '@/services/firebase/firestore.ts'
import { FIRESTORE_COLLECTIONS, type AdminRole } from '@/types/models.ts'

const ADMIN_ROLES: readonly AdminRole[] = ['owner', 'admin']

export class UnauthorizedAdminError extends Error {
  constructor() {
    super('Unauthorized admin')
    this.name = 'UnauthorizedAdminError'
  }
}

function isPermissionDenied(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  const code = error.code
  return code === 'permission-denied' || code === 'firestore/permission-denied'
}

function isAdminRole(role: unknown): role is AdminRole {
  return ADMIN_ROLES.some((adminRole) => adminRole === role)
}

/**
 * Allows access only when admins/{uid} already exists and its role is owner or admin.
 * Does not create an admin document.
 */
export async function assertAuthorizedAdmin(uid: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not configured. Add your .env.local values first.')
  }

  try {
    const snapshot = await getDocFromServer(doc(db, FIRESTORE_COLLECTIONS.admins, uid))
    if (!snapshot.exists() || !isAdminRole(snapshot.get('role'))) {
      throw new UnauthorizedAdminError()
    }
  } catch (error) {
    if (error instanceof UnauthorizedAdminError || isPermissionDenied(error)) {
      throw new UnauthorizedAdminError()
    }

    throw error
  }
}
