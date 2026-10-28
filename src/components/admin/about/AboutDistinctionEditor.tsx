import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AboutIconPicker } from '@/components/admin/about/AboutIconPicker.tsx'
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
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  ABOUT_CATCHPHRASE_DEFAULT,
  ABOUT_CATCHPHRASE_MAX,
  ABOUT_DISTINCTION_DESCRIPTION_DEFAULT,
  ABOUT_DISTINCTION_DESCRIPTION_MAX,
  ABOUT_DISTINCTION_FALLBACK_ICON,
  ABOUT_FACTS_MAX,
  ABOUT_FACT_DESCRIPTION_MAX,
  ABOUT_FACT_TITLE_MAX,
  DEFAULT_DISTINCTION_FACTS,
  countWithoutNewlines,
} from '@/config/aboutContent.ts'
import { isFirebaseConfigured } from '@/config/env.ts'
import { getAboutSettings, updateAboutDistinction } from '@/services/firebase/about.ts'
import type { AboutDistinctionFact } from '@/types/models.ts'
import { cn } from '@/utils/cn.ts'

type DistinctionForm = {
  catchphrase: string
  description: string
  facts: AboutDistinctionFact[]
}

function newFact(): AboutDistinctionFact {
  return {
    id: `fact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    icon: ABOUT_DISTINCTION_FALLBACK_ICON,
    title: '',
    description: '',
  }
}

export function AboutDistinctionEditor() {
  const [form, setForm] = useState<DistinctionForm | null>(null)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    getAboutSettings()
      .then((settings) => {
        if (!active) {
          return
        }
        setConfigured(settings.distinctionFactsConfigured)
        setForm({
          catchphrase: settings.distinctionCatchphrase || ABOUT_CATCHPHRASE_DEFAULT,
          description: settings.distinctionDescription || ABOUT_DISTINCTION_DESCRIPTION_DEFAULT,
          facts: settings.distinctionFactsConfigured
            ? settings.distinctionFacts.map((fact) => ({ ...fact }))
            : DEFAULT_DISTINCTION_FACTS.map((fact) => ({ ...fact })),
        })
      })
      .catch((loadError) => {
        if (active) {
          setError(errorMessage(loadError, 'Distinction settings could not be loaded.'))
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

  function updateFact(id: string, patch: Partial<AboutDistinctionFact>) {
    setForm((current) =>
      current
        ? {
            ...current,
            facts: current.facts.map((fact) => (fact.id === id ? { ...fact, ...patch } : fact)),
          }
        : current,
    )
  }

  function moveFact(index: number, direction: -1 | 1) {
    setForm((current) => {
      if (!current) {
        return current
      }
      const target = index + direction
      if (target < 0 || target >= current.facts.length) {
        return current
      }
      const next = [...current.facts]
      const currentFact = next[index]
      const neighbour = next[target]
      if (!currentFact || !neighbour) {
        return current
      }
      next[index] = neighbour
      next[target] = currentFact
      return { ...current, facts: next }
    })
  }

  function removeFact(id: string) {
    setForm((current) =>
      current ? { ...current, facts: current.facts.filter((fact) => fact.id !== id) } : current,
    )
    if (editingId === id) {
      setEditingId(null)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form) {
      return
    }

    const catchphraseCount = countWithoutNewlines(form.catchphrase)
    if (catchphraseCount > ABOUT_CATCHPHRASE_MAX) {
      setError(`Keep the catchphrase under ${ABOUT_CATCHPHRASE_MAX} characters, not counting line breaks.`)
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      await updateAboutDistinction({
        catchphrase: form.catchphrase,
        description: form.description,
        facts: form.facts,
      })
      setConfigured(true)
      setStatus('Distinction section saved.')
      setEditingId(null)
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save the distinction section.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading distinction" />
  }

  if (!form) {
    return <ErrorState title="Distinction settings" message={error ?? 'Distinction settings could not be loaded.'} />
  }

  const catchphraseCount = countWithoutNewlines(form.catchphrase)
  const catchphraseOver = catchphraseCount > ABOUT_CATCHPHRASE_MAX
  const atLimit = form.facts.length >= ABOUT_FACTS_MAX
  const editingFact = form.facts.find((fact) => fact.id === editingId) ?? null

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="about-catchphrase" className={labelClassName}>
          Distinction catchphrase
        </label>
        <textarea
          id="about-catchphrase"
          rows={3}
          value={form.catchphrase}
          className={controlClassName}
          disabled={saving}
          onChange={(event) =>
            setForm((current) => (current ? { ...current, catchphrase: event.target.value } : current))
          }
        />
        <p className={cn('mt-1.5 text-xs', catchphraseOver ? 'font-medium text-red-700' : 'text-slate-500')}>
          {catchphraseCount} / {ABOUT_CATCHPHRASE_MAX} characters, not counting line breaks. Line breaks are kept.
        </p>
      </div>

      <div>
        <label htmlFor="about-distinction-description" className={labelClassName}>
          Supporting description
        </label>
        <textarea
          id="about-distinction-description"
          rows={5}
          value={form.description}
          maxLength={ABOUT_DISTINCTION_DESCRIPTION_MAX}
          className={controlClassName}
          disabled={saving}
          onChange={(event) =>
            setForm((current) => (current ? { ...current, description: event.target.value } : current))
          }
        />
        <p className={hintClassName}>
          {form.description.length} / {ABOUT_DISTINCTION_DESCRIPTION_MAX}. An empty saved description uses the original
          copy on the public page.
        </p>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Distinction facts</h3>
            <p className={hintClassName}>
              Up to {ABOUT_FACTS_MAX} facts. {configured ? 'Saved facts are used on the public page.' : 'These three defaults are shown on the public page until you save.'}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 rounded-lg px-4 py-2"
            disabled={saving || atLimit}
            onClick={() => {
              const fact = newFact()
              setForm((current) => (current ? { ...current, facts: [...current.facts, fact] } : current))
              setEditingId(fact.id)
            }}
          >
            Add fact
          </Button>
        </div>
        {atLimit ? <p className="mt-2 text-sm text-slate-600">The maximum is {ABOUT_FACTS_MAX} facts.</p> : null}

        {form.facts.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
            No facts in this saved list. The public page will not restore the three defaults after you save.
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {form.facts.map((fact, index) => (
              <li
                key={fact.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                  editingId === fact.id ? 'border-slate-900' : 'border-slate-200',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="w-5 text-center text-xs font-semibold text-slate-400">{index + 1}</span>
                  <Icon name={fact.icon || ABOUT_DISTINCTION_FALLBACK_ICON} className="text-[20px] text-slate-700" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{fact.title || 'Untitled fact'}</p>
                    <p className="truncate text-sm text-slate-500">{fact.description || 'No description yet'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={saving || index === 0}
                    aria-label={`Move “${fact.title || 'fact'}” up`}
                    onClick={() => moveFact(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={saving || index === form.facts.length - 1}
                    aria-label={`Move “${fact.title || 'fact'}” down`}
                    onClick={() => moveFact(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={rowButtonClassName} disabled={saving} onClick={() => setEditingId(fact.id)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={cn(rowButtonClassName, 'text-red-700 hover:bg-red-50')}
                    disabled={saving}
                    onClick={() => removeFact(fact.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {editingFact ? (
          <div className="mt-5 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-900">Edit fact</h4>
            <div>
              <label htmlFor="about-fact-title" className={labelClassName}>
                Title
              </label>
              <input
                id="about-fact-title"
                value={editingFact.title}
                maxLength={ABOUT_FACT_TITLE_MAX}
                className={controlClassName}
                disabled={saving}
                onChange={(event) => updateFact(editingFact.id, { title: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="about-fact-description" className={labelClassName}>
                Short description
              </label>
              <textarea
                id="about-fact-description"
                rows={3}
                value={editingFact.description}
                maxLength={ABOUT_FACT_DESCRIPTION_MAX}
                className={controlClassName}
                disabled={saving}
                onChange={(event) => updateFact(editingFact.id, { description: event.target.value })}
              />
            </div>
            <AboutIconPicker
              value={editingFact.icon}
              disabled={saving}
              onChange={(icon) => updateFact(editingFact.id, { icon })}
            />
            <Button type="button" variant="ghost" className="rounded-lg" disabled={saving} onClick={() => setEditingId(null)}>
              Done editing
            </Button>
          </div>
        ) : null}
      </div>

      {status ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}
      <FormError message={error ?? undefined} />
      <Button type="submit" className="rounded-lg" disabled={saving || catchphraseOver}>
        {saving ? 'Saving…' : 'Save distinction'}
      </Button>
    </form>
  )
}
