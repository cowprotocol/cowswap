const SEPARATORS = /[.,]/g

export function normalizePastedAmount(pastedText: string): string {
  const text = pastedText.replace(/[^\d.,]/g, '')
  const body = text.replace(/[.,]+$/, '')
  const trailingSeparator = text.charAt(body.length)
  const decimalIndex = Math.max(body.lastIndexOf('.'), body.lastIndexOf(','))

  if (decimalIndex === -1 || (trailingSeparator && !body.includes(trailingSeparator))) {
    return body.replace(SEPARATORS, '')
  }

  const separator = body[decimalIndex]
  const isRepeated = body.indexOf(separator) !== decimalIndex
  const hasOtherSeparator = body.includes(separator === '.' ? ',' : '.')

  if (isRepeated && !hasOtherSeparator) return body.replace(SEPARATORS, '')

  return `${body.slice(0, decimalIndex).replace(SEPARATORS, '')}.${body.slice(decimalIndex + 1)}`
}
