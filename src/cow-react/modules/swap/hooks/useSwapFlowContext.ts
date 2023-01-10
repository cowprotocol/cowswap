import { TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/contracts'
import { SwapFlowContext } from '@cow/modules/swap/services/types'
import { useGP2SettlementContract } from 'hooks/useContract'
import { getFlowContext, useBaseFlowContextSetup } from '@cow/modules/swap/hooks/useFlowContext'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContextSetup()

  if (!baseProps.trade) return null

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })

  if (!contract || !baseContext || baseProps.isEthFlow) return null

  return {
    ...baseContext,
    contract,
  }
}
