import { useCallback } from 'react'

import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradePriceImpact } from 'modules/trade'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { useHandleSwap, useTradeFlowType } from 'modules/tradeFlow'
import { FlowType } from 'modules/tradeFlow'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useEthFlowContext } from './useEthFlowContext'
import { useSwapFlowContext } from './useSwapFlowContext'

import { ethFlow } from '../services/ethFlow'

export function useHandleSwapOrEthFlow() {
  const priceImpactParams = useTradePriceImpact()
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const tradeFlowType = useTradeFlowType()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()

  const [deadline] = useUserTransactionTTL()
  const { callback: handleSwap, contextIsReady } = useHandleSwap(useSafeMemoObject({ deadline }))

  const callback = useCallback(() => {
    if (!swapFlowContext) return

    if (tradeFlowType === FlowType.EOA_ETH_FLOW) {
      if (!ethFlowContext) throw new Error('Eth flow context is not ready')

      logTradeFlow('ETH FLOW', 'Start eth flow')
      return ethFlow(swapFlowContext, ethFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
    }

    return handleSwap()
  }, [swapFlowContext, ethFlowContext, handleSwap, tradeFlowType, priceImpactParams, confirmPriceImpactWithoutFee])

  return { callback, contextIsReady }
}
