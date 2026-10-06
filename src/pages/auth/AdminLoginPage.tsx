import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { siteFallback } from '@/config/site.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { paths } from '@/routes/paths.ts'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const { signIn, isConfigured } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setSubmitError(null)
    try {
      await signIn(values.email, values.password)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <PageMeta title="Admin login" description="Sign in to the RadsLanka Tours admin panel." />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
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
              disabled={!isConfigured || isSubmitting}
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
              disabled={!isConfigured || isSubmitting}
              {...register('password')}
            />
            <FormError message={errors.password?.message} />
          </div>
          {submitError ? <ErrorState title="Sign-in failed" message={submitError} /> : null}
          <Button type="submit" className="w-full rounded-lg" disabled={!isConfigured || isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to={paths.home} className="hover:text-slate-900">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
