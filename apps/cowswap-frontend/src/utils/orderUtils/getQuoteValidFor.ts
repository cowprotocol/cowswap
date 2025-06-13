// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getQuoteValidFor(validFor: number | undefined) {
  return validFor ? { validFor } : undefined
}
