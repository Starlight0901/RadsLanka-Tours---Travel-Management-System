import { useState } from 'react'
import { Container } from '@/components/ui/Container.tsx'
import { Modal } from '@/components/ui/Modal.tsx'
import type { PublicAboutTeamMember } from '@/services/firebase/about.ts'

type AboutTeamSectionProps = {
  members: PublicAboutTeamMember[]
}

function TeamPortrait({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return null
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}

function TeamMemberModal({
  member,
  onClose,
}: {
  member: PublicAboutTeamMember | null
  onClose: () => void
}) {
  return (
    <Modal open={Boolean(member)} title={member?.name ?? 'Team member'} onClose={onClose}>
      {member ? (
        <div>
          <TeamPortrait
            src={member.imageUrl}
            alt=""
            className="max-h-72 w-full rounded-2xl object-cover object-top sm:max-h-80"
          />
          {member.designation ? (
            <p className="mt-4 text-sm font-semibold tracking-[0.04em] text-eyebrow uppercase">{member.designation}</p>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-body text-muted">{member.description}</p>
        </div>
      ) : null}
    </Modal>
  )
}

function SingleMember({ member }: { member: PublicAboutTeamMember }) {
  return (
    <section className="py-16 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">OUR TEAM</p>
          <h2 className="mt-2 font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">{member.name}</h2>
          {member.designation ? (
            <p className="mt-2 text-sm font-semibold tracking-[0.04em] text-eyebrow uppercase">{member.designation}</p>
          ) : null}
          <p className="mt-6 whitespace-pre-line text-body text-muted">{member.description}</p>
        </div>
        <div className="h-72 overflow-hidden rounded-2xl bg-surface-mist sm:h-96 lg:h-[28rem]">
          <TeamPortrait src={member.imageUrl} alt="" className="h-full w-full object-cover object-top" />
        </div>
      </Container>
    </section>
  )
}

export function AboutTeamSection({ members }: AboutTeamSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (members.length === 0) {
    return null
  }

  if (members.length === 1 && members[0]) {
    return <SingleMember member={members[0]} />
  }

  const selected = members.find((member) => member.id === openId) ?? null

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <h2 className="font-display text-[2rem] font-semibold text-brand lg:text-[2.5rem]">Our Team</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface-elevated text-left shadow-card transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-haspopup="dialog"
                aria-expanded={openId === member.id}
                onClick={() => setOpenId(member.id)}
              >
                <span className="block aspect-[4/5] overflow-hidden bg-surface-mist">
                  <TeamPortrait
                    src={member.imageUrl}
                    alt=""
                    className="h-full w-full object-cover object-top transition duration-300 motion-safe:group-hover:scale-[1.03]"
                  />
                </span>
                <span className="block p-5">
                  <span className="block font-bold text-brand">{member.name}</span>
                  {member.designation ? (
                    <span className="mt-1 block text-sm text-muted">{member.designation}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <TeamMemberModal member={selected} onClose={() => setOpenId(null)} />
      </Container>
    </section>
  )
}
