import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AboutImageField } from '@/components/admin/about/AboutImageField.tsx'
import {
  controlClassName,
  errorMessage,
  hintClassName,
  labelClassName,
  rowButtonClassName,
} from '@/components/admin/about/aboutFormStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  ABOUT_TEAM_DESCRIPTION_MAX,
  ABOUT_TEAM_DESIGNATION_MAX,
  ABOUT_TEAM_NAME_MAX,
} from '@/config/aboutContent.ts'
import { isFirebaseConfigured } from '@/config/env.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import {
  createTeamMember,
  deleteTeamMember,
  listAllTeamMembers,
  reorderTeamMembers,
  setTeamMemberPublished,
  updateTeamMember,
  type AboutTeamMemberRecord,
} from '@/services/firebase/about.ts'
import type { MediaAsset } from '@/types/models.ts'
import { cn } from '@/utils/cn.ts'

type TeamForm = {
  name: string
  designation: string
  description: string
  image: MediaAsset | null
  published: boolean
}

const emptyForm = (): TeamForm => ({
  name: '',
  designation: '',
  description: '',
  image: null,
  published: false,
})

function toForm(member: AboutTeamMemberRecord): TeamForm {
  return {
    name: member.name,
    designation: member.designation,
    description: member.description,
    image: member.image,
    published: member.published,
  }
}

export function AboutTeamEditor() {
  const [records, setRecords] = useState<AboutTeamMemberRecord[]>([])
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    listAllTeamMembers()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadFailure) => {
        if (active) {
          setLoadError(errorMessage(loadFailure, 'Team members could not be loaded.'))
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
  }, [reloadKey])

  async function refresh() {
    setRecords(await listAllTeamMembers())
  }

  async function onUpload(file: File) {
    setUploading(true)
    setError(null)
    setStatus(null)
    try {
      const result = await uploadImage(file)
      setForm((current) => ({
        ...current,
        image: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          altText: current.image?.altText || current.name.trim() || 'Team member portrait',
        },
      }))
    } catch (uploadError) {
      setError(errorMessage(uploadError, 'Image upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      if (editingId) {
        await updateTeamMember(editingId, form)
        setStatus('Team member saved.')
      } else {
        await createTeamMember(form)
        setStatus('Team member added.')
      }
      await refresh()
      setForm(emptyForm())
      setEditingId(null)
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save this team member.'))
    } finally {
      setBusy(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= records.length) {
      return
    }
    const ids = records.map((record) => record.id)
    const currentId = ids[index]
    const targetId = ids[target]
    if (!currentId || !targetId) {
      return
    }
    ids[index] = targetId
    ids[target] = currentId
    setBusy(true)
    setError(null)
    try {
      await reorderTeamMembers(ids)
      await refresh()
      setStatus('Order saved.')
    } catch (moveError) {
      setError(errorMessage(moveError, 'Unable to reorder team members.'))
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(member: AboutTeamMemberRecord) {
    if (!window.confirm(`Delete “${member.name || 'this team member'}”? This cannot be undone.`)) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await deleteTeamMember(member.id)
      if (editingId === member.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      await refresh()
      setStatus('Team member deleted.')
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this team member.'))
    } finally {
      setBusy(false)
    }
  }

  async function togglePublished(member: AboutTeamMemberRecord) {
    setBusy(true)
    setError(null)
    try {
      await setTeamMemberPublished(member.id, !member.published)
      await refresh()
      setStatus(member.published ? 'Team member unpublished.' : 'Team member published.')
    } catch (toggleError) {
      setError(errorMessage(toggleError, 'Unable to update this team member.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading team" />
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <ErrorState title="Team members error" message={loadError} />
        <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setReloadKey((key) => key + 1)}>
          Try again
        </Button>
      </div>
    )
  }

  const saving = busy || uploading

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-600">
        Only published members with a name, description, and portrait appear on the public About Us page. Do not create
        placeholder people.
      </p>

      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-5" noValidate>
        <h3 className="text-sm font-semibold text-slate-900">{editingId ? 'Edit team member' : 'Add team member'}</h3>
        <div className="mt-4 grid gap-4">
          <AboutImageField
            id="about-team-portrait"
            label="Professional portrait"
            image={form.image}
            required={form.published}
            uploading={uploading}
            disabled={saving}
            hint="Required before publishing. A draft can be saved without a portrait."
            onUpload={(file) => void onUpload(file)}
            onAltChange={(altText) =>
              setForm((current) =>
                current.image ? { ...current, image: { ...current.image, altText } } : current,
              )
            }
          />
          <div>
            <label htmlFor="about-team-name" className={labelClassName}>
              Name <span className="text-red-700">*</span>
            </label>
            <input
              id="about-team-name"
              value={form.name}
              maxLength={ABOUT_TEAM_NAME_MAX}
              className={controlClassName}
              disabled={saving}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="about-team-designation" className={labelClassName}>
              Designation
            </label>
            <input
              id="about-team-designation"
              value={form.designation}
              maxLength={ABOUT_TEAM_DESIGNATION_MAX}
              className={controlClassName}
              disabled={saving}
              onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))}
            />
            <p className={hintClassName}>Optional.</p>
          </div>
          <div>
            <label htmlFor="about-team-description" className={labelClassName}>
              Description <span className="text-red-700">*</span>
            </label>
            <textarea
              id="about-team-description"
              rows={4}
              value={form.description}
              maxLength={ABOUT_TEAM_DESCRIPTION_MAX}
              className={controlClassName}
              disabled={saving}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.published}
              disabled={saving}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
            />
            Published
          </label>
        </div>
        <FormError message={error ?? undefined} />
        <div className="mt-4 flex gap-2">
          <Button type="submit" className="rounded-lg" disabled={saving}>
            {busy ? 'Saving…' : editingId ? 'Save member' : 'Add member'}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              disabled={saving}
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm())
                setError(null)
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      {status ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}

      {records.length === 0 ? (
        <EmptyState title="No team members yet" message="Add a person when you are ready. None are created automatically." />
      ) : (
        <ul className="space-y-2">
          {records.map((member, index) => (
            <li
              key={member.id}
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                editingId === member.id ? 'border-slate-900' : 'border-slate-200',
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {member.image?.imageUrl ? (
                  <img
                    src={member.image.imageUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                    No photo
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{member.name || 'Untitled'}</p>
                  <p className="truncate text-sm text-slate-500">{member.designation || 'No designation'}</p>
                </div>
                {!member.published ? (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Draft
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  className={rowButtonClassName}
                  disabled={busy || index === 0}
                  aria-label={`Move “${member.name}” up`}
                  onClick={() => void move(index, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={rowButtonClassName}
                  disabled={busy || index === records.length - 1}
                  aria-label={`Move “${member.name}” down`}
                  onClick={() => void move(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={rowButtonClassName}
                  disabled={busy}
                  onClick={() => void togglePublished(member)}
                >
                  {member.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className={rowButtonClassName}
                  disabled={busy}
                  onClick={() => {
                    setEditingId(member.id)
                    setForm(toForm(member))
                    setError(null)
                    setStatus(null)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={cn(rowButtonClassName, 'text-red-700 hover:bg-red-50')}
                  disabled={busy}
                  onClick={() => void onDelete(member)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
