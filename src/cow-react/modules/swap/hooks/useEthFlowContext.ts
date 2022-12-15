import { OrderKind } from '@cowprotocol/contracts'
import { useEthFlowContract } from 'hooks/useContract'
import { useBaseFlowContextSetup, getFlowContext } from '@cow/modules/swap/hooks/useFlowContext'
import { EthFlowContext } from '@cow/modules/swap/services/types'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useCallback } from 'react'
import {
  ethFlowInFlightOrderIdsAtom,
  addInFlightOrderIdAtom,
} from '@cow/modules/swap/state/EthFlow/ethFlowInFlightOrderIds'
import { useSetAtom, useAtom } from 'jotai'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSetup()
  const addTransaction = useTransactionAdder()

  const [ethFlowInFlightOrderIds] = useAtom(ethFlowInFlightOrderIdsAtom)
  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  // TODO: Nitpic: Detect also collisions using the API (orderId exists)
  const existsOrderId = useCallback(
    (orderId: string) => ethFlowInFlightOrderIds.includes(orderId),
    [ethFlowInFlightOrderIds]
  )

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
    existsOrderId,
    addInFlightOrderId,
  }
}
