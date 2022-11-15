import { OrderKind } from '@cowprotocol/contracts'
import { useEthFlowContract } from 'hooks/useContract'
import { useBaseFlowContextSetup, getFlowContext } from '@cow/modules/swap/hooks/useFlowContext'
import { EthFlowContext } from '@cow/modules/swap/services/common/types'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSetup()

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.chainId ? WRAPPED_NATIVE_CURRENCY[baseProps.chainId] : undefined,
    kind: OrderKind.SELL,
  })

  if (!baseContext || !contract || !baseProps.isEthFlow) return null

  return {
    ...baseContext,
    contract,
  }
}
