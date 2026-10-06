import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { toWhatsAppUrl } from '@/utils/whatsapp.ts'

export function WhatsAppButton() {
  const whatsappUrl = toWhatsAppUrl(siteConfig.whatsapp)

  const className =
    'fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp lg:bottom-5'

  if (whatsappUrl) {
    return (
      <a
        href={whatsappUrl}
        className={className}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    )
  }

  return (
    <Link to={paths.contact} className={className} aria-label="Contact us on WhatsApp">
      <MessageCircle className="h-6 w-6" />
    </Link>
  )
}
