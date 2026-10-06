import { getAuth, type Auth } from 'firebase/auth'
import { app, isFirebaseConfigured } from '@/services/firebase/app.ts'

export const auth: Auth | null = isFirebaseConfigured && app ? getAuth(app) : null
