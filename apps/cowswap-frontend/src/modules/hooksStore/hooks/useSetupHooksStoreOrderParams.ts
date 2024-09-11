import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { useSwapFlowContext } from 'modules/swap/hooks/useSwapFlowContext'

import { useSetOrderParams } from './useSetOrderParams'

export function useSetupHooksStoreOrderParams() {
  const swapFlowContext = useSwapFlowContext()
  const setOrderParams = useSetOrderParams()
  const orderParams = swapFlowContext?.orderParams

  useEffect(() => {
    if (!orderParams) return

    setOrderParams({
      validTo: orderParams.validTo,
      sellTokenAddress: getCurrencyAddress(orderParams.inputAmount.currency),
      buyTokenAddress: getCurrencyAddress(orderParams.outputAmount.currency),
    })
  }, [orderParams])
}
