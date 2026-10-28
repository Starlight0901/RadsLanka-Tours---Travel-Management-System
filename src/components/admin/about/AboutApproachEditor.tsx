import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  controlClassName,
  errorMessage,
  hintClassName,
  labelClassName,
  rowButtonClassName,
} from '@/components/admin/about/aboutFormStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { ABOUT_APPROACH_DESCRIPTION_MAX, ABOUT_APPROACH_TITLE_MAX } from '@/config/aboutContent.ts'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  createApproach,
  ensureAboutApproachesInitialized,
  listAllApproaches,
  reorderApproaches,
  restoreApproach,
  softDeleteApproach,
  updateApproach,
  type AboutApproachRecord,
} from '@/services/firebase/about.ts'
import { cn } from '@/utils/cn.ts'

type ApproachForm = {
  title: string
  description: string
}

const emptyForm = (): ApproachForm => ({ title: '', description: '' })

export function AboutApproachEditor() {
  const [records, setRecords] = useState<AboutApproachRecord[]>([])
  const [form, setForm] = useState<ApproachForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const active = useMemo(() => records.filter((item) => !item.deleted), [records])
  const deleted = useMemo(() => records.filter((item) => item.deleted), [records])

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setLoadError(null)

    async function load() {
      try {
        await ensureAboutApproachesInitialized()
        const next = await listAllApproaches()
        if (mounted) {
          setRecords(next)
        }
      } catch (loadFailure) {
        if (mounted) {
          setLoadError(errorMessage(loadFailure, 'Approaches could not be loaded.'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [reloadKey])

  async function refresh() {
    setRecords(await listAllApproaches())
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      if (editingId) {
        await updateApproach(editingId, form)
        setStatus('Approach saved.')
      } else {
        await createApproach(form)
        setStatus('Approach added.')
      }
      await refresh()
      setForm(emptyForm())
      setEditingId(null)
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save this approach.'))
    } finally {
      setBusy(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= active.length) {
      return
    }
    const ids = active.map((item) => item.id)
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
      await reorderApproaches(ids)
      await refresh()
      setStatus('Order saved.')
    } catch (moveError) {
      setError(errorMessage(moveError, 'Unable to reorder approaches.'))
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(item: AboutApproachRecord) {
    if (!window.confirm(`Remove “${item.title || 'this approach'}”? It will be hidden, not permanently deleted.`)) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await softDeleteApproach(item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      await refresh()
      setStatus('Approach removed. You can restore it from the deleted list.')
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to remove this approach.'))
    } finally {
      setBusy(false)
    }
  }

  async function onRestore(item: AboutApproachRecord) {
    setBusy(true)
    setError(null)
    try {
      await restoreApproach(item.id)
      await refresh()
      setStatus('Approach restored.')
    } catch (restoreError) {
      setError(errorMessage(restoreError, 'Unable to restore this approach.'))
    } finally {
      setBusy(false)
    }
  }

  function beginEdit(item: AboutApproachRecord) {
    setEditingId(item.id)
    setForm({ title: item.title, description: item.description })
    setError(null)
    setStatus(null)
  }

  if (loading) {
    return <LoadingState label="Loading approaches" />
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <ErrorState title="Approaches error" message={loadError} />
        <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setReloadKey((key) => key + 1)}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-600">
        Active approaches appear on the public About Us page. If none are active, the original three defaults are shown.
        Removed approaches are kept so you can edit or restore them.
      </p>

      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-5" noValidate>
        <h3 className="text-sm font-semibold text-slate-900">{editingId ? 'Edit approach' : 'Add approach'}</h3>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="about-approach-title" className={labelClassName}>
              Title
            </label>
            <input
              id="about-approach-title"
              value={form.title}
              maxLength={ABOUT_APPROACH_TITLE_MAX}
              className={controlClassName}
              disabled={busy}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="about-approach-description" className={labelClassName}>
              Short description
            </label>
            <textarea
              id="about-approach-description"
              rows={4}
              value={form.description}
              maxLength={ABOUT_APPROACH_DESCRIPTION_MAX}
              className={controlClassName}
              disabled={busy}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
            <p className={hintClassName}>
              {form.description.length} / {ABOUT_APPROACH_DESCRIPTION_MAX}
            </p>
          </div>
        </div>
        <FormError message={error ?? undefined} />
        <div className="mt-4 flex gap-2">
          <Button type="submit" className="rounded-lg" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save approach' : 'Add approach'}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              disabled={busy}
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

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Active approaches</h3>
        {active.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
            No active approaches. The public page currently shows the three default approaches.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {active.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                  editingId === item.id ? 'border-slate-900' : 'border-slate-200',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</p>
                  <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="truncate text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={busy || index === 0}
                    aria-label={`Move “${item.title}” up`}
                    onClick={() => void move(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={busy || index === active.length - 1}
                    aria-label={`Move “${item.title}” down`}
                    onClick={() => void move(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={rowButtonClassName} disabled={busy} onClick={() => beginEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={cn(rowButtonClassName, 'text-red-700 hover:bg-red-50')}
                    disabled={busy}
                    onClick={() => void onDelete(item)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Deleted approaches</h3>
        <p className={hintClassName}>These records stay in Firestore. Restore one to show it again.</p>
        {deleted.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No deleted approaches.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {deleted.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
                  <p className="truncate text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">Deleted</span>
                  <button type="button" className={rowButtonClassName} disabled={busy} onClick={() => beginEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className={rowButtonClassName} disabled={busy} onClick={() => void onRestore(item)}>
                    Restore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
