import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { useSetOrderParams } from './useSetOrderParams'

import { useSwapFlowContext } from '../../swap/hooks/useSwapFlowContext'

export function useSetupHooksStoreOrderParams() {
  const tradeFlowContext = useSwapFlowContext()
  const setOrderParams = useSetOrderParams()
  const orderParams = tradeFlowContext?.orderParams

  useEffect(() => {
    if (!orderParams) {
      setOrderParams(null)
    } else {
      setOrderParams({
        validTo: orderParams.validTo,
        sellTokenAddress: getCurrencyAddress(orderParams.inputAmount.currency),
        buyTokenAddress: getCurrencyAddress(orderParams.outputAmount.currency),
      })
    }
  }, [orderParams, setOrderParams])
}
