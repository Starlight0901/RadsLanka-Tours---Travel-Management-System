import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AboutApproachEditor } from '@/components/admin/about/AboutApproachEditor.tsx'
import { AboutDistinctionEditor } from '@/components/admin/about/AboutDistinctionEditor.tsx'
import { AboutHeroEditor } from '@/components/admin/about/AboutHeroEditor.tsx'
import { AboutOriginsEditor } from '@/components/admin/about/AboutOriginsEditor.tsx'
import { AboutTeamEditor } from '@/components/admin/about/AboutTeamEditor.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

const tabs = [
  { id: 'hero', label: 'Hero' },
  { id: 'distinction', label: 'RadsLanka Distinction' },
  { id: 'origins', label: 'Our Origins' },
  { id: 'team', label: 'Our Team' },
  { id: 'approach', label: 'Our Approach' },
] as const

type TabId = (typeof tabs)[number]['id']

export function AdminAboutPage() {
  const [tab, setTab] = useState<TabId>('hero')

  return (
    <>
      <PageMeta title="About Us" description="Manage the About Us page content for RadsLanka Tours." />
      <AdminHeader title="About Us" />
      <div className="space-y-6 p-6">
        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add the Firebase web config before managing About Us content."
          />
        ) : (
          <>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              Save each section on its own. The Why discerning travelers cards are managed in{' '}
              <Link to={paths.admin.whyTravelers} className="font-medium text-slate-900 underline">
                Why Travelers
              </Link>
              , not here.
            </p>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="tablist" aria-label="About Us sections">
              {tabs.map((item) => {
                const selected = item.id === tab
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium',
                      selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                    )}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
              <div hidden={tab !== 'hero'}>
                <h2 className="text-base font-semibold text-slate-900">Hero</h2>
                <p className="mt-1 mb-5 text-sm text-slate-600">Title, optional description, and optional hero image.</p>
                <AboutHeroEditor />
              </div>
              <div hidden={tab !== 'distinction'}>
                <h2 className="text-base font-semibold text-slate-900">RadsLanka Distinction</h2>
                <p className="mt-1 mb-5 text-sm text-slate-600">
                  Catchphrase, supporting description, and up to six facts with the original Material Symbols icons.
                </p>
                <AboutDistinctionEditor />
              </div>
              <div hidden={tab !== 'origins'}>
                <h2 className="text-base font-semibold text-slate-900">Our Origins</h2>
                <p className="mt-1 mb-5 text-sm text-slate-600">
                  Publication, image, copy, historical journey baseline, and the fixed ownership statistic.
                </p>
                <AboutOriginsEditor />
              </div>
              <div hidden={tab !== 'team'}>
                <h2 className="text-base font-semibold text-slate-900">Our Team</h2>
                <p className="mt-1 mb-5 text-sm text-slate-600">Add, edit, reorder, publish, or delete team members.</p>
                <AboutTeamEditor />
              </div>
              <div hidden={tab !== 'approach'}>
                <h2 className="text-base font-semibold text-slate-900">Our Approach</h2>
                <p className="mt-1 mb-5 text-sm text-slate-600">
                  Add, edit, reorder, or soft-delete approaches. Deleted records can be restored.
                </p>
                <AboutApproachEditor />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
