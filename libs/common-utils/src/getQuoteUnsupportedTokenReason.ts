const REASON_REGEX = /is unsupported:(.*)$/i

export function getQuoteUnsupportedTokenReason(description: string): string | undefined {
  const reason = REASON_REGEX.exec(description)?.[1]?.trim()

  return reason || undefined
}
