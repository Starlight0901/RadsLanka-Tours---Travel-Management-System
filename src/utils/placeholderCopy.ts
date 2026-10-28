/** True for bracketed Figma annotations such as "[Detail from Figma]". */
export function isPlaceholderCopy(value: string | undefined | null): boolean {
  const text = value?.trim() ?? ''
  if (!text) {
    return false
  }
  return /^\[[^\]]+\]$/.test(text) || /from Figma/i.test(text) || text.startsWith('[MOCK]')
}

export function visibleCopy(value: string | undefined | null): string | undefined {
  const text = value?.trim()
  if (!text || isPlaceholderCopy(text)) {
    return undefined
  }
  return text
}
