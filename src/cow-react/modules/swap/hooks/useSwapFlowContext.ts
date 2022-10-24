import { TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/contracts'
import { SwapFlowContext } from '@cow/modules/swap/services/common/types'
import { useGP2SettlementContract } from 'hooks/useContract'
import { getFlowContext, useBaseFlowContext } from '@cow/modules/swap/hooks/useFlowContext'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContext()

  if (!baseProps.trade) return null

  return getFlowContext({
    baseProps,
    conditionalCheck: baseProps.isEthFlow,
    contract,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })
}
