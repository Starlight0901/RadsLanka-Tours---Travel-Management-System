import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'

type AdminPlaceholderPageProps = {
  title: string
  description: string
}

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <>
      <PageMeta title={`Admin · ${title}`} description={description} />
      <AdminHeader title={title} />
      <div className="p-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Phase 1 placeholder
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
    </>
  )
}
