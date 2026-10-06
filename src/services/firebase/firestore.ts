import { getFirestore, type Firestore } from 'firebase/firestore'
import { app, isFirebaseConfigured } from '@/services/firebase/app.ts'

export const db: Firestore | null = isFirebaseConfigured && app ? getFirestore(app) : null
