import { useTradeQuote } from './useTradeQuote'

export function useTradeQuoteProtocolFee(): number | undefined {
  const { quote } = useTradeQuote()
  const quoteResponse = quote?.quoteResults.quoteResponse

  return quoteResponse?.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined
}
