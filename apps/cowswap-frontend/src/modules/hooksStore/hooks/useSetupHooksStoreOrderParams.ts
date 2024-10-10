import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradeFlowContext } from 'modules/trade'

import { useSetOrderParams } from './useSetOrderParams'

export function useSetupHooksStoreOrderParams() {
  const [deadline] = useUserTransactionTTL()
  const tradeFlowContext = useTradeFlowContext({ deadline })
  const setOrderParams = useSetOrderParams()
  const orderParams = tradeFlowContext?.orderParams

  useEffect(() => {
    if (!orderParams) return

    setOrderParams({
      validTo: orderParams.validTo,
      sellTokenAddress: getCurrencyAddress(orderParams.inputAmount.currency),
      buyTokenAddress: getCurrencyAddress(orderParams.outputAmount.currency),
    })
  }, [orderParams])
}
