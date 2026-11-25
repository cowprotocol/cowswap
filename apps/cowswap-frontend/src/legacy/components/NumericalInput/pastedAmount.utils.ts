export function normalizePastedAmount(pastedText: string): string {
  const text = pastedText.replace(/[^\d.,]/g, '')
  const lastSeparatorIndex = Math.max(text.lastIndexOf('.'), text.lastIndexOf(','))

  if (lastSeparatorIndex === -1) return text

  const separator = text[lastSeparatorIndex]
  const hasOtherSeparator = text.includes(separator === '.' ? ',' : '.')
  const isRepeated = text.indexOf(separator) !== lastSeparatorIndex

  if (isRepeated && !hasOtherSeparator) return text.replace(/[.,]/g, '')

  const integerPart = text.slice(0, lastSeparatorIndex).replace(/[.,]/g, '')
  const fractionPart = text.slice(lastSeparatorIndex + 1)

  return fractionPart ? `${integerPart}.${fractionPart}` : integerPart
}
