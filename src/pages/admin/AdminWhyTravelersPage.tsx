import { useEffect, useState, type FormEvent } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  createWhyTravelerItem,
  deleteWhyTravelerItem,
  listAllWhyTravelerItems,
  updateWhyTravelerItem,
  type WhyTravelerInput,
  type WhyTravelerRecord,
} from '@/services/firebase/whyTravelers.ts'

const iconOptions = [
  { value: 'groups', label: 'Group' },
  { value: 'hotel', label: 'Stay' },
  { value: 'badge', label: 'Badge' },
  { value: 'support_agent', label: 'Concierge' },
  { value: 'auto_awesome', label: 'Sparkle' },
  { value: 'payments', label: 'Pricing' },
  { value: 'explore', label: 'Explore' },
  { value: 'favorite', label: 'Heart' },
  { value: 'local_florist', label: 'Nature' },
  { value: 'directions_car', label: 'Vehicle' },
]

type FormState = {
  title: string
  description: string
  icon: string
  order: string
  published: boolean
}

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  icon: 'groups',
  order: '0',
  published: false,
})

const controlClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2'

function toForm(item: WhyTravelerRecord): FormState {
  return {
    title: item.title,
    description: item.description,
    icon: item.icon || 'auto_awesome',
    order: String(item.order),
    published: item.published,
  }
}

function toInput(form: FormState): WhyTravelerInput {
  const order = Number(form.order)
  return {
    title: form.title,
    description: form.description,
    icon: form.icon,
    order: Number.isFinite(order) ? order : 0,
    published: form.published,
  }
}

export function AdminWhyTravelersPage() {
  const [records, setRecords] = useState<WhyTravelerRecord[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function refresh() {
    const next = await listAllWhyTravelerItems()
    setRecords(next)
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    listAllWhyTravelerItems()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch(() => {
        if (active) {
          setError('Why Travelers items could not be loaded.')
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

  function beginEdit(item: WhyTravelerRecord) {
    setEditingId(item.id)
    setForm(toForm(item))
    setFieldError(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldError(null)
    setSaving(true)
    try {
      const input = toInput(form)
      if (editingId) {
        await updateWhyTravelerItem(editingId, input)
      } else {
        const nextOrder = records.reduce((max, item) => Math.max(max, item.order), -1) + 1
        await createWhyTravelerItem({ ...input, order: form.order.trim() === '' ? nextOrder : input.order })
      }
      await refresh()
      setForm(emptyForm())
      setEditingId(null)
    } catch (submitError) {
      setFieldError(submitError instanceof Error ? submitError.message : 'Unable to save this item.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(item: WhyTravelerRecord) {
    if (!window.confirm(`Delete “${item.title || 'this item'}”?`)) {
      return
    }
    try {
      await deleteWhyTravelerItem(item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      await refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this item.')
    }
  }

  function fields(item: WhyTravelerRecord, patch: Partial<WhyTravelerInput> = {}): WhyTravelerInput {
    return {
      title: item.title,
      description: item.description,
      icon: item.icon,
      published: item.published,
      order: item.order,
      ...patch,
    }
  }

  async function move(item: WhyTravelerRecord, direction: -1 | 1) {
    const index = records.findIndex((record) => record.id === item.id)
    const neighbor = records[index + direction]
    if (!neighbor) {
      return
    }
    try {
      await updateWhyTravelerItem(item.id, fields(item, { order: neighbor.order }))
      await updateWhyTravelerItem(neighbor.id, fields(neighbor, { order: item.order }))
      await refresh()
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Unable to reorder items.')
    }
  }

  async function togglePublished(item: WhyTravelerRecord) {
    try {
      await updateWhyTravelerItem(item.id, fields(item, { published: !item.published }))
      await refresh()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update this item.')
    }
  }

  const knownIcons = iconOptions.some((option) => option.value === form.icon)
    ? iconOptions
    : [...iconOptions, { value: form.icon, label: form.icon || 'Custom' }]

  return (
    <>
      <PageMeta title="Why Travelers" description="Manage the Why Travelers Choose RadsLanka cards." />
      <AdminHeader title="Why Travelers" />
      <div className="space-y-6 p-6">
        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add the Firebase web config before managing Why Travelers items."
          />
        ) : null}
        {error ? <ErrorState title="Something went wrong" message={error} /> : null}

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">{editingId ? 'Edit item' : 'Add item'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="why-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="why-title"
                value={form.title}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="why-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="why-description"
                rows={3}
                value={form.description}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="why-icon" className="mb-1.5 block text-sm font-medium text-slate-700">
                Icon
              </label>
              <select
                id="why-icon"
                value={form.icon}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
              >
                {knownIcons.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="why-order" className="mb-1.5 block text-sm font-medium text-slate-700">
                Order
              </label>
              <input
                id="why-order"
                type="number"
                value={form.order}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
            />
            Published
          </label>
          <FormError message={fieldError ?? undefined} />
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={saving || !isFirebaseConfigured}>
              {editingId ? 'Save item' : 'Add item'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm())
                  setFieldError(null)
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        {loading ? <LoadingState label="Loading items" /> : null}
        {!loading && records.length === 0 ? (
          <EmptyState title="No items yet" message="Add a reason travelers choose RadsLanka." />
        ) : null}
        {!loading && records.length > 0 ? (
          <ul className="space-y-3">
            {records.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon name={item.icon || 'auto_awesome'} className="text-[20px] text-slate-700" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="truncate text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="text-sm text-slate-600" disabled={index === 0} onClick={() => move(item, -1)}>
                    Up
                  </button>
                  <button
                    type="button"
                    className="text-sm text-slate-600"
                    disabled={index === records.length - 1}
                    onClick={() => move(item, 1)}
                  >
                    Down
                  </button>
                  <button type="button" className="text-sm font-medium text-slate-900" onClick={() => togglePublished(item)}>
                    {item.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="text-sm font-medium text-slate-900" onClick={() => beginEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="text-sm font-medium text-red-700" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  )
}
