import { normalizeError } from '@cowprotocol/common-utils'

import { TradeAmounts } from 'common/types'

import { SolanaWrapAndDelegateCallback } from '../../hooks/useSolanaWrapAndDelegateCallback'
import { TradeConfirmActions } from '../../hooks/useTradeConfirmActions'

export interface SolanaWrapAndDelegateFlowContext {
  tradeConfirmActions: TradeConfirmActions
  tradeAmounts: TradeAmounts
  wrapAndDelegate: SolanaWrapAndDelegateCallback
}

// Drives the trade confirm modal's pending/success/error lifecycle around the wrap+delegate transaction,
// the same way swapFlow/ethFlow drive it for EVM. Order creation isn't part of this flow yet.
export async function solanaWrapAndDelegateFlow(context: SolanaWrapAndDelegateFlowContext): Promise<boolean> {
  const { tradeConfirmActions, tradeAmounts, wrapAndDelegate } = context

  tradeConfirmActions.onSign(tradeAmounts)

  try {
    const result = await wrapAndDelegate()

    if (!result) {
      // User rejected in their wallet — quietly return to the review screen instead of showing an error.
      tradeConfirmActions.onOpen()
      return false
    }

    tradeConfirmActions.onSuccess(result.hash)
    return true
  } catch (err: unknown) {
    tradeConfirmActions.onError(normalizeError(err).message)
    return false
  }
}
