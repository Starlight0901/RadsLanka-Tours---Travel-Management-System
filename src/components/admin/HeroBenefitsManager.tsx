import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { FormError } from '@/components/forms/FormError.tsx'
import { HeroBenefitIcon } from '@/components/home/HeroBenefitIcon.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  HERO_BENEFITS_MAX_ITEMS,
  HERO_BENEFITS_SPEED_DEFAULT,
  HERO_BENEFITS_SPEED_MAX,
  HERO_BENEFITS_SPEED_MIN,
  HERO_BENEFIT_DESCRIPTION_MAX,
  HERO_BENEFIT_FALLBACK_ICON,
  HERO_BENEFIT_ICON_OPTIONS,
  HERO_BENEFIT_TITLE_MAX,
  clampHeroBenefitsSpeed,
  isHeroBenefitIconId,
} from '@/config/heroBenefits.ts'
import {
  createHeroBenefit,
  deleteHeroBenefit,
  ensureHeroBenefitsInitialized,
  getHeroBenefitsSettings,
  listAllHeroBenefits,
  reorderHeroBenefits,
  setHeroBenefitPublished,
  updateHeroBenefit,
  updateHeroBenefitsSpeed,
  type HeroBenefitRecord,
} from '@/services/firebase/heroBenefits.ts'
import { cn } from '@/utils/cn.ts'

type EditorState = {
  id: string | null
  title: string
  description: string
  icon: string
  published: boolean
}

const controlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2'

const rowButtonClassName =
  'inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function iconLabel(icon: string): string {
  return HERO_BENEFIT_ICON_OPTIONS.find((option) => option.id === icon)?.label ?? 'Fallback icon'
}

function IconPicker({ value, onChange, disabled }: { value: string; onChange: (icon: string) => void; disabled: boolean }) {
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const options = term
    ? HERO_BENEFIT_ICON_OPTIONS.filter(
        (option) => option.label.toLowerCase().includes(term) || option.keywords.includes(term),
      )
    : HERO_BENEFIT_ICON_OPTIONS

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-slate-700">Icon</legend>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          placeholder="Search icons, e.g. driver, price, support"
          aria-label="Search icons"
          className={cn(controlClassName, 'pl-9')}
          disabled={disabled}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {!isHeroBenefitIconId(value) ? (
        <p className="mt-2 text-sm text-amber-800">
          The saved icon “{value || 'none'}” is not available. Choose a new icon before saving.
        </p>
      ) : null}
      <div className="mt-3 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-4">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900',
                selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <HeroBenefitIcon icon={option.id} className="size-5" />
              {option.label}
            </button>
          )
        })}
        {options.length === 0 ? (
          <p className="col-span-full px-2 py-3 text-sm text-slate-500">No icons match “{search}”.</p>
        ) : null}
      </div>
    </fieldset>
  )
}

function BenefitPreview({ editor }: { editor: EditorState }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-mist text-brand shadow-control">
          <HeroBenefitIcon icon={editor.icon} className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand">{editor.title.trim() || 'Heading'}</p>
          <p className="text-xs text-muted">{editor.description.trim() || 'Short description'}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Icon: {iconLabel(editor.icon)}</p>
    </div>
  )
}

export function HeroBenefitsManager() {
  const [records, setRecords] = useState<HeroBenefitRecord[]>([])
  const [speed, setSpeed] = useState(HERO_BENEFITS_SPEED_DEFAULT)
  const [savedSpeed, setSavedSpeed] = useState(HERO_BENEFITS_SPEED_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const atLimit = records.length >= HERO_BENEFITS_MAX_ITEMS
  const publishedCount = useMemo(() => records.filter((record) => record.published).length, [records])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        await ensureHeroBenefitsInitialized()
        const [items, settings] = await Promise.all([listAllHeroBenefits(), getHeroBenefitsSettings()])
        if (!active) {
          return
        }
        setRecords(items)
        setSpeed(settings.mobileAutoScrollSpeed)
        setSavedSpeed(settings.mobileAutoScrollSpeed)
      } catch (loadFailure) {
        if (active) {
          setLoadError(errorMessage(loadFailure, 'Hero benefits could not be loaded.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reloadKey])

  async function run(action: () => Promise<void>, success: string, fallback: string) {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      await action()
      setRecords(await listAllHeroBenefits())
      setStatus(success)
      return true
    } catch (actionError) {
      setError(errorMessage(actionError, fallback))
      return false
    } finally {
      setBusy(false)
    }
  }

  function openCreate() {
    setEditorError(null)
    setStatus(null)
    setEditor({ id: null, title: '', description: '', icon: HERO_BENEFIT_FALLBACK_ICON, published: true })
  }

  function openEdit(record: HeroBenefitRecord) {
    setEditorError(null)
    setStatus(null)
    setEditor({
      id: record.id,
      title: record.title,
      description: record.description,
      icon: record.icon,
      published: record.published,
    })
  }

  async function onSubmitEditor(event: FormEvent) {
    event.preventDefault()
    if (!editor) {
      return
    }

    setEditorError(null)
    setBusy(true)
    setStatus(null)
    try {
      const input = {
        title: editor.title,
        description: editor.description,
        icon: editor.icon,
        published: editor.published,
      }
      if (editor.id) {
        await updateHeroBenefit(editor.id, input)
      } else {
        await createHeroBenefit(input)
      }
      setRecords(await listAllHeroBenefits())
      setStatus(editor.id ? 'Benefit saved.' : 'Benefit added.')
      setEditor(null)
    } catch (saveError) {
      setEditorError(errorMessage(saveError, 'Unable to save this benefit.'))
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
    ;[ids[index], ids[target]] = [ids[target] as string, ids[index] as string]
    await run(() => reorderHeroBenefits(ids), 'Order saved.', 'Unable to reorder benefits.')
  }

  async function onDelete(record: HeroBenefitRecord) {
    if (!window.confirm(`Delete “${record.title || 'this benefit'}”?`)) {
      return
    }
    const deleted = await run(() => deleteHeroBenefit(record.id), 'Benefit deleted.', 'Unable to delete this benefit.')
    if (deleted && editor?.id === record.id) {
      setEditor(null)
    }
  }

  async function onSaveSpeed(event: FormEvent) {
    event.preventDefault()
    const next = clampHeroBenefitsSpeed(speed)
    const saved = await run(() => updateHeroBenefitsSpeed(next), 'Mobile auto-scroll speed saved.', 'Unable to save the speed.')
    if (saved) {
      setSavedSpeed(next)
    }
  }

  return (
    <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="hero-benefits-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="hero-benefits-heading" className="text-sm font-semibold text-slate-900">
            Hero Benefits
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            The short benefits shown in the white strip under the homepage hero. Up to {HERO_BENEFITS_MAX_ITEMS} items.
            Only published items appear on the website.
          </p>
        </div>
        {!loading && !loadError ? (
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {records.length} of {HERO_BENEFITS_MAX_ITEMS} · {publishedCount} published
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5">
          <LoadingState label="Loading hero benefits" />
        </div>
      ) : null}

      {loadError ? (
        <div className="mt-5 space-y-3">
          <ErrorState title="Hero benefits error" message={loadError} />
          <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </Button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <>
          {status ? (
            <p
              className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              {status}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <form onSubmit={onSaveSpeed} className="mt-5 border-t border-slate-200 pt-5">
            <label htmlFor="hero-benefits-speed" className="block text-sm font-medium text-slate-700">
              Mobile Auto-scroll Speed
            </label>
            <p className="mt-1 text-sm text-slate-600">
              Controls how fast the strip moves on phones and tablets. Desktop is not affected.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="min-w-56 flex-1">
                <input
                  id="hero-benefits-speed"
                  type="range"
                  min={HERO_BENEFITS_SPEED_MIN}
                  max={HERO_BENEFITS_SPEED_MAX}
                  step={1}
                  value={speed}
                  disabled={busy}
                  aria-valuetext={`Level ${speed} of ${HERO_BENEFITS_SPEED_MAX}`}
                  className="w-full accent-slate-900"
                  onChange={(event) => {
                    setSpeed(clampHeroBenefitsSpeed(event.target.value))
                    setStatus(null)
                  }}
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500" aria-hidden="true">
                  <span>{HERO_BENEFITS_SPEED_MIN} · Slowest</span>
                  <span>Fastest · {HERO_BENEFITS_SPEED_MAX}</span>
                </div>
              </div>
              <output
                htmlFor="hero-benefits-speed"
                className="inline-flex min-w-16 justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                {speed} / {HERO_BENEFITS_SPEED_MAX}
              </output>
              <Button type="submit" className="rounded-lg" disabled={busy || speed === savedSpeed}>
                Save speed
              </Button>
            </div>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Benefit items</h3>
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 rounded-lg px-4 py-2"
                disabled={busy || atLimit || editor !== null}
                onClick={openCreate}
              >
                Add item
              </Button>
            </div>
            {atLimit ? (
              <p className="mt-2 text-sm text-slate-600">
                The maximum is {HERO_BENEFITS_MAX_ITEMS} benefits. Delete one to add a replacement.
              </p>
            ) : null}

            {records.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                No benefits yet. The homepage strip stays hidden until at least one item is published.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {records.map((record, index) => (
                  <li
                    key={record.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                      editor?.id === record.id ? 'border-slate-900' : 'border-slate-200',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="w-5 text-center text-xs font-semibold text-slate-400">{index + 1}</span>
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-mist text-brand">
                        <HeroBenefitIcon icon={record.icon} className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{record.title}</p>
                        <p className="truncate text-sm text-slate-500">{record.description}</p>
                      </div>
                      {!record.published ? (
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
                        aria-label={`Move “${record.title}” up`}
                        onClick={() => void move(index, -1)}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={rowButtonClassName}
                        disabled={busy || index === records.length - 1}
                        aria-label={`Move “${record.title}” down`}
                        onClick={() => void move(index, 1)}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={rowButtonClassName}
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => setHeroBenefitPublished(record.id, !record.published),
                            record.published ? 'Benefit unpublished.' : 'Benefit published.',
                            'Unable to update this benefit.',
                          )
                        }
                      >
                        {record.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className={rowButtonClassName}
                        disabled={busy || editor !== null}
                        onClick={() => openEdit(record)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={cn(rowButtonClassName, 'text-red-700 hover:bg-red-50')}
                        disabled={busy}
                        onClick={() => void onDelete(record)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {editor ? (
            <form onSubmit={onSubmitEditor} className="mt-5 border-t border-slate-200 pt-5" noValidate>
              <h3 className="text-sm font-semibold text-slate-900">{editor.id ? 'Edit benefit' : 'Add benefit'}</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="hero-benefit-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Heading
                    </label>
                    <input
                      id="hero-benefit-title"
                      value={editor.title}
                      maxLength={HERO_BENEFIT_TITLE_MAX}
                      className={controlClassName}
                      disabled={busy}
                      onChange={(event) => setEditor({ ...editor, title: event.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="hero-benefit-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Short description
                    </label>
                    <input
                      id="hero-benefit-description"
                      value={editor.description}
                      maxLength={HERO_BENEFIT_DESCRIPTION_MAX}
                      className={controlClassName}
                      disabled={busy}
                      onChange={(event) => setEditor({ ...editor, description: event.target.value })}
                    />
                  </div>
                  <IconPicker value={editor.icon} disabled={busy} onChange={(icon) => setEditor({ ...editor, icon })} />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editor.published}
                      disabled={busy}
                      onChange={(event) => setEditor({ ...editor, published: event.target.checked })}
                    />
                    Published
                  </label>
                </div>
                <BenefitPreview editor={editor} />
              </div>
              <FormError message={editorError ?? undefined} />
              <div className="mt-4 flex gap-2">
                <Button type="submit" className="rounded-lg" disabled={busy}>
                  {busy ? 'Saving…' : editor.id ? 'Save benefit' : 'Add benefit'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-lg"
                  disabled={busy}
                  onClick={() => {
                    setEditor(null)
                    setEditorError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
