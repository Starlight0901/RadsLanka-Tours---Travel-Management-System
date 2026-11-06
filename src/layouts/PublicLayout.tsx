import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer.tsx'
import { Header } from '@/components/layout/Header.tsx'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton.tsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return undefined
    }

    const id = hash.slice(1)
    let attempts = 0
    let timer = 0
    const tryScroll = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (attempts < 20) {
        attempts += 1
        timer = window.setTimeout(tryScroll, 50)
      }
    }
    tryScroll()
    return () => window.clearTimeout(timer)
  }, [hash, pathname])

  return null
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-surface text-ink">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
