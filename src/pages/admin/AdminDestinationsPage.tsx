import { useEffect, useState } from 'react'
import { DestinationForm } from '@/components/admin/destinations/DestinationForm.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { deleteDestination, listAllDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'

export function AdminDestinationsPage() {
  const [records, setRecords] = useState<DestinationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<DestinationRecord | null | undefined>(undefined)

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

  async function onDelete(id: string) {
    if (!window.confirm('Delete this destination? This cannot be undone.')) {
      return
    }

    try {
      await deleteDestination(id)
      if (editing?.id === id) {
        setEditing(undefined)
      }
      await refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete destination.')
    }
  }

  const formOpen = editing !== undefined

  return (
    <>
      <PageMeta
        title="Admin · Destinations"
        description="Manage destination pages, hero content, and inquiry-form destination options."
      />
      <AdminHeader title="Destinations" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate-600">
            Destinations marked as inquiry options appear in the Preferred Destinations dropdown on the custom
            tour form. Published destinations appear on the public website.
          </p>
          <Button
            type="button"
            className="rounded-lg"
            disabled={!isFirebaseConfigured || formOpen}
            onClick={() => setEditing(null)}
          >
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
          <DestinationForm
            record={editing ?? null}
            onCancel={() => setEditing(undefined)}
            onSaved={async () => {
              setEditing(undefined)
              await refresh()
            }}
          />
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
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Inquiry option</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Popular</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {record.coverImage ? (
                          <img
                            src={record.coverImage.imageUrl}
                            alt=""
                            className="h-12 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-400">
                            No image
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{record.slug}</td>
                    <td className="px-4 py-3">{record.availableForInquiry ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.published ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.popular ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.featured ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="text-sm font-medium text-slate-900 underline"
                          onClick={() => setEditing(record)}
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
