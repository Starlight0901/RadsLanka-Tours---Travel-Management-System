import { useEffect, useId, useState } from 'react'
import { Container } from '@/components/ui/Container.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { listPublishedContactFaqs, type ContactFaqRecord } from '@/services/firebase/contactFaqs.ts'
import { cn } from '@/utils/cn.ts'

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: ContactFaqRecord
  open: boolean
  onToggle: () => void
}) {
  const reactId = useId()
  const buttonId = `${reactId}-button`
  const panelId = `${reactId}-panel`

  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <h3>
        <button
          type="button"
          id={buttonId}
          className="flex min-h-11 w-full items-center justify-between gap-4 text-left font-bold text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{faq.question}</span>
          <Icon
            name="expand_more"
            className={cn(
              'shrink-0 text-[22px] transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="mt-3 whitespace-pre-line break-words text-body text-muted">{faq.answer}</p>
        </div>
      </div>
    </div>
  )
}

export function ContactFaqsSection() {
  const [faqs, setFaqs] = useState<ContactFaqRecord[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    listPublishedContactFaqs()
      .then((items) => {
        if (active) {
          setFaqs(items.filter((item) => item.question.trim() && item.answer.trim()))
        }
      })
      .catch(() => {
        if (active) {
          setFaqs([])
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (!faqs || faqs.length === 0) {
    return null
  }

  return (
    <section className="bg-surface-elevated py-16 lg:py-24">
      <Container>
        <h2 className="font-display text-[2rem] font-semibold text-brand">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              open={openId === faq.id}
              onToggle={() => setOpenId((current) => (current === faq.id ? null : faq.id))}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
