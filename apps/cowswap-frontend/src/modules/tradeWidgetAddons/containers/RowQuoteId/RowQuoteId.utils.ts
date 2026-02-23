export type QuoteIdInput = string | number | null | undefined
export type QuoteExpirationInput = string | null | undefined

const QUOTE_REF_LENGTH = 8

export function getQuoteIdString(quoteId: QuoteIdInput): string | null {
  if (quoteId === null || quoteId === undefined) return null

  const parsedQuoteId = String(quoteId).trim()

  return parsedQuoteId.length ? parsedQuoteId : null
}

export function formatQuoteIdReference(quoteId: string): string {
  return `Q-${quoteId.slice(0, QUOTE_REF_LENGTH).toUpperCase()}`
}

export function getQuoteExpiresInLabel(expiration: QuoteExpirationInput, nowMs = Date.now()): string | null {
  if (!expiration) return null

  const expirationMs = Date.parse(expiration)

  if (!Number.isFinite(expirationMs)) return null

  const remainingSec = Math.max(0, Math.floor((expirationMs - nowMs) / 1000))

  if (remainingSec < 60) return `${remainingSec}s`

  const hours = Math.floor(remainingSec / 3600)
  const minutes = Math.floor((remainingSec % 3600) / 60)
  const seconds = remainingSec % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (seconds === 0) return `${minutes}m`

  return `${minutes}m ${seconds}s`
}
