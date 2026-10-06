import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  createDestination,
  deleteDestination,
  listAllDestinations,
  updateDestination,
  type DestinationRecord,
} from '@/services/firebase/destinations.ts'
import { slugify } from '@/utils/slugify.ts'

const destinationSchema = z.object({
  name: z.string().trim().min(1, 'Enter a destination name').max(80),
  published: z.boolean(),
  availableForInquiry: z.boolean(),
})

type DestinationFormValues = z.infer<typeof destinationSchema>

export function AdminDestinationsPage() {
  const [records, setRecords] = useState<DestinationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: '',
      published: false,
      availableForInquiry: true,
    },
  })

  async function refresh() {
    if (!isFirebaseConfigured) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      setRecords(await listAllDestinations())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load destinations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true

    listAllDestinations()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load destinations.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  function openCreate() {
    setEditingId(null)
    reset({ name: '', published: false, availableForInquiry: true })
    setFormOpen(true)
  }

  function openEdit(record: DestinationRecord) {
    setEditingId(record.id)
    reset({
      name: record.name,
      published: record.published,
      availableForInquiry: record.availableForInquiry,
    })
    setFormOpen(true)
  }

  async function onSubmit(values: DestinationFormValues) {
    const slug = slugify(values.name)
    if (!slug) {
      setError('Enter a name that can become a valid slug.')
      return
    }

    try {
      if (editingId) {
        await updateDestination(editingId, {
          name: values.name.trim(),
          slug,
          published: values.published,
          availableForInquiry: values.availableForInquiry,
        })
      } else {
        await createDestination({
          name: values.name.trim(),
          slug,
          published: values.published,
          availableForInquiry: values.availableForInquiry,
        })
      }
      setFormOpen(false)
      await refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save destination.')
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this destination? This cannot be undone.')) {
      return
    }

    try {
      await deleteDestination(id)
      await refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete destination.')
    }
  }

  return (
    <>
      <PageMeta
        title="Admin · Destinations"
        description="Manage destination pages and inquiry-form destination options."
      />
      <AdminHeader title="Destinations" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate-600">
            Destinations marked as inquiry options appear in the Preferred Destinations dropdown on the custom
            tour form. Published destinations appear on the public website.
          </p>
          <Button type="button" className="rounded-lg" disabled={!isFirebaseConfigured} onClick={openCreate}>
            Add destination
          </Button>
        </div>

        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add your Firebase web config to manage destinations."
          />
        ) : null}

        {error ? <ErrorState title="Destinations error" message={error} /> : null}

        {formOpen ? (
          <form
            className="max-w-xl rounded-xl border border-slate-200 bg-white p-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Edit destination' : 'Add destination'}
            </h2>
            <div className="mt-4">
              <label htmlFor="destination-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="destination-name"
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2"
                {...register('name')}
              />
              <FormError message={errors.name?.message} />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-slate-900" {...register('availableForInquiry')} />
              Available as an inquiry-form option
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-slate-900" {...register('published')} />
              Published on the public Destinations page
            </label>
            <div className="mt-5 flex gap-3">
              <Button type="submit" className="rounded-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? <LoadingState label="Loading destinations" /> : null}

        {!loading && records.length === 0 ? (
          <EmptyState
            title="No destinations yet"
            message="Add destinations here. Enable “Available as an inquiry-form option” to show them in the custom tour form."
          />
        ) : null}

        {!loading && records.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Inquiry option</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{record.name}</td>
                    <td className="px-4 py-3 text-slate-500">{record.slug}</td>
                    <td className="px-4 py-3">{record.availableForInquiry ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.published ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="text-sm font-medium text-slate-900 underline"
                          onClick={() => openEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-sm font-medium text-red-700 underline"
                          onClick={() => void onDelete(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  )
}
