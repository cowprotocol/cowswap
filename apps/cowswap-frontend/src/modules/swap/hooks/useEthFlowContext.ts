import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { useEthFlowContract } from 'legacy/hooks/useContract'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { EthFlowContext } from 'modules/swap/services/types'
import {
  addInFlightOrderIdAtom,
  ethFlowInFlightOrderIdsAtom,
} from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'

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

  if (!baseContext || !contract || baseProps.flowType !== FlowType.EOA_ETH_FLOW) return null

  return {
    ...baseContext,
    contract,
    addTransaction,
    checkInFlightOrderIdExists,
    addInFlightOrderId,
  }
}
