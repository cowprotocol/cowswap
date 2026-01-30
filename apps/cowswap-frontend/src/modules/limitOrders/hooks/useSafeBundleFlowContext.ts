import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { SafeBundleFlowContext, TradeFlowContext } from 'modules/limitOrders/services/types'

import { useTokenContract } from 'common/hooks/useContract'

export function useSafeBundleFlowContext(tradeContext: TradeFlowContext | null): SafeBundleFlowContext | null {
  const sellToken = tradeContext?.postOrderParams.sellToken
  const { contract: erc20Contract } = useTokenContract(sellToken?.address)
  const spender = useTradeSpenderAddress()
  const sendBatchTransactions = useSendBatchTransactions()

  return useMemo(() => {
    if (!tradeContext || !erc20Contract || !spender) {
      return null
    }

    return { ...tradeContext, erc20Contract, spender, sendBatchTransactions }
  }, [tradeContext, erc20Contract, spender, sendBatchTransactions])
}
