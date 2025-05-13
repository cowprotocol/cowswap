import { getDoesMessageIncludeToken } from './getDoesMessageIncludeToken'

export function getQuoteUnsupportedToken(
  error: { description: string },
  quoteData: { sellTokenAddress: string | null; buyTokenAddress: string | null },
): string | null {
  return (
    (quoteData.sellTokenAddress && getDoesMessageIncludeToken(error.description, quoteData.sellTokenAddress)) ||
    (quoteData.buyTokenAddress && getDoesMessageIncludeToken(error.description, quoteData.buyTokenAddress))
  )
}
