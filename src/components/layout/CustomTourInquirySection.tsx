import { BadgeDollarSign, Check, ShieldCheck } from 'lucide-react'
import inquiryBackground from '@/assets/home_inquiry_form_background.png'
import { CustomTourInquiryForm } from '@/components/forms/CustomTourInquiryForm.tsx'
import { Container } from '@/components/ui/Container.tsx'

const benefits = [
  { label: '100% Customizable', icon: Check },
  { label: 'No Hidden Charges', icon: ShieldCheck },
  { label: 'Best Price Guarantee', icon: BadgeDollarSign },
]

export function CustomTourInquirySection() {
  return (
    <section className="relative grid overflow-x-clip bg-ocean-950">
      <img
        src={inquiryBackground}
        alt=""
        className="col-start-1 row-start-1 block h-auto w-full max-w-full"
      />
      <div className="col-start-1 row-start-1 flex items-center">
        <Container className="w-full py-8 sm:py-12 lg:py-16">
          <div className="inquiry-float-card rounded-[1.75rem] border border-white/70 bg-cream-50 p-5 shadow-[0_4px_18px_rgba(15,61,76,0.08),0_22px_50px_rgba(15,61,76,0.16)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="text-left lg:w-[38%]">
                <h2 className="font-display text-4xl leading-tight text-ocean-900 sm:text-5xl">
                  Plan Your Dream Sri Lankan Holiday
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-500 sm:text-base">
                  Tell us your travel details and we will create the perfect tour package for you.
                </p>
                <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap">
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon
                    return (
                      <li
                        key={benefit.label}
                        className="flex items-center gap-2 text-xs font-semibold text-ocean-900 sm:text-sm"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        <span>{benefit.label}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="min-w-0 lg:w-[62%]">
                <CustomTourInquiryForm className="rounded-none bg-transparent p-0 shadow-none" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
