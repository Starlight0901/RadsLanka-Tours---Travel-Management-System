import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'

const metrics = [
  { label: 'Total tours', hint: 'Counts published and draft tours from Firestore' },
  { label: 'Destinations', hint: 'Destination documents' },
  { label: 'Vehicles', hint: 'Fleet records' },
  { label: 'Reviews', hint: 'Includes pending submissions' },
  { label: 'New inquiries', hint: 'Status = New' },
  { label: 'Bookings', hint: 'Phase 2 module — placeholder only' },
]

export function AdminDashboardPage() {
  return (
    <>
      <PageMeta
        title="Admin dashboard"
        description="Overview of tours, inquiries, and reviews for RadsLanka Tours."
      />
      <AdminHeader title="Dashboard" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-300">—</p>
              <p className="mt-2 text-xs text-slate-400">{metric.hint}</p>
            </article>
          ))}
        </div>
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Recent inquiries</h2>
          <p className="mt-2 text-sm text-slate-500">
            This list will load from Firestore once the inquiries module is implemented. Bookings remain a future
            Phase 2 module.
          </p>
        </section>
      </div>
    </>
  )
}
