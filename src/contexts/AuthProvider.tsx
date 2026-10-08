import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { isFirebaseConfigured } from '@/config/env.ts'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context.ts'
import { UnauthorizedAdminError, assertAuthorizedAdmin } from '@/services/firebase/admins.ts'
import { auth } from '@/services/firebase/auth.ts'
import { PopupCancelledError, getAuthErrorMessage, isPopupCancellation } from '@/utils/authErrors.ts'

type AuthProviderProps = {
  children: ReactNode
}

type SignInMethod = 'password' | 'google'

type AuthorizationWaiter = {
  method: SignInMethod
  settled: boolean
  promise: Promise<void>
  resolve: () => void
  reject: (error: Error) => void
  abandon: () => void
}

function createAuthorizationWaiter(method: SignInMethod): AuthorizationWaiter {
  let resolvePromise: () => void = () => {}
  let rejectPromise: (error: Error) => void = () => {}
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  void promise.catch(() => {})

  const waiter: AuthorizationWaiter = {
    method,
    settled: false,
    promise,
    resolve() {
      if (waiter.settled) return
      waiter.settled = true
      resolvePromise()
    },
    reject(error: Error) {
      if (waiter.settled) return
      waiter.settled = true
      rejectPromise(error)
    },
    abandon() {
      waiter.settled = true
    },
  }

  return waiter
}

function authorizationError(method: SignInMethod, error: unknown): Error {
  if (error instanceof UnauthorizedAdminError) {
    return new Error(
      method === 'google'
        ? 'This Google account is not authorized to access the admin panel.'
        : 'This account is not authorized to access the admin panel.',
    )
  }

  return new Error('Unable to verify admin access. Please try again.')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(auth))
  const verifiedUid = useRef<string | null>(null)
  const authEventId = useRef(0)
  const authorizationWaiter = useRef<AuthorizationWaiter | null>(null)

  useEffect(() => {
    if (!auth) {
      return
    }

    const firebaseAuth = auth
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      const eventId = ++authEventId.current

      if (!nextUser) {
        verifiedUid.current = null
        setUser(null)
        setLoading(false)
        return
      }

      if (verifiedUid.current === nextUser.uid) {
        setUser(nextUser)
        setLoading(false)
        const waiter = authorizationWaiter.current
        authorizationWaiter.current = null
        waiter?.resolve()
        return
      }

      const waiterAtStart = authorizationWaiter.current

      void (async () => {
        try {
          await nextUser.getIdToken()
          await assertAuthorizedAdmin(nextUser.uid)
          if (authEventId.current !== eventId) {
            return
          }

          verifiedUid.current = nextUser.uid
          setUser(nextUser)
          setLoading(false)
          if (authorizationWaiter.current === waiterAtStart) {
            authorizationWaiter.current = null
            waiterAtStart?.resolve()
          }
        } catch (error) {
          if (authEventId.current !== eventId) {
            return
          }

          const waiter = authorizationWaiter.current === waiterAtStart ? waiterAtStart : null
          if (authorizationWaiter.current === waiterAtStart) {
            authorizationWaiter.current = null
          }
          waiter?.reject(authorizationError(waiter?.method ?? 'password', error))

          if (firebaseAuth.currentUser?.uid === nextUser.uid) {
            try {
              await firebaseSignOut(firebaseAuth)
            } catch {
              verifiedUid.current = null
              setUser(null)
              setLoading(false)
            }
            return
          }

          verifiedUid.current = null
          setUser(null)
          setLoading(false)
        }
      })()
    })

    return () => {
      authEventId.current += 1
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Add your .env.local values first.')
    }

    const waiter = createAuthorizationWaiter('password')
    authorizationWaiter.current = waiter

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      if (verifiedUid.current === credential.user.uid) {
        waiter.resolve()
      }
    } catch (error) {
      if (authorizationWaiter.current === waiter) {
        authorizationWaiter.current = null
      }
      waiter.abandon()
      throw new Error(getAuthErrorMessage(error))
    }

    await waiter.promise
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured. Add your .env.local values first.')
    }

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    const waiter = createAuthorizationWaiter('google')
    authorizationWaiter.current = waiter

    try {
      const credential = await signInWithPopup(auth, provider)
      if (verifiedUid.current === credential.user.uid) {
        waiter.resolve()
      }
    } catch (error) {
      if (authorizationWaiter.current === waiter) {
        authorizationWaiter.current = null
      }
      waiter.abandon()
      if (isPopupCancellation(error)) {
        throw new PopupCancelledError()
      }
      throw new Error(getAuthErrorMessage(error))
    }

    await waiter.promise
  }, [])

  const signOut = useCallback(async () => {
    verifiedUid.current = null
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
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signIn, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
