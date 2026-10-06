function readEnv(key: keyof ImportMetaEnv): string {
  return import.meta.env[key] ?? ''
}

export const env = {
  firebase: {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
  },
  cloudinary: {
    cloudName: readEnv('VITE_CLOUDINARY_CLOUD_NAME'),
    uploadPreset: readEnv('VITE_CLOUDINARY_UPLOAD_PRESET'),
  },
} as const

export const isFirebaseConfigured = Boolean(
  env.firebase.apiKey && env.firebase.projectId && env.firebase.appId,
)

export const isCloudinaryConfigured = Boolean(env.cloudinary.cloudName)
