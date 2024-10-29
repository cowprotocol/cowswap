import { useCallback } from 'react'

import { Field } from 'legacy/state/types'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { TradeWidgetActions, useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { useHandleSwap, useTradeFlowType } from 'modules/tradeFlow'
import { FlowType } from 'modules/tradeFlow'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useEthFlowContext } from './useEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'

import { ethFlow } from '../services/ethFlow'

export function useHandleSwapOrEthFlow(actions: TradeWidgetActions) {
  const priceImpactParams = useTradePriceImpact()
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const tradeFlowType = useTradeFlowType()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const { onUserInput, onChangeRecipient } = actions

  const [deadline] = useUserTransactionTTL()
  const { callback: handleSwap, contextIsReady } = useHandleSwap(useSafeMemoObject({ deadline }), actions)

  const callback = useCallback(async () => {
    if (!swapFlowContext) return

    if (tradeFlowType === FlowType.EOA_ETH_FLOW) {
      if (!ethFlowContext) throw new Error('Eth flow context is not ready')

      logTradeFlow('ETH FLOW', 'Start eth flow')
      const result = await ethFlow(swapFlowContext, ethFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)

      // Clean up form fields after successful swap
      if (result === true) {
        onChangeRecipient(null)
        onUserInput(Field.INPUT, '')
      }

      return result
    }

    return handleSwap()
  }, [
    swapFlowContext,
    ethFlowContext,
    handleSwap,
    tradeFlowType,
    priceImpactParams,
    confirmPriceImpactWithoutFee,
    onUserInput,
    onChangeRecipient,
  ])

  return { callback, contextIsReady }
}
