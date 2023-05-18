import { SafeBundleFlowContext, TradeFlowContext } from '@cow/modules/limitOrders/services/types'
import { useTokenContract } from '@src/hooks/useContract'
import { useTradeSpenderAddress } from '@cow/common/hooks/useTradeSpenderAddress'
import { useSafeAppsSdk } from '@cow/modules/wallet/web3-react/hooks/useSafeAppsSdk'

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
