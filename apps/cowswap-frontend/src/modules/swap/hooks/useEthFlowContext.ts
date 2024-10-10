import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { getFlowContext, useBaseFlowContextSource } from 'modules/swap/hooks/useFlowContext'
import { EthFlowContext } from 'modules/swap/services/types'
import { addInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'

import { useEthFlowContract } from 'common/hooks/useContract'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'

import { FlowType } from '../types/flowContext'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSource()
  const addTransaction = useTransactionAdder()

  const sellToken = baseProps?.chainId ? NATIVE_CURRENCIES[baseProps.chainId as SupportedChainId] : undefined

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  const baseContext = useMemo(
    () =>
      baseProps &&
      getFlowContext({
        baseProps,
        sellToken,
        kind: OrderKind.SELL,
      }),
    [baseProps, sellToken],
  )

  return useMemo(() => {
    if (!baseContext || !contract || baseProps?.flowType !== FlowType.EOA_ETH_FLOW) return null

    return {
      ...baseContext,
      contract,
      addTransaction,
      checkEthFlowOrderExists,
      addInFlightOrderId,
    }
  }, [baseContext, contract, addTransaction, checkEthFlowOrderExists, addInFlightOrderId, baseProps?.flowType])
}
