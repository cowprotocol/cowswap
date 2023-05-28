import { SafeBundleFlowContext, TradeFlowContext } from 'modules/limitOrders/services/types'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { useTokenContract } from 'legacy/hooks/useContract'

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
