import { OrderKind } from '@cowprotocol/cow-sdk'
import { useEthFlowContract } from 'hooks/useContract'
import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { EthFlowContext } from 'modules/swap/services/types'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useCallback } from 'react'
import {
  addInFlightOrderIdAtom,
  ethFlowInFlightOrderIdsAtom,
} from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'
import { useAtomValue, useSetAtom } from 'jotai'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSetup()
  const addTransaction = useTransactionAdder()

  const ethFlowInFlightOrderIds = useAtomValue(ethFlowInFlightOrderIdsAtom)
  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkInFlightOrderIdExists = useCallback(
    (orderId: string) => ethFlowInFlightOrderIds.includes(orderId),
    [ethFlowInFlightOrderIds]
  )

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.chainId ? NATIVE_CURRENCY_BUY_TOKEN[baseProps.chainId] : undefined,
    kind: OrderKind.SELL,
  })

  if (!baseContext || !contract || baseProps.flowType !== FlowType.ETH_FLOW) return null

  return {
    ...baseContext,
    contract,
    addTransaction,
    checkInFlightOrderIdExists,
    addInFlightOrderId,
  }
}
