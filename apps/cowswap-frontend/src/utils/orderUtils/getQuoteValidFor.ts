export function getQuoteValidFor(validFor: number | undefined) {
  return validFor ? { validFor } : undefined
}
