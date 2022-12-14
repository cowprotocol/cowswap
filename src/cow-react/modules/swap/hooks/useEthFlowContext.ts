import { OrderKind } from '@cowprotocol/contracts'
import { useEthFlowContract } from 'hooks/useContract'
import { useBaseFlowContextSetup, getFlowContext } from '@cow/modules/swap/hooks/useFlowContext'
import { EthFlowContext } from '@cow/modules/swap/services/common/types'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSetup()
  const addTransaction = useTransactionAdder()

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.chainId ? NATIVE_CURRENCY_BUY_TOKEN[baseProps.chainId] : undefined,
    kind: OrderKind.SELL,
  })

  if (!baseContext || !contract || !baseProps.isEthFlow) return null

  return {
    ...baseContext,
    contract,
    addTransaction,
  }
}
