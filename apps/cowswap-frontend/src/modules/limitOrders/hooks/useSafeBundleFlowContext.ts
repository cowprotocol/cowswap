import { useSafeAppsSdk } from '@cowprotocol/wallet'

import { SafeBundleFlowContext, TradeFlowContext } from 'modules/limitOrders/services/types'

import { useTokenContract } from 'common/hooks/useContract'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export function useSafeBundleFlowContext(tradeContext: TradeFlowContext | null): SafeBundleFlowContext | null {
  const sellToken = tradeContext?.postOrderParams.sellToken
  const erc20Contract = useTokenContract(sellToken?.address)
  const spender = useTradeSpenderAddress()
  const safeAppsSdk = useSafeAppsSdk()

  if (!tradeContext || !erc20Contract || !spender || !safeAppsSdk) {
    return null
  }

  return { ...tradeContext, erc20Contract, spender, safeAppsSdk }
}
