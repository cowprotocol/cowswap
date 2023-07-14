import { getIsMessageIncludeToken } from './getIsMessageIncludeToken'

export function getQuoteUnsupportedToken(
  error: { description: string },
  quoteData: { sellToken: string | null; buyToken: string | null }
): string | null {
  return (
    (quoteData.sellToken && getIsMessageIncludeToken(error.description, quoteData.sellToken)) ||
    (quoteData.buyToken && getIsMessageIncludeToken(error.description, quoteData.buyToken))
  )
}
