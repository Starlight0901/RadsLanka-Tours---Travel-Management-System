import { initializeApp, type FirebaseApp } from 'firebase/app'
import { env, isFirebaseConfigured } from '@/config/env.ts'

let app: FirebaseApp | null = null

if (isFirebaseConfigured) {
  app = initializeApp({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  })
}

export { app }
export { isFirebaseConfigured }
