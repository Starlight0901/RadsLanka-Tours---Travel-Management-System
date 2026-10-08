import type { TourPricingBasis } from '@/types/models.ts'

export const pricingBasisOptions: { value: TourPricingBasis; label: string }[] = [
  { value: 'per_person', label: 'Per person' },
  { value: 'for_2', label: 'For 2 people' },
  { value: 'for_4', label: 'For 4 people' },
  { value: 'custom', label: 'Custom' },
]

export function isPricingBasis(value: unknown): value is TourPricingBasis {
  return value === 'per_person' || value === 'for_2' || value === 'for_4' || value === 'custom'
}

export function formatLkrAmount(price: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(price)
}

export function pricingBasisNote(basis: TourPricingBasis, customLabel: string): string {
  if (basis === 'custom') {
    return customLabel.trim()
  }
  if (basis === 'for_2') {
    return 'for 2 people'
  }
  if (basis === 'for_4') {
    return 'for 4 people'
  }
  return 'per person'
}

export function pricingPreview(price: number, basis: TourPricingBasis, customLabel: string): string {
  if (!Number.isFinite(price)) {
    return ''
  }

  const amount = `From LKR ${formatLkrAmount(price)}`
  if (basis === 'per_person') {
    return `${amount} / person`
  }
  if (basis === 'for_2') {
    return `${amount} / 2 people`
  }
  if (basis === 'for_4') {
    return `${amount} / 4 people`
  }

  const custom = customLabel.trim()
  return custom ? `${amount} — ${custom}` : amount
}
