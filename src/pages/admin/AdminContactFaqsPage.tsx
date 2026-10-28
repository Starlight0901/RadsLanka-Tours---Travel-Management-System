import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  createContactFaq,
  deleteContactFaq,
  listAllContactFaqs,
  reorderContactFaqs,
  setContactFaqPublished,
  updateContactFaq,
  type ContactFaqInput,
  type ContactFaqRecord,
} from '@/services/firebase/contactFaqs.ts'
import { cn } from '@/utils/cn.ts'

type FormState = {
  question: string
  answer: string
  order: string
  published: boolean
}

const emptyForm = (): FormState => ({
  question: '',
  answer: '',
  order: '',
  published: false,
})

const controlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2'

const rowButtonClassName =
  'inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function toForm(item: ContactFaqRecord): FormState {
  return {
    question: item.question,
    answer: item.answer,
    order: String(item.order),
    published: item.published,
  }
}

function toInput(form: FormState, fallbackOrder: number): ContactFaqInput {
  const order = form.order.trim() === '' ? fallbackOrder : Number(form.order)
  return {
    question: form.question,
    answer: form.answer,
    order: Number.isFinite(order) ? order : fallbackOrder,
    published: form.published,
  }
}

export function AdminContactFaqsPage() {
  const [records, setRecords] = useState<ContactFaqRecord[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function refresh() {
    setRecords(await listAllContactFaqs())
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    listAllContactFaqs()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(errorMessage(loadError, 'Contact FAQs could not be loaded.'))
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

  function beginEdit(item: ContactFaqRecord) {
    setEditingId(item.id)
    setForm(toForm(item))
    setFieldError(null)
    setStatus(null)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm())
    setFieldError(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldError(null)
    setStatus(null)
    setSaving(true)
    try {
      const nextOrder = records.reduce((max, item) => Math.max(max, item.order), -1) + 1
      const input = toInput(form, nextOrder)
      if (editingId) {
        await updateContactFaq(editingId, input)
        setStatus('FAQ saved.')
      } else {
        await createContactFaq(input)
        setStatus('FAQ added.')
      }
      await refresh()
      resetForm()
    } catch (submitError) {
      setFieldError(errorMessage(submitError, 'Unable to save this FAQ.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(item: ContactFaqRecord) {
    if (!window.confirm(`Delete “${item.question || 'this FAQ'}”?`)) {
      return
    }
    setError(null)
    setStatus(null)
    try {
      await deleteContactFaq(item.id)
      if (editingId === item.id) {
        resetForm()
      }
      await refresh()
      setStatus('FAQ deleted.')
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this FAQ.'))
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
    setError(null)
    setStatus(null)
    try {
      await reorderContactFaqs(ids)
      await refresh()
      setStatus('Order saved.')
    } catch (moveError) {
      setError(errorMessage(moveError, 'Unable to reorder FAQs.'))
    }
  }

  async function togglePublished(item: ContactFaqRecord) {
    setError(null)
    setStatus(null)
    try {
      await setContactFaqPublished(item.id, !item.published)
      await refresh()
      setStatus(item.published ? 'FAQ unpublished.' : 'FAQ published.')
    } catch (toggleError) {
      setError(errorMessage(toggleError, 'Unable to update this FAQ.'))
    }
  }

  return (
    <>
      <PageMeta title="Contact FAQs" description="Manage the FAQs shown on the Contact Us page." />
      <AdminHeader title="Contact FAQs" />
      <div className="space-y-6 p-6">
        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add the Firebase web config before managing Contact FAQs."
          />
        ) : null}
        {error ? <ErrorState title="Something went wrong" message={error} /> : null}

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5" noValidate>
          <h2 className="text-base font-semibold text-slate-900">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label htmlFor="contact-faq-question" className="mb-1.5 block text-sm font-medium text-slate-700">
                Question
              </label>
              <input
                id="contact-faq-question"
                value={form.question}
                className={controlClassName}
                disabled={saving}
                onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="contact-faq-answer" className="mb-1.5 block text-sm font-medium text-slate-700">
                Answer
              </label>
              <textarea
                id="contact-faq-answer"
                rows={6}
                value={form.answer}
                className={controlClassName}
                disabled={saving}
                onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
              />
            </div>
            <div className="max-w-xs">
              <label htmlFor="contact-faq-order" className="mb-1.5 block text-sm font-medium text-slate-700">
                Display order
              </label>
              <input
                id="contact-faq-order"
                type="number"
                value={form.order}
                className={controlClassName}
                disabled={saving}
                placeholder={editingId ? undefined : 'Assigned automatically if left blank'}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.published}
              disabled={saving}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
            />
            Published
          </label>
          <FormError message={fieldError ?? undefined} />
          <div className="mt-4 flex gap-2">
            <Button type="submit" className="rounded-lg" disabled={saving || !isFirebaseConfigured}>
              {saving ? 'Saving…' : editingId ? 'Save FAQ' : 'Add FAQ'}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" className="rounded-lg" disabled={saving} onClick={resetForm}>
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

        {loading ? <LoadingState label="Loading FAQs" /> : null}
        {!loading && records.length === 0 ? (
          <EmptyState title="No FAQs yet" message="Add a question when you are ready. None are created automatically." />
        ) : null}
        {!loading && records.length > 0 ? (
          <ul className="space-y-3">
            {records.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3',
                  editingId === item.id ? 'border-slate-900' : 'border-slate-200',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.question || 'Untitled question'}</p>
                  <p className="truncate text-sm text-slate-500">{item.answer || 'No answer yet'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {!item.published ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Draft</span>
                  ) : null}
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={saving || index === 0}
                    aria-label={`Move “${item.question || 'FAQ'}” up`}
                    onClick={() => void move(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                    Up
                  </button>
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={saving || index === records.length - 1}
                    aria-label={`Move “${item.question || 'FAQ'}” down`}
                    onClick={() => void move(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                    Down
                  </button>
                  <button
                    type="button"
                    className={rowButtonClassName}
                    disabled={saving}
                    onClick={() => void togglePublished(item)}
                  >
                    {item.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className={rowButtonClassName} disabled={saving} onClick={() => beginEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={cn(rowButtonClassName, 'text-red-700 hover:bg-red-50')}
                    disabled={saving}
                    onClick={() => void onDelete(item)}
                  >
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
