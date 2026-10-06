export function toWhatsAppUrl(rawNumber: string): string | null {
  const digits = rawNumber.replace(/\D/g, '')
  if (!digits) {
    return null
  }

  return `https://wa.me/${digits}`
}
