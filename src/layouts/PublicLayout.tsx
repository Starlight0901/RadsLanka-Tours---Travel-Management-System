import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer.tsx'
import { Header } from '@/components/layout/Header.tsx'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton.tsx'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-ink">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
