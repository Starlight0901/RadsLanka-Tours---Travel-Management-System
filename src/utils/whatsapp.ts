export function toWhatsAppUrl(rawNumber: string): string | null {
  let digits = rawNumber.replace(/\D/g, '')
  if (!digits) {
    return null
  }

  if (digits.startsWith('0')) {
    const national = digits.replace(/^0+/, '')
    if (!national) {
      return null
    }
    digits = `94${national}`
  }

  if (digits.length < 10 || digits.length > 15) {
    return null
  }

  return `https://wa.me/${digits}`
}
