import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { siteConfig, siteFallback } from '@/config/site.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { paths } from '@/routes/paths.ts'
import { PopupCancelledError } from '@/utils/authErrors.ts'

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const { signIn, signInWithGoogle, isConfigured } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitErrorTitle, setSubmitErrorTitle] = useState('Sign-in failed')
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const googleRequest = useRef(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const busy = isSubmitting || googleSubmitting

  async function onSubmit(values: LoginValues) {
    if (googleRequest.current) {
      return
    }

    setSubmitError(null)
    try {
      await signIn(values.email, values.password)
    } catch (error) {
      setSubmitErrorTitle('Sign-in failed')
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  async function onGoogleSignIn() {
    if (googleRequest.current || isSubmitting) {
      return
    }

    googleRequest.current = true
    setGoogleSubmitting(true)
    setSubmitError(null)
    try {
      await signInWithGoogle()
    } catch (error) {
      if (error instanceof PopupCancelledError) {
        setSubmitErrorTitle('Sign-in cancelled')
        setSubmitError(error.message)
        return
      }

      setSubmitErrorTitle('Sign-in failed')
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      googleRequest.current = false
      setGoogleSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <PageMeta title="Admin login" description="Sign in to the RadsLanka Tours admin panel." />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <img src={siteConfig.logo.src} alt={siteConfig.logo.alt} className="mb-6 h-24 w-auto object-contain" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin panel</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          {siteFallback.name} content and inquiries. This area is for the agency owner only.
        </p>

        {!isConfigured ? (
          <div className="mt-6">
            <ErrorState
              title="Firebase is not configured"
              message="Copy .env.example to .env.local, add your Firebase web config, and restart the dev server. Then create an Auth user and an admins/{uid} document."
            />
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2"
              disabled={!isConfigured || busy}
              {...register('email')}
            />
            <FormError message={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2"
              disabled={!isConfigured || busy}
              {...register('password')}
            />
            <FormError message={errors.password?.message} />
          </div>
          {submitError ? <ErrorState title={submitErrorTitle} message={submitError} /> : null}
          <Button type="submit" className="w-full rounded-lg" disabled={!isConfigured || busy}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full rounded-lg"
          disabled={!isConfigured || busy}
          onClick={() => {
            void onGoogleSignIn()
          }}
        >
          <GoogleMark />
          {googleSubmitting ? 'Signing in…' : 'Continue with Google'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to={paths.home} className="hover:text-slate-900">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
