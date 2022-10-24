import { OrderKind } from '@cowprotocol/contracts'
import { useEthFlowContract } from 'hooks/useContract'
import { useBaseFlowContext, getFlowContext } from '@cow/modules/swap/hooks/useFlowContext'
import { EthFlowContext } from '@cow/modules/swap/services/swapFlow/types'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContext()

  if (!baseProps.trade) return null

  return getFlowContext({
    baseProps,
    conditionalCheck: !baseProps.isEthFlow,
    contract,
    sellToken: baseProps.trade.inputAmount.currency,
    kind: OrderKind.SELL,
  })
}
