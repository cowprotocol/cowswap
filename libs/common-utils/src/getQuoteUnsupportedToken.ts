import { getDoesMessageIncludeToken } from './getDoesMessageIncludeToken'

export function getQuoteUnsupportedToken(
  error: { description: string },
  quoteData: { sellToken: string | null; buyToken: string | null }
): string | null {
  return (
    (quoteData.sellToken && getDoesMessageIncludeToken(error.description, quoteData.sellToken)) ||
    (quoteData.buyToken && getDoesMessageIncludeToken(error.description, quoteData.buyToken))
  )
}
