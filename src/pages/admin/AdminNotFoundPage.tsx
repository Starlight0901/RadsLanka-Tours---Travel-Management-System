import { Link } from 'react-router-dom'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { paths } from '@/routes/paths.ts'

export function AdminNotFoundPage() {
  return (
    <>
      <PageMeta title="Admin page not found" description="This admin route does not exist." />
      <AdminHeader title="Not found" />
      <div className="p-6">
        <p className="text-sm text-slate-600">That admin page does not exist yet.</p>
        <Link to={paths.admin.root} className="mt-3 inline-block text-sm font-medium text-slate-900 underline">
          Return to dashboard
        </Link>
      </div>
    </>
  )
}
