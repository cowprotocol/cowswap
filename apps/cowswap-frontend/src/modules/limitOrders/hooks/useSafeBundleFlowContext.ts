import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { SafeBundleFlowContext, TradeFlowContext } from 'modules/limitOrders/services/types'

export function useSafeBundleFlowContext(tradeContext: TradeFlowContext | null): SafeBundleFlowContext | null {
  const spender = useTradeSpenderAddress()
  const sendBatchTransactions = useSendBatchTransactions()

  return useMemo(() => {
    if (!tradeContext || !spender) {
      return null
    }

    return { ...tradeContext, spender, sendBatchTransactions }
  }, [tradeContext, spender, sendBatchTransactions])
}
