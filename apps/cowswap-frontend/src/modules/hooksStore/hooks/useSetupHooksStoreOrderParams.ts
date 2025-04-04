import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { useSwapFlowContext } from 'modules/swap'

import { useSetOrderParams } from './useSetOrderParams'

export function useSetupHooksStoreOrderParams() {
  const tradeFlowContext = useSwapFlowContext()
  const setOrderParams = useSetOrderParams()
  const orderParams = tradeFlowContext?.orderParams

  useEffect(() => {
    if (!orderParams) {
      setOrderParams(null)
    } else {
      setOrderParams({
        kind: orderParams.kind,
        validTo: orderParams.validTo,
        sellAmount: orderParams.inputAmount.quotient.toString(),
        buyAmount: orderParams.outputAmount.quotient.toString(),
        sellTokenAddress: getCurrencyAddress(orderParams.inputAmount.currency),
        buyTokenAddress: getCurrencyAddress(orderParams.outputAmount.currency),
        receiver: orderParams.recipient,
      })
    }
  }, [orderParams, setOrderParams])
}
