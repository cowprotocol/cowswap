import { isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'

import { isSolanaQuoteAndPost } from 'modules/tradeQuote'

import { SolanaTradeFlowContextParams } from '../types/SolanaContextKey'

export function getIsSolanaTradeFlowContextReady(params: SolanaTradeFlowContextParams): boolean {
  const {
    chainId,
    account,
    inputAmount,
    outputAmount,
    quote,
    isFinalQuote,
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
      isFinalQuote &&
      uiOrderType &&
      orderKind &&
      validTo > 0 &&
      hasSolanaSigner,
  )
}
