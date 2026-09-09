import { OrderKind } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { isSolanaQuoteAndPost } from 'modules/tradeQuote'

import { SolanaContextKey, SolanaContextKeyParams } from '../types/SolanaContextKey'

/**
 * Narrows every optional dependency in one place, so the SWR key is either complete or absent — the flow
 * must never run with a partially resolved context.
 */
export function buildSolanaContextKey(params: SolanaContextKeyParams): SolanaContextKey | null {
  const { isReady, account, quote, inputAmount, outputAmount, solana, sellToken } = params

  if (!isReady || !account || !solana || !sellToken || !inputAmount || !outputAmount) return null
  if (!isSolanaQuoteAndPost(quote)) return null

  return [
    account,
    params.chainId,
    quote,
    inputAmount,
    outputAmount,
    params.uiOrderType as UiOrderType,
    params.orderKind as OrderKind,
    params.validTo,
    params.recipient,
    params.recipientAddress,
    params.closeModals,
    params.dispatch,
    params.addTransaction,
    params.tradeConfirmActions,
    solana,
    sellToken,
    params.currentDelegation ?? 0n,
    params.delegationAmount,
    params.isNativeSell,
  ] as const
}
