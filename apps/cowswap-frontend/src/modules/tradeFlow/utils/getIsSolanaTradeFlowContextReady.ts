import { isSolanaAddress, isSolanaChain, PriceQuality } from '@cowprotocol/cow-sdk'

import { isSolanaQuoteAndPost } from 'modules/tradeQuote'

import { SolanaTradeFlowContextParams } from '../types/SolanaContextKey'

export function getIsSolanaTradeFlowContextReady(params: SolanaTradeFlowContextParams): boolean {
  const {
    chainId,
    account,
    inputAmount,
    outputAmount,
    quote,
    priceQuality,
    uiOrderType,
    orderKind,
    validTo,
    hasSolanaSigner,
  } = params

  return Boolean(
    isSolanaChain(chainId) &&
      isSolanaAddress(account) &&
      inputAmount &&
      outputAmount &&
      isSolanaQuoteAndPost(quote) &&
      priceQuality === PriceQuality.OPTIMAL &&
      uiOrderType &&
      orderKind &&
      validTo > 0 &&
      hasSolanaSigner,
  )
}
