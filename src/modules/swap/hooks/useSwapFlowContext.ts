import { TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { SwapFlowContext } from 'modules/swap/services/types'
import { useGP2SettlementContract } from 'hooks/useContract'
import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContextSetup()

  if (!baseProps.trade) return null

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })

  if (!contract || !baseContext || baseProps.flowType !== FlowType.REGULAR) return null

  return {
    ...baseContext,
    contract,
  }
}
