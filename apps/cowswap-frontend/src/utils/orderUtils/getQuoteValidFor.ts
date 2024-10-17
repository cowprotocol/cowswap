import ms from 'ms.macro'

const MAX_QUOTE_DURATION = ms`3h` - ms`1min`

export function getQuoteValidFor(validFor: number | undefined) {
  if (validFor) {
    return { validFor: Math.min(validFor, Math.floor(MAX_QUOTE_DURATION / 1000)) }
  }
  return
}
