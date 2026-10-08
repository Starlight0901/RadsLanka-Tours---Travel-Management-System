import { useEffect, useState, type FormEvent } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { createTag, deleteTag, listAllTags, updateTag, type TagRecord } from '@/services/firebase/tags.ts'
import { slugify } from '@/utils/slugify.ts'

type TourTagsManagerProps = {
  onChanged: () => void
}

const controlClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2'

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Unable to save this tag.'
}

export function TourTagsManager({ onChanged }: TourTagsManagerProps) {
  const [tags, setTags] = useState<TagRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      setTags(await listAllTags())
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    listAllTags()
      .then((next) => {
        if (active) {
          setTags(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError))
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

  function resetForm() {
    setEditingId(null)
    setName('')
    setSlug('')
    setSlugManual(false)
    setNameError(null)
  }

  function openEdit(tag: TagRecord) {
    setEditingId(tag.id)
    setName(tag.name)
    setSlug(tag.slug)
    setSlugManual(true)
    setNameError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    const nextSlug = slugify(slugManual ? slug : nextName)
    if (!nextName) {
      setNameError('Enter a tag name.')
      return
    }
    if (!nextSlug) {
      setNameError('Use a tag name that can become a valid slug.')
      return
    }

    setSaving(true)
    setError(null)
    setNameError(null)
    try {
      if (editingId) {
        await updateTag(editingId, { name: nextName, slug: nextSlug })
      } else {
        await createTag({ name: nextName, slug: nextSlug })
      }
      resetForm()
      await refresh()
      onChanged()
    } catch (saveError) {
      setError(errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this tag? Tours that used it will simply stop showing it.')) {
      return
    }

    setError(null)
    try {
      await deleteTag(id)
      if (editingId === id) {
        resetForm()
      }
      await refresh()
      onChanged()
    } catch (deleteError) {
      setError(errorMessage(deleteError))
    }
  }

  return (
    <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Manage tags</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tags are shared across tours. Create them here, then select them on a tour.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorState title="Tags error" message={error} />
        </div>
      ) : null}

      <form className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(event) => void onSubmit(event)} noValidate>
        <div>
          <label htmlFor="tag-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="tag-name"
            type="text"
            value={name}
            className={controlClassName}
            onChange={(event) => {
              const next = event.target.value
              setName(next)
              if (!slugManual) {
                setSlug(slugify(next))
              }
            }}
          />
          <FormError message={nameError ?? undefined} />
        </div>
        <div>
          <label htmlFor="tag-slug" className="mb-1.5 block text-sm font-medium text-slate-700">
            Slug
          </label>
          <input
            id="tag-slug"
            type="text"
            value={slug}
            className={controlClassName}
            onChange={(event) => {
              setSlugManual(true)
              setSlug(event.target.value)
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="rounded-lg" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update tag' : 'Add tag'}
          </Button>
          {editingId ? (
            <Button type="button" variant="secondary" className="rounded-lg" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <div className="mt-4">
          <LoadingState label="Loading tags" />
        </div>
      ) : null}

      {!loading && tags.length === 0 ? <p className="mt-4 text-sm text-slate-500">No tags yet.</p> : null}

      {!loading && tags.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {tags.map((tag) => (
            <li key={tag.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{tag.name}</p>
                <p className="text-xs text-slate-500">{tag.slug}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" className="text-sm font-medium text-slate-900 underline" onClick={() => openEdit(tag)}>
                  Edit
                </button>
                <button type="button" className="text-sm font-medium text-red-700 underline" onClick={() => void onDelete(tag.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
