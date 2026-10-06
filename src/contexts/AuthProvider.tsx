import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { isFirebaseConfigured } from '@/config/env.ts'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context.ts'
import { auth } from '@/services/firebase/auth.ts'
import { getAuthErrorMessage } from '@/utils/authErrors.ts'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(auth))

  useEffect(() => {
    if (!auth) {
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Add your .env.local values first.')
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) {
      return
    }

    await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
